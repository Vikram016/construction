const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendWasteSandToSheet } = require('./googleSheets');

/**
 * Trigger: onWasteSandBookingCreated
 *
 * Fires whenever a document is added to `waste_sand_bookings`.
 * Sends the booking data to the "Waste Sand Bookings" tab in Google Sheets
 * via the configured webhook URL, then writes sync status back to Firestore.
 *
 * Firebase config key required:
 *   firebase functions:config:set sheets.waste_sand_webhook="<your Apps Script URL>"
 */
exports.onWasteSandBookingCreated = functions.firestore
  .document('waste_sand_bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const bookingData = snap.data();
    const bookingId   = context.params.bookingId;

    console.log(`[WasteSand] New booking created: ${bookingId}`, {
      name:     bookingData.name,
      phone:    bookingData.phone,
      quantity: bookingData.quantity,
      advance:  bookingData.advance,
    });

    try {
      const dataWithId = { ...bookingData, id: bookingId };

      // Send to Google Sheets
      const result = await sendWasteSandToSheet(dataWithId);

      // Write sync status back to the booking document
      await snap.ref.update({
        'googleSheets.sheetSync': {
          success:   result.success,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error:     result.error || null,
        },
      });

      console.log(`[WasteSand] Booking ${bookingId} synced to Google Sheets:`, result.success);
    } catch (error) {
      console.error(`[WasteSand] Failed to sync booking ${bookingId}:`, error);

      await snap.ref.update({
        'googleSheets.sheetSync': {
          success:   false,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error:     error.message,
        },
      });
    }

    return null;
  });

/**
 * HTTPS Callable: resendWasteSandToSheet
 *
 * Lets an admin manually re-push a booking to Google Sheets from the
 * admin dashboard if the original sync failed.
 *
 * Usage (client):
 *   const fn = httpsCallable(functions, 'resendWasteSandToSheet');
 *   await fn({ bookingId: 'abc123' });
 */
exports.resendWasteSandToSheet = functions.https.onCall(async (data, context) => {
  // Must be authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // Must be admin
  const userDoc = await admin
    .firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can resend bookings'
    );
  }

  const { bookingId } = data;
  if (!bookingId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'bookingId is required'
    );
  }

  try {
    const doc = await admin
      .firestore()
      .collection('waste_sand_bookings')
      .doc(bookingId)
      .get();

    if (!doc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Booking ${bookingId} not found`
      );
    }

    const bookingData = { ...doc.data(), id: bookingId };
    const result      = await sendWasteSandToSheet(bookingData);

    await doc.ref.update({
      'googleSheets.sheetSync': {
        success:      result.success,
        timestamp:    admin.firestore.FieldValue.serverTimestamp(),
        error:        result.error || null,
        manualResend: true,
        resendBy:     context.auth.uid,
      },
    });

    return {
      success:   result.success,
      bookingId,
      message: result.success
        ? 'Booking successfully resent to Google Sheets'
        : `Failed to resend: ${result.error}`,
    };
  } catch (error) {
    console.error('[WasteSand] resendWasteSandToSheet error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Scheduled: retryFailedWasteSandSyncs
 *
 * Runs every 6 hours and retries any bookings whose sheet sync failed
 * within the last 24 hours.
 */
exports.retryFailedWasteSandSyncs = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async () => {
    console.log('[WasteSand] Starting retry of failed sheet syncs…');

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const failedSnap = await admin
        .firestore()
        .collection('waste_sand_bookings')
        .where('googleSheets.sheetSync.success', '==', false)
        .where('googleSheets.sheetSync.timestamp', '>=', oneDayAgo)
        .limit(25)
        .get();

      console.log(`[WasteSand] ${failedSnap.size} failed syncs to retry`);

      const retryResults = await Promise.all(
        failedSnap.docs.map(async (doc) => {
          try {
            const data   = { ...doc.data(), id: doc.id };
            const result = await sendWasteSandToSheet(data);

            await doc.ref.update({
              'googleSheets.sheetSync': {
                success:   result.success,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                error:     result.error || null,
                retried:   true,
              },
            });

            return { id: doc.id, success: result.success };
          } catch (err) {
            console.error(`[WasteSand] Retry failed for ${doc.id}:`, err);
            return { id: doc.id, success: false, error: err.message };
          }
        })
      );

      const successCount = retryResults.filter((r) => r.success).length;
      console.log(`[WasteSand] Retry complete: ${successCount}/${retryResults.length} succeeded`);

      return { total: retryResults.length, successful: successCount };
    } catch (error) {
      console.error('[WasteSand] retryFailedWasteSandSyncs error:', error);
      return { error: error.message };
    }
  });

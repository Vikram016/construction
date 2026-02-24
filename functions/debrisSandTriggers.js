/**
 * debrisSandTriggers.js
 *
 * Cloud Functions for Debris Sand bookings — mirrors wasteSandTriggers.js exactly.
 *
 * Exports:
 *   onDebrisSandBookingCreated  — Firestore onCreate → Google Sheets
 *   resendDebrisSandToSheet     — HTTPS callable (admin manual resend)
 *   retryFailedDebrisSandSyncs  — Scheduled every 6 hours
 *
 * Setup:
 *   1. firebase functions:config:set sheets.debris_sand_webhook="<Apps Script URL>"
 *   2. firebase deploy --only functions:onDebrisSandBookingCreated,resendDebrisSandToSheet,retryFailedDebrisSandSyncs
 *
 * Google Sheets tab name: "Debris Sand Bookings"
 * Apps Script: see GoogleAppsScript_DebrisSand.js
 */

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const { sendDebrisSandToSheet } = require('./googleSheets');

/* ─── 1. onCreate: new booking → Google Sheets ───────────────────────────── */

exports.onDebrisSandBookingCreated = functions.firestore
  .document('debris_sand_bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const bookingData = snap.data();
    const bookingId   = context.params.bookingId;

    console.log(`[DebrisSand] New booking created: ${bookingId}`, {
      name:     bookingData.name,
      phone:    bookingData.phone,
      quantity: bookingData.quantity,
      advance:  bookingData.advance,
    });

    try {
      const result = await sendDebrisSandToSheet({ ...bookingData, id: bookingId });

      await snap.ref.update({
        'googleSheets.sheetSync': {
          success:   result.success,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error:     result.error || null,
        },
      });

      console.log(`[DebrisSand] Booking ${bookingId} synced to Google Sheets:`, result.success);
    } catch (error) {
      console.error(`[DebrisSand] Failed to sync ${bookingId}:`, error);
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

/* ─── 2. HTTPS callable: admin manual resend ─────────────────────────────── */

exports.resendDebrisSandToSheet = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can resend bookings');
  }

  const { bookingId } = data;
  if (!bookingId) {
    throw new functions.https.HttpsError('invalid-argument', 'bookingId is required');
  }

  try {
    const doc = await admin.firestore().collection('debris_sand_bookings').doc(bookingId).get();
    if (!doc.exists) {
      throw new functions.https.HttpsError('not-found', `Booking ${bookingId} not found`);
    }

    const result = await sendDebrisSandToSheet({ ...doc.data(), id: bookingId });

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
    console.error('[DebrisSand] resendDebrisSandToSheet error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/* ─── 3. Scheduled: retry failed syncs every 6 hours ────────────────────── */

exports.retryFailedDebrisSandSyncs = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async () => {
    console.log('[DebrisSand] Starting retry of failed sheet syncs…');

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const failedSnap = await admin.firestore()
        .collection('debris_sand_bookings')
        .where('googleSheets.sheetSync.success', '==', false)
        .where('googleSheets.sheetSync.timestamp', '>=', oneDayAgo)
        .limit(25)
        .get();

      console.log(`[DebrisSand] ${failedSnap.size} failed syncs to retry`);

      const results = await Promise.all(
        failedSnap.docs.map(async (doc) => {
          try {
            const result = await sendDebrisSandToSheet({ ...doc.data(), id: doc.id });
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
            console.error(`[DebrisSand] Retry failed for ${doc.id}:`, err);
            return { id: doc.id, success: false, error: err.message };
          }
        })
      );

      const ok = results.filter(r => r.success).length;
      console.log(`[DebrisSand] Retry complete: ${ok}/${results.length} succeeded`);
      return { total: results.length, successful: ok };
    } catch (error) {
      console.error('[DebrisSand] retryFailedDebrisSandSyncs error:', error);
      return { error: error.message };
    }
  });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendInquiryToSheet } = require('./googleSheets');

/**
 * Trigger when new estimate is created (Cost Calculator)
 * Sends estimate data to Inquiry Google Sheet
 */
exports.onEstimateCreated = functions.firestore
  .document('estimates/{estimateId}')
  .onCreate(async (snap, context) => {
    const estimateData = snap.data();
    const estimateId = context.params.estimateId;

    console.log(`New estimate created: ${estimateId}`, {
      estimateNumber: estimateData.estimateNumber,
      city: estimateData.location?.city
    });

    try {
      // Add estimateId and type to data
      const dataWithId = { 
        ...estimateData, 
        id: estimateId,
        type: 'estimate'
      };
      
      // Send to Google Sheets asynchronously
      const result = await sendInquiryToSheet(dataWithId);

      // Update estimate with sync status
      await snap.ref.update({
        'googleSheets.inquirySync': {
          success: result.success,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error: result.error || null
        }
      });

      console.log(`Estimate ${estimateId} synced to Google Sheets:`, result.success);
    } catch (error) {
      console.error(`Failed to sync estimate ${estimateId} to Google Sheets:`, error);
      
      // Log error but don't fail the estimate creation
      await snap.ref.update({
        'googleSheets.inquirySync': {
          success: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error: error.message
        }
      });
    }

    return null;
  });

/**
 * Trigger when new inquiry is created (Contact Form / WhatsApp)
 * Sends inquiry data to Inquiry Google Sheet
 */
exports.onInquiryCreated = functions.firestore
  .document('inquiries/{inquiryId}')
  .onCreate(async (snap, context) => {
    const inquiryData = snap.data();
    const inquiryId = context.params.inquiryId;

    console.log(`New inquiry created: ${inquiryId}`, {
      source: inquiryData.source,
      name: inquiryData.name
    });

    try {
      // Add inquiryId to data
      const dataWithId = { ...inquiryData, id: inquiryId };
      
      // Send to Google Sheets asynchronously
      const result = await sendInquiryToSheet(dataWithId);

      // Update inquiry with sync status
      await snap.ref.update({
        'googleSheets.inquirySync': {
          success: result.success,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error: result.error || null
        }
      });

      console.log(`Inquiry ${inquiryId} synced to Google Sheets:`, result.success);
    } catch (error) {
      console.error(`Failed to sync inquiry ${inquiryId} to Google Sheets:`, error);
      
      // Log error but don't fail the inquiry creation
      await snap.ref.update({
        'googleSheets.inquirySync': {
          success: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error: error.message
        }
      });
    }

    return null;
  });

/**
 * HTTPS Callable function for manual resend from admin dashboard
 */
exports.resendInquiryToSheet = functions.https.onCall(async (data, context) => {
  // Verify admin access
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // Check if user is admin
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'User must be an admin'
    );
  }

  const { inquiryId, collection } = data;

  if (!inquiryId || !collection) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'inquiryId and collection are required'
    );
  }

  // collection should be 'inquiries' or 'estimates'
  if (collection !== 'inquiries' && collection !== 'estimates') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'collection must be "inquiries" or "estimates"'
    );
  }

  try {
    // Fetch inquiry/estimate from Firestore
    const doc = await admin.firestore().collection(collection).doc(inquiryId).get();

    if (!doc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `${collection} ${inquiryId} not found`
      );
    }

    const inquiryData = { 
      ...doc.data(), 
      id: inquiryId,
      type: collection === 'estimates' ? 'estimate' : doc.data().type || 'inquiry'
    };

    // Send to Google Sheets
    const result = await sendInquiryToSheet(inquiryData);

    // Update with sync status
    await doc.ref.update({
      'googleSheets.inquirySync': {
        success: result.success,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: result.error || null,
        manualResend: true,
        resendBy: context.auth.uid
      }
    });

    return {
      success: result.success,
      inquiryId: inquiryId,
      message: result.success 
        ? 'Inquiry successfully sent to Google Sheets' 
        : `Failed to send inquiry: ${result.error}`
    };

  } catch (error) {
    console.error('Error in resendInquiryToSheet:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message
    );
  }
});

/**
 * Scheduled function to retry failed inquiry syncs (optional)
 * Runs every 6 hours
 */
exports.retryFailedInquirySyncs = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    console.log('Starting retry of failed inquiry syncs...');

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Retry failed estimates
      const failedEstimates = await admin.firestore()
        .collection('estimates')
        .where('googleSheets.inquirySync.success', '==', false)
        .where('googleSheets.inquirySync.timestamp', '>=', oneDayAgo)
        .limit(25)
        .get();

      // Retry failed inquiries
      const failedInquiries = await admin.firestore()
        .collection('inquiries')
        .where('googleSheets.inquirySync.success', '==', false)
        .where('googleSheets.inquirySync.timestamp', '>=', oneDayAgo)
        .limit(25)
        .get();

      console.log(`Found ${failedEstimates.size} failed estimates and ${failedInquiries.size} failed inquiries to retry`);

      const retryPromises = [];

      // Retry estimates
      failedEstimates.docs.forEach(doc => {
        retryPromises.push(
          (async () => {
            try {
              const data = { ...doc.data(), id: doc.id, type: 'estimate' };
              const result = await sendInquiryToSheet(data);

              await doc.ref.update({
                'googleSheets.inquirySync': {
                  success: result.success,
                  timestamp: admin.firestore.FieldValue.serverTimestamp(),
                  error: result.error || null,
                  retried: true
                }
              });

              return { id: doc.id, type: 'estimate', success: result.success };
            } catch (error) {
              console.error(`Retry failed for estimate ${doc.id}:`, error);
              return { id: doc.id, type: 'estimate', success: false, error: error.message };
            }
          })()
        );
      });

      // Retry inquiries
      failedInquiries.docs.forEach(doc => {
        retryPromises.push(
          (async () => {
            try {
              const data = { ...doc.data(), id: doc.id };
              const result = await sendInquiryToSheet(data);

              await doc.ref.update({
                'googleSheets.inquirySync': {
                  success: result.success,
                  timestamp: admin.firestore.FieldValue.serverTimestamp(),
                  error: result.error || null,
                  retried: true
                }
              });

              return { id: doc.id, type: 'inquiry', success: result.success };
            } catch (error) {
              console.error(`Retry failed for inquiry ${doc.id}:`, error);
              return { id: doc.id, type: 'inquiry', success: false, error: error.message };
            }
          })()
        );
      });

      const results = await Promise.all(retryPromises);
      const successCount = results.filter(r => r.success).length;

      console.log(`Retry complete: ${successCount}/${results.length} successful`);

      return { total: results.length, successful: successCount };

    } catch (error) {
      console.error('Error in retryFailedInquirySyncs:', error);
      return { error: error.message };
    }
  });

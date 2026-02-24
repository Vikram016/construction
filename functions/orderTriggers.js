const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendPurchaseToSheet } = require('./googleSheets');

/**
 * Trigger when order is created with paid status
 * Sends order data to Purchase Google Sheet
 */
exports.onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const orderId = context.params.orderId;

    console.log(`New order created: ${orderId}`, {
      orderNumber: orderData.orderNumber,
      paymentStatus: orderData.payment?.status
    });

    // Only send to sheet if payment is already confirmed
    if (orderData.payment?.status === 'Paid' || orderData.payment?.status === 'paid') {
      try {
        // Add orderId to data
        const dataWithId = { ...orderData, id: orderId };
        
        // Send to Google Sheets asynchronously
        const result = await sendPurchaseToSheet(dataWithId);

        // Update order with sync status
        await snap.ref.update({
          'googleSheets.purchaseSync': {
            success: result.success,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            error: result.error || null
          }
        });

        console.log(`Order ${orderId} synced to Google Sheets:`, result.success);
      } catch (error) {
        console.error(`Failed to sync order ${orderId} to Google Sheets:`, error);
        
        // Log error but don't fail the order creation
        await snap.ref.update({
          'googleSheets.purchaseSync': {
            success: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            error: error.message
          }
        });
      }
    }

    return null;
  });

/**
 * Trigger when order payment status changes to Paid
 * Sends order data to Purchase Google Sheet
 */
exports.onOrderPaymentConfirmed = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const orderId = context.params.orderId;

    // Check if payment status changed to Paid
    const paymentWasNotPaid = beforeData.payment?.status !== 'Paid' && beforeData.payment?.status !== 'paid';
    const paymentIsNowPaid = afterData.payment?.status === 'Paid' || afterData.payment?.status === 'paid';

    if (paymentWasNotPaid && paymentIsNowPaid) {
      console.log(`Payment confirmed for order: ${orderId}`, {
        orderNumber: afterData.orderNumber
      });

      try {
        // Add orderId to data
        const dataWithId = { ...afterData, id: orderId };
        
        // Send to Google Sheets asynchronously
        const result = await sendPurchaseToSheet(dataWithId);

        // Update order with sync status
        await change.after.ref.update({
          'googleSheets.purchaseSync': {
            success: result.success,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            error: result.error || null
          }
        });

        console.log(`Order ${orderId} synced to Google Sheets:`, result.success);
      } catch (error) {
        console.error(`Failed to sync order ${orderId} to Google Sheets:`, error);
        
        // Log error but don't fail the order update
        await change.after.ref.update({
          'googleSheets.purchaseSync': {
            success: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            error: error.message
          }
        });
      }
    }

    return null;
  });

/**
 * HTTPS Callable function for manual resend from admin dashboard
 */
exports.resendOrderToSheet = functions.https.onCall(async (data, context) => {
  // Verify admin access
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // Check if user is admin (you should implement this check properly)
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'User must be an admin'
    );
  }

  const { orderId } = data;

  if (!orderId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'orderId is required'
    );
  }

  try {
    // Fetch order from Firestore
    const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `Order ${orderId} not found`
      );
    }

    const orderData = { ...orderDoc.data(), id: orderId };

    // Send to Google Sheets
    const result = await sendPurchaseToSheet(orderData);

    // Update order with sync status
    await orderDoc.ref.update({
      'googleSheets.purchaseSync': {
        success: result.success,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: result.error || null,
        manualResend: true,
        resendBy: context.auth.uid
      }
    });

    return {
      success: result.success,
      orderId: orderId,
      message: result.success 
        ? 'Order successfully sent to Google Sheets' 
        : `Failed to send order: ${result.error}`
    };

  } catch (error) {
    console.error('Error in resendOrderToSheet:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message
    );
  }
});

/**
 * Scheduled function to retry failed syncs (optional)
 * Runs every 6 hours
 */
exports.retryFailedOrderSyncs = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    console.log('Starting retry of failed order syncs...');

    try {
      // Find orders with failed Google Sheets sync in the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const failedSyncs = await admin.firestore()
        .collection('orders')
        .where('payment.status', '==', 'Paid')
        .where('googleSheets.purchaseSync.success', '==', false)
        .where('googleSheets.purchaseSync.timestamp', '>=', oneDayAgo)
        .limit(50) // Process max 50 at a time
        .get();

      console.log(`Found ${failedSyncs.size} failed syncs to retry`);

      const retryPromises = failedSyncs.docs.map(async (doc) => {
        try {
          const orderData = { ...doc.data(), id: doc.id };
          const result = await sendPurchaseToSheet(orderData);

          // Update sync status
          await doc.ref.update({
            'googleSheets.purchaseSync': {
              success: result.success,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              error: result.error || null,
              retried: true
            }
          });

          return { orderId: doc.id, success: result.success };
        } catch (error) {
          console.error(`Retry failed for order ${doc.id}:`, error);
          return { orderId: doc.id, success: false, error: error.message };
        }
      });

      const results = await Promise.all(retryPromises);
      const successCount = results.filter(r => r.success).length;

      console.log(`Retry complete: ${successCount}/${results.length} successful`);

      return { total: results.length, successful: successCount };

    } catch (error) {
      console.error('Error in retryFailedOrderSyncs:', error);
      return { error: error.message };
    }
  });

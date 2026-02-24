const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {
  generateInvoiceNumber,
  createInvoicePDF,
  uploadInvoiceToStorage
} = require('./invoiceService');

/**
 * 📄 GENERATE INVOICE AFTER ORDER CONFIRMATION
 * 
 * Triggers: When order status becomes 'confirmed' OR payment status becomes 'Paid'
 * 
 * Actions:
 * 1. Generate invoice number
 * 2. Create PDF
 * 3. Upload to Firebase Storage
 * 4. Update order with invoice URL
 * 5. Trigger WhatsApp with invoice link
 */
exports.generateInvoiceOnOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const orderId = context.params.orderId;

    // Check if invoice already generated
    if (afterData.invoice?.invoiceUrl) {
      console.log(`Invoice already exists for order: ${afterData.orderNumber}`);
      return null;
    }

    // Check if order is confirmed or paid
    const isConfirmed = afterData.status === 'confirmed' && beforeData.status !== 'confirmed';
    const isPaid = afterData.payment?.status === 'Paid' && beforeData.payment?.status !== 'Paid';

    if (!isConfirmed && !isPaid) {
      return null; // Not the right trigger
    }

    console.log(`Generating invoice for order: ${afterData.orderNumber}`);

    try {
      // Step 1: Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();
      console.log(`Invoice number generated: ${invoiceNumber}`);

      // Step 2: Create PDF
      const orderData = { ...afterData, id: orderId };
      const pdfBuffer = await createInvoicePDF(orderData, invoiceNumber);
      console.log('Invoice PDF created');

      // Step 3: Upload to Firebase Storage
      const invoiceUrl = await uploadInvoiceToStorage(pdfBuffer, invoiceNumber);
      console.log(`Invoice uploaded: ${invoiceUrl}`);

      // Step 4: Update order with invoice details
      await change.after.ref.update({
        'invoice.invoiceNumber': invoiceNumber,
        'invoice.invoiceUrl': invoiceUrl,
        'invoice.generatedAt': admin.firestore.FieldValue.serverTimestamp(),
        'invoice.pdfBuffer': null // Don't store buffer in Firestore
      });

      console.log(`Invoice generation complete for order: ${afterData.orderNumber}`);

      return {
        success: true,
        invoiceNumber: invoiceNumber,
        invoiceUrl: invoiceUrl
      };

    } catch (error) {
      console.error('Error generating invoice:', error);

      // Update order with error status
      await change.after.ref.update({
        'invoice.error': error.message,
        'invoice.failedAt': admin.firestore.FieldValue.serverTimestamp()
      });

      // Don't throw error - log and continue
      return {
        success: false,
        error: error.message
      };
    }
  });

/**
 * 📄 GENERATE INVOICE IMMEDIATELY ON ORDER CREATION (Alternative)
 * 
 * Use this if you want invoice generated immediately when order is created
 * (even before payment confirmation)
 */
exports.generateInvoiceOnOrderCreation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const orderId = context.params.orderId;

    // Only generate if payment is already confirmed
    if (orderData.payment?.status !== 'Paid') {
      console.log(`Skipping invoice generation - payment not confirmed for: ${orderData.orderNumber}`);
      return null;
    }

    console.log(`Generating invoice for new order: ${orderData.orderNumber}`);

    try {
      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();

      // Create PDF
      const fullOrderData = { ...orderData, id: orderId };
      const pdfBuffer = await createInvoicePDF(fullOrderData, invoiceNumber);

      // Upload to Storage
      const invoiceUrl = await uploadInvoiceToStorage(pdfBuffer, invoiceNumber);

      // Update order
      await snap.ref.update({
        'invoice.invoiceNumber': invoiceNumber,
        'invoice.invoiceUrl': invoiceUrl,
        'invoice.generatedAt': admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Invoice generated on creation: ${invoiceNumber}`);

      return {
        success: true,
        invoiceNumber: invoiceNumber
      };

    } catch (error) {
      console.error('Error generating invoice on creation:', error);
      
      await snap.ref.update({
        'invoice.error': error.message,
        'invoice.failedAt': admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: false,
        error: error.message
      };
    }
  });

/**
 * 🔧 MANUAL INVOICE REGENERATION (for admin dashboard)
 * 
 * Allows admin to manually regenerate invoice if needed
 */
exports.regenerateInvoice = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify admin role
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'User must be an admin');
  }

  const { orderId } = data;

  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'orderId is required');
  }

  try {
    // Fetch order
    const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    const orderData = { ...orderDoc.data(), id: orderId };

    // Generate new invoice number (or reuse existing)
    const invoiceNumber = orderData.invoice?.invoiceNumber || await generateInvoiceNumber();

    // Create PDF
    const pdfBuffer = await createInvoicePDF(orderData, invoiceNumber);

    // Upload to Storage
    const invoiceUrl = await uploadInvoiceToStorage(pdfBuffer, invoiceNumber);

    // Update order
    await orderDoc.ref.update({
      'invoice.invoiceNumber': invoiceNumber,
      'invoice.invoiceUrl': invoiceUrl,
      'invoice.generatedAt': admin.firestore.FieldValue.serverTimestamp(),
      'invoice.regeneratedBy': context.auth.uid,
      'invoice.error': null
    });

    return {
      success: true,
      invoiceNumber: invoiceNumber,
      invoiceUrl: invoiceUrl,
      message: 'Invoice regenerated successfully'
    };

  } catch (error) {
    console.error('Error regenerating invoice:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * 🗑️ DELETE OLD INVOICES (Cleanup - Optional)
 * 
 * Scheduled function to delete invoices older than 1 year
 * (Only if you want to save storage costs)
 */
exports.cleanupOldInvoices = functions.pubsub
  .schedule('every 30 days')
  .onRun(async (context) => {
    console.log('Starting cleanup of old invoices...');

    try {
      const oneYearAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      );

      // Find orders with old invoices
      const oldOrders = await admin.firestore()
        .collection('orders')
        .where('invoice.generatedAt', '<', oneYearAgo)
        .limit(100)
        .get();

      console.log(`Found ${oldOrders.size} orders with old invoices`);

      const bucket = admin.storage().bucket();
      const deletePromises = [];

      oldOrders.docs.forEach(doc => {
        const invoiceNumber = doc.data().invoice?.invoiceNumber;
        if (invoiceNumber) {
          const fileName = `invoices/${invoiceNumber}.pdf`;
          deletePromises.push(
            bucket.file(fileName).delete().catch(err => {
              console.error(`Failed to delete ${fileName}:`, err);
            })
          );
        }
      });

      await Promise.all(deletePromises);

      console.log(`Cleanup complete: ${deletePromises.length} invoices deleted`);

      return { deleted: deletePromises.length };

    } catch (error) {
      console.error('Error in cleanup:', error);
      return { error: error.message };
    }
  });

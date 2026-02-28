/**
 * invoiceTriggers.js
 *
 * Fires on EVERY new order — regardless of payment method.
 * Generates invoice PDF → uploads to Storage → sends to customer via:
 *   - WhatsApp (download link in order confirmation message)
 *   - Email with PDF attached (if customer provided email)
 */

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const {
  generateInvoiceNumber,
  createInvoicePDF,
  uploadInvoiceToStorage,
  sendInvoiceToCustomer,
} = require('./invoiceService');

/* ── Helper: send WhatsApp message with invoice link ─────────────────────── */
const sendWhatsAppInvoice = async (orderData, invoiceUrl, invoiceNumber) => {
  const c       = orderData.customer || {};
  const pricing = orderData.pricing  || {};
  const items   = orderData.items    || [];

  const itemLines = items
    .map((item, i) => `${i + 1}. ${item.name || item.productName} x${item.quantity} ${item.unit || ''} = Rs.${((item.basePrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`)
    .join('\n');

  const phone = (c.phone || '').replace(/\D/g, '');
  const to    = phone.length === 10 ? '91' + phone : phone;

  if (!to || to.length < 10) {
    console.warn('[invoice] No valid phone — skipping WhatsApp');
    return;
  }

  const message = [
    '🧾 *Your BuildMart Invoice is Ready!*',
    '',
    `Order Ref: *${orderData.orderNumber || invoiceNumber}*`,
    `Invoice No: *${invoiceNumber}*`,
    '',
    '📦 *Items Ordered:*',
    itemLines,
    '',
    `💰 *Grand Total: Rs.${(pricing.grandTotal || 0).toLocaleString('en-IN')}*`,
    `💳 Payment: ${orderData.paymentMethod || 'WhatsApp Order'}`,
    '',
    '📄 *Download Your Invoice (PDF):*',
    invoiceUrl,
    '',
    '🚚 Delivery within 24-48 hours after confirmation.',
    'Our team will call you to confirm the delivery slot.',
    '',
    'Thank you for choosing BuildMart! 🏗️',
  ].join('\n');

  // Build WhatsApp URL — opens in customer's WhatsApp from their side
  // For automated sending you need Twilio/WATI configured in whatsappService.js
  // This stores the message on the order so whatsappNotifications.js picks it up
  await admin.firestore()
    .collection('orders')
    .doc(orderData.id)
    .update({
      'invoice.whatsappMessage': message,
      'invoice.whatsappTo':      to,
      'invoice.whatsappQueued':  true,
    });

  console.log(`[invoice] WhatsApp message queued for ${to}`);
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN TRIGGER — fires on every new order
   ════════════════════════════════════════════════════════════════════════════ */
exports.generateAndSendInvoiceOnOrderCreation = functions
  .runWith({ timeoutSeconds: 120, memory: '512MB' })
  .firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderId   = context.params.orderId;
    const orderData = { ...snap.data(), id: orderId };

    console.log(`[invoice] New order received: ${orderId}`);

    try {
      // ── Step 1: Generate invoice number ──────────────────────────────────
      const invoiceNumber = await generateInvoiceNumber();
      console.log(`[invoice] Invoice number: ${invoiceNumber}`);

      // ── Step 2: Build PDF ─────────────────────────────────────────────────
      const pdfBuffer = await createInvoicePDF(orderData, invoiceNumber);
      console.log(`[invoice] PDF created (${pdfBuffer.length} bytes)`);

      // ── Step 3: Upload to Firebase Storage ────────────────────────────────
      const invoiceUrl = await uploadInvoiceToStorage(pdfBuffer, invoiceNumber);
      console.log(`[invoice] Uploaded: ${invoiceUrl}`);

      // ── Step 4: Save invoice info on the order ────────────────────────────
      await snap.ref.update({
        'invoice.invoiceNumber': invoiceNumber,
        'invoice.invoiceUrl':    invoiceUrl,
        'invoice.generatedAt':   admin.firestore.FieldValue.serverTimestamp(),
        'invoice.sentTo':        orderData.customer?.email || null,
        'invoice.error':         null,
      });

      // ── Step 5: Send to customer ──────────────────────────────────────────
      // 5a. WhatsApp (stores message on order for pickup by notification trigger)
      await sendWhatsAppInvoice(orderData, invoiceUrl, invoiceNumber);

      // 5b. Email with PDF attached (if email provided)
      const deliveryResults = await sendInvoiceToCustomer({
        orderData,
        invoiceNumber,
        invoiceUrl,
        pdfBuffer,
      });

      // ── Step 6: Log delivery status ───────────────────────────────────────
      await snap.ref.update({
        'invoice.delivery': {
          whatsapp:     deliveryResults.whatsapp,
          email:        deliveryResults.email,
          emailSkipped: deliveryResults.emailSkipped || false,
          emailError:   deliveryResults.emailError   || null,
          deliveredAt:  admin.firestore.FieldValue.serverTimestamp(),
        },
      });

      console.log(`[invoice] Done for ${invoiceNumber}:`, deliveryResults);
      return { success: true, invoiceNumber, invoiceUrl };

    } catch (error) {
      console.error('[invoice] Failed:', error.message);
      await snap.ref.update({
        'invoice.error':    error.message,
        'invoice.failedAt': admin.firestore.FieldValue.serverTimestamp(),
      });
      return { success: false, error: error.message };
    }
  });

/* ════════════════════════════════════════════════════════════════════════════
   RESEND TRIGGER — fires when admin marks order as confirmed/paid
   Resends invoice with updated payment status
   ════════════════════════════════════════════════════════════════════════════ */
exports.resendInvoiceOnStatusChange = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before  = change.before.data();
    const after   = change.after.data();
    const orderId = context.params.orderId;

    // Only fire when status changes to confirmed/paid
    const statusChanged = after.status !== before.status &&
      (after.status === 'confirmed' || after.status === 'delivered');
    const paymentConfirmed = after.payment?.status === 'Paid' &&
      before.payment?.status !== 'Paid';

    if (!statusChanged && !paymentConfirmed) return null;

    // Must already have an invoice
    if (!after.invoice?.invoiceUrl) {
      console.log(`[invoice] No invoice on order ${orderId} yet — skipping resend`);
      return null;
    }

    console.log(`[invoice] Status changed to ${after.status} — resending invoice ${after.invoice.invoiceNumber}`);

    const orderData = { ...after, id: orderId };

    try {
      // Regenerate PDF with updated payment status
      const pdfBuffer  = await createInvoicePDF(orderData, after.invoice.invoiceNumber);
      const invoiceUrl = await uploadInvoiceToStorage(pdfBuffer, after.invoice.invoiceNumber);

      await sendInvoiceToCustomer({
        orderData,
        invoiceNumber: after.invoice.invoiceNumber,
        invoiceUrl,
        pdfBuffer,
      });

      await change.after.ref.update({
        'invoice.invoiceUrl':  invoiceUrl,
        'invoice.resentAt':    admin.firestore.FieldValue.serverTimestamp(),
        'invoice.resentStatus': after.status || after.payment?.status,
      });

      console.log(`[invoice] Resent for ${after.invoice.invoiceNumber}`);
      return { success: true };

    } catch (err) {
      console.error('[invoice] Resend failed:', err.message);
      return { success: false, error: err.message };
    }
  });

/* ════════════════════════════════════════════════════════════════════════════
   MANUAL ADMIN TRIGGER — callable from admin dashboard
   ════════════════════════════════════════════════════════════════════════════ */
exports.resendInvoiceManually = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }

  const { orderId } = data;
  if (!orderId) throw new functions.https.HttpsError('invalid-argument', 'orderId required');

  const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
  if (!orderDoc.exists) throw new functions.https.HttpsError('not-found', 'Order not found');

  const orderData     = { ...orderDoc.data(), id: orderId };
  const invoiceNumber = orderData.invoice?.invoiceNumber || await generateInvoiceNumber();

  try {
    const pdfBuffer  = await createInvoicePDF(orderData, invoiceNumber);
    const invoiceUrl = await uploadInvoiceToStorage(pdfBuffer, invoiceNumber);

    await sendInvoiceToCustomer({ orderData, invoiceNumber, invoiceUrl, pdfBuffer });
    await sendWhatsAppInvoice(orderData, invoiceUrl, invoiceNumber);

    await orderDoc.ref.update({
      'invoice.invoiceNumber': invoiceNumber,
      'invoice.invoiceUrl':    invoiceUrl,
      'invoice.resentAt':      admin.firestore.FieldValue.serverTimestamp(),
      'invoice.resentBy':      context.auth.uid,
      'invoice.error':         null,
    });

    return { success: true, invoiceNumber, invoiceUrl };

  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

/* ════════════════════════════════════════════════════════════════════════════
   CLEANUP — delete invoices older than 1 year (saves Storage costs)
   ════════════════════════════════════════════════════════════════════════════ */
exports.cleanupOldInvoices = functions.pubsub
  .schedule('every 30 days')
  .onRun(async () => {
    const oneYearAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    );

    const snapshot = await admin.firestore()
      .collection('orders')
      .where('invoice.generatedAt', '<', oneYearAgo)
      .limit(100)
      .get();

    const bucket   = admin.storage().bucket();
    const deletes  = snapshot.docs
      .map(doc => doc.data().invoice?.invoiceNumber)
      .filter(Boolean)
      .map(num => bucket.file(`invoices/${num}.pdf`).delete().catch(() => {}));

    await Promise.all(deletes);
    console.log(`[invoice] Cleaned up ${deletes.length} old invoices`);
    return { deleted: deletes.length };
  });

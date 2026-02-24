/**
 * razorpayWebhook.js
 *
 * COMPLETE PAYMENT NOTIFICATION FLOW:
 *
 *  Razorpay pays → POST /razorpayWebhook
 *       ↓  verifies signature
 *  Firestore: orders/{id}.payment.status = 'Paid'
 *       ↓  triggers onOrderPaymentConfirmed  (existing)
 *  → Google Sheets row added                (existing)
 *       ↓  triggers sendOrderConfirmationWhatsApp (existing)
 *  → Customer WhatsApp: "Payment received ✅ Order confirmed"
 *  → Admin  WhatsApp:   "New paid order from <name>"
 *
 * SETUP (one-time):
 *  1. Deploy this function:
 *       firebase deploy --only functions:razorpayWebhook
 *
 *  2. Copy the HTTPS URL from the deploy output, e.g.:
 *       https://us-central1-YOUR_PROJECT.cloudfunctions.net/razorpayWebhook
 *
 *  3. In Razorpay Dashboard → Settings → Webhooks → Add New Webhook:
 *       URL:    paste URL above
 *       Secret: any strong random string (e.g. openssl rand -hex 32)
 *       Events: ✅ payment.captured   ✅ payment.failed   ✅ order.paid
 *
 *  4. Save that same secret in Firebase config:
 *       firebase functions:config:set razorpay.webhook_secret="YOUR_SECRET"
 *       firebase functions:config:set razorpay.key_id="rzp_live_XXXXXXX"
 *       firebase functions:config:set razorpay.key_secret="YOUR_KEY_SECRET"
 *       firebase deploy --only functions
 */

const functions  = require('firebase-functions');
const admin      = require('firebase-admin');
const crypto     = require('crypto');
const { sendWhatsAppMessage } = require('./whatsappService');
const { CONTACT_CONFIG_SERVER } = require('./config/serverConfig');

/* ─── Signature verification ─────────────────────────────────────────────── */

/**
 * Razorpay signs every webhook payload with HMAC-SHA256.
 * We MUST verify this before trusting any data.
 * https://razorpay.com/docs/webhooks/validate-test/
 */
const verifyRazorpaySignature = (rawBody, signature, secret) => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
};

/* ─── WhatsApp message templates ─────────────────────────────────────────── */

const getPaymentConfirmedCustomerMessage = (orderData, payment) => `✅ *PAYMENT RECEIVED — BUILDMART*

Hi ${orderData.customer?.name || 'Customer'}! 🙏

Your payment has been confirmed and your order is now being processed.

━━━━━━━━━━━━━━━━━━
📋 *Order Details*
━━━━━━━━━━━━━━━━━━
🔖 Order ID:       *${orderData.orderNumber}*
💳 Payment ID:     ${payment.id}
💰 Amount Paid:    *₹${(payment.amount / 100).toLocaleString('en-IN')}*
📅 Date:           ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

📦 *Your Items:*
${(orderData.items || []).map(i => `  • ${i.productName} — ${i.quantity} ${i.unit}`).join('\n') || '  (see order details)'}

🚚 *What happens next?*
  1. We prepare your order
  2. Delivery scheduled within 24-48 hrs
  3. You'll get another message when it ships

📍 *Delivery to:* ${orderData.customer?.city || orderData.delivery?.city || 'Your location'}

📄 GST invoice will be shared on delivery.

🔍 *Track your order:*
https://buildmart.com/track/${orderData.id}

Need help? Just reply to this message 💬
*BuildMart — Premium Construction Materials* 🏗️`;

const getPaymentFailedCustomerMessage = (orderData, payment) => `⚠️ *PAYMENT FAILED — BUILDMART*

Hi ${orderData.customer?.name || 'Customer'},

Unfortunately your payment could not be processed.

💰 *Amount:* ₹${(payment.amount / 100).toLocaleString('en-IN')}
❌ *Reason:* ${payment.error_description || payment.error_reason || 'Payment declined'}
🔖 *Order ID:* ${orderData.orderNumber}

━━━━━━━━━━━━━━━━━━
🔁 *Try again:*
━━━━━━━━━━━━━━━━━━
${orderData.payment?.razorpayLink || 'Contact us for a new payment link'}

Or WhatsApp us and we'll send a fresh link right away.

📞 *BuildMart Support*
We're here to help! 🙏`;

const getNewPaidOrderAdminMessage = (orderData, payment) => `🎉 *NEW PAID ORDER — BUILDMART*

💳 *Payment Confirmed*
💰 Amount: ₹${(payment.amount / 100).toLocaleString('en-IN')}
🔖 Order: ${orderData.orderNumber}

👤 *Customer:*
  Name:  ${orderData.customer?.name}
  Phone: ${orderData.customer?.phone}
  City:  ${orderData.customer?.city || 'N/A'}

📦 *Items:*
${(orderData.items || []).map(i => `  • ${i.productName} — ${i.quantity} ${i.unit}`).join('\n')}

⚡ Action needed: Prepare and schedule delivery.`;

/* ─── Main webhook handler ───────────────────────────────────────────────── */

exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const webhookSecret = functions.config().razorpay?.webhook_secret;

  // ── 1. Verify signature ──────────────────────────────────────────────────
  if (webhookSecret) {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      console.error('[Razorpay] Missing signature header');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // req.rawBody is available in Cloud Functions for HTTPS triggers
    const rawBody = req.rawBody || JSON.stringify(req.body);

    try {
      const isValid = verifyRazorpaySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('[Razorpay] Invalid webhook signature — possible spoofing attempt');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (err) {
      console.error('[Razorpay] Signature verification error:', err.message);
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  } else {
    console.warn('[Razorpay] webhook_secret not configured — skipping signature check (set it in production!)');
  }

  // ── 2. Parse event ───────────────────────────────────────────────────────
  const event   = req.body.event;
  const payload = req.body.payload;

  console.log(`[Razorpay] Received event: ${event}`);

  // Respond immediately — Razorpay retries if we take >5s
  res.status(200).json({ received: true, event });

  // ── 3. Route events ──────────────────────────────────────────────────────
  try {
    if (event === 'payment.captured' || event === 'order.paid') {
      await handlePaymentCaptured(payload);
    } else if (event === 'payment.failed') {
      await handlePaymentFailed(payload);
    } else {
      console.log(`[Razorpay] Unhandled event type: ${event}`);
    }
  } catch (err) {
    // Don't throw — we already sent 200, just log
    console.error(`[Razorpay] Error processing ${event}:`, err.message, err.stack);
  }
});

/* ─── Handler: payment captured / order paid ─────────────────────────────── */

async function handlePaymentCaptured(payload) {
  const payment      = payload?.payment?.entity || payload?.order?.entity?.payments?.items?.[0] || {};
  const razorpayOrderId = payment.order_id || payload?.order?.entity?.id;

  if (!razorpayOrderId) {
    console.error('[Razorpay] No order_id in payload:', JSON.stringify(payload));
    return;
  }

  console.log(`[Razorpay] Payment captured for order: ${razorpayOrderId}`);

  // Find matching Firestore order by razorpay order ID
  const ordersSnap = await admin.firestore()
    .collection('orders')
    .where('payment.razorpayOrderId', '==', razorpayOrderId)
    .limit(1)
    .get();

  if (ordersSnap.empty) {
    console.warn(`[Razorpay] No Firestore order found for razorpayOrderId: ${razorpayOrderId}`);
    return;
  }

  const orderDoc  = ordersSnap.docs[0];
  const orderData = { ...orderDoc.data(), id: orderDoc.id };

  // Already marked paid? Skip (idempotency)
  if (orderData.payment?.status === 'Paid') {
    console.log(`[Razorpay] Order ${orderDoc.id} already marked Paid — skipping`);
    return;
  }

  // ── Update Firestore ─────────────────────────────────────────────────────
  // This triggers onOrderPaymentConfirmed → Google Sheets
  // and sendOrderConfirmationWhatsApp → customer WhatsApp
  await orderDoc.ref.update({
    'payment.status':          'Paid',
    'payment.paidAt':          admin.firestore.FieldValue.serverTimestamp(),
    'payment.razorpayPaymentId': payment.id,
    'payment.razorpaySignature': payment.signature || null,
    'payment.method':          payment.method || 'razorpay',
    'payment.amount':          payment.amount / 100, // Razorpay sends paise
    'payment.currency':        payment.currency || 'INR',
    'status':                  'confirmed',
    'updatedAt':               admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`[Razorpay] Order ${orderDoc.id} marked as Paid`);

  // ── Send WhatsApp to customer ────────────────────────────────────────────
  const customerPhone = orderData.customer?.phone;
  if (customerPhone) {
    const customerMsg = getPaymentConfirmedCustomerMessage(orderData, payment);
    const result = await sendWhatsAppMessage(customerPhone, customerMsg);
    console.log(`[Razorpay] Customer WhatsApp sent: ${result.success}`, result.error || '');

    await orderDoc.ref.update({
      'whatsappNotifications.paymentConfirmed': {
        sent:      result.success,
        sentAt:    admin.firestore.FieldValue.serverTimestamp(),
        messageId: result.messageId || null,
        error:     result.error || null,
      }
    });
  }

  // ── Send WhatsApp alert to admin ─────────────────────────────────────────
  const adminPhone = functions.config().admin?.whatsapp_phone;
  if (adminPhone) {
    const adminMsg = getNewPaidOrderAdminMessage(orderData, payment);
    await sendWhatsAppMessage(adminPhone, adminMsg);
    console.log('[Razorpay] Admin WhatsApp alert sent');
  }
}

/* ─── Handler: payment failed ────────────────────────────────────────────── */

async function handlePaymentFailed(payload) {
  const payment         = payload?.payment?.entity || {};
  const razorpayOrderId = payment.order_id;

  if (!razorpayOrderId) {
    console.error('[Razorpay] Payment failed — no order_id in payload');
    return;
  }

  console.log(`[Razorpay] Payment FAILED for order: ${razorpayOrderId}`);

  const ordersSnap = await admin.firestore()
    .collection('orders')
    .where('payment.razorpayOrderId', '==', razorpayOrderId)
    .limit(1)
    .get();

  if (ordersSnap.empty) {
    console.warn(`[Razorpay] No Firestore order found for failed payment: ${razorpayOrderId}`);
    return;
  }

  const orderDoc  = ordersSnap.docs[0];
  const orderData = { ...orderDoc.data(), id: orderDoc.id };

  // Update Firestore with failure details
  await orderDoc.ref.update({
    'payment.status':       'Failed',
    'payment.failedAt':     admin.firestore.FieldValue.serverTimestamp(),
    'payment.failureReason': payment.error_description || payment.error_reason || 'Unknown',
    'payment.failureCode':  payment.error_code || null,
    'updatedAt':            admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notify customer so they can retry
  const customerPhone = orderData.customer?.phone;
  if (customerPhone) {
    const msg    = getPaymentFailedCustomerMessage(orderData, payment);
    const result = await sendWhatsAppMessage(customerPhone, msg);
    console.log(`[Razorpay] Payment failure WhatsApp sent: ${result.success}`);

    await orderDoc.ref.update({
      'whatsappNotifications.paymentFailed': {
        sent:   result.success,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        error:  result.error || null,
      }
    });
  }
}

/**
 * googleSheetsOrders.js
 *
 * Sends confirmed orders to Google Sheets webhook (Apps Script).
 * Uses the 2-sheet structure:
 *   Sheet 1: Orders  (one row per order)
 *   Sheet 2: Order Items  (one row per line item)
 *
 * Firebase config:
 *   firebase functions:config:set sheets.orders_webhook="<Apps Script URL>"
 */

const axios     = require('axios');
const functions = require('firebase-functions');

/* ── Format helpers ── */
const fmtDate = (ts) => {
  const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : new Date();
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Send a confirmed order to Google Sheets (both sheets in one POST).
 * Called after Razorpay payment success OR WhatsApp order confirmation.
 *
 * @param {Object} orderData  Full order document from Firestore
 * @param {string} paymentId  Razorpay payment ID (or 'WhatsApp' for WA orders)
 */
const sendOrderToSheets = async (orderData, paymentId = 'N/A') => {
  const webhookUrl = functions.config().sheets?.orders_webhook;

  if (!webhookUrl) {
    console.warn('[sheets/orders] orders_webhook not configured — skipping');
    return { success: false, error: 'orders_webhook not configured' };
  }

  const customer = orderData.customer || {};
  const pricing  = orderData.pricing  || {};
  const items    = (orderData.items   || []).map(it => ({
    name:      it.name      || it.productName || 'Unknown',
    category:  it.category  || 'N/A',
    unitPrice: it.basePrice || it.unitPrice || 0,
    quantity:  it.quantity  || 1,
    unit:      it.unit      || 'N/A',
    subtotal:  (it.basePrice || it.unitPrice || 0) * (it.quantity || 1),
  }));

  const payload = {
    type: 'order',
    data: {
      /* Order level */
      orderId:       orderData.orderNumber || orderData.id || `BM-${Date.now()}`,
      date:          fmtDate(orderData.createdAt),

      /* Customer */
      customerName:  customer.name    || 'N/A',
      phone:         customer.phone   || 'N/A',
      email:         customer.email   || 'N/A',
      address:       customer.address || 'N/A',
      area:          customer.area    || 'N/A',
      deliveryType:  customer.deliveryType || 'Site Delivery',

      /* Payment */
      paymentStatus: orderData.payment?.status || 'Paid',
      paymentId:     paymentId !== 'N/A' ? paymentId : (orderData.payment?.paymentId || 'N/A'),

      /* Pricing — raw numbers (Sheets handles formatting) */
      orderTotal:    pricing.subtotal      || 0,
      deliveryCharge: pricing.deliveryCharge || 0,
      grandTotal:    pricing.grandTotal    || 0,

      notes:         customer.notes || '',

      /* Line items array */
      items,
    },
  };

  try {
    const res = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    console.log(`[sheets/orders] Order ${payload.data.orderId} synced`, { status: res.status });
    return { success: true, orderId: payload.data.orderId };

  } catch (err) {
    console.error('[sheets/orders] Sync failed:', err.message);
    /* Non-throwing — order already confirmed, don't block on sheets failure */
    return { success: false, error: err.message };
  }
};

module.exports = { sendOrderToSheets };

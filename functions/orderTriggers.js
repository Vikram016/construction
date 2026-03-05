/**
 * orderTriggers.js
 *
 * Firestore triggers for order lifecycle:
 *   - onOrderCreated:         fires when order doc is created (Paid orders only)
 *   - onOrderPaymentConfirmed: fires when payment.status transitions to Paid
 *
 * Both send data to:
 *   1. Google Sheets (2-sheet structure via googleSheetsOrders.js)
 *   2. Invoice generation is handled separately by invoiceTriggers.js
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { sendOrderToSheets } = require("./googleSheetsOrders");

/* ── Helpers ── */
const isPaid = (status) =>
  status === "Paid" || status === "paid" || status === "PAID";

const syncToSheets = async (ref, orderData, paymentId) => {
  try {
    const result = await sendOrderToSheets(orderData, paymentId);
    await ref.update({
      "googleSheets.ordersSync": {
        success: result.success,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        error: result.error || null,
      },
    });
    return result;
  } catch (err) {
    console.error("[orderTriggers] Sheets sync error:", err.message);
    await ref.update({
      "googleSheets.ordersSync": {
        success: false,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        error: err.message,
      },
    });
    return { success: false };
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   TRIGGER 1 — New order created
   Syncs immediately if already Paid (Razorpay webhook or online order)
   ══════════════════════════════════════════════════════════════════════════ */
exports.onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const orderId = context.params.orderId;
    const orderData = {
      ...snap.data(),
      id: orderId,
      timestamp: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    console.log(
      `[orderTriggers] New order: ${orderId} | Payment: ${orderData.payment?.status}`,
    );

    if (!isPaid(orderData.payment?.status)) {
      console.log(
        `[orderTriggers] ${orderId} not yet paid — skipping sheets sync`,
      );
      return null;
    }

    const paymentId = orderData.payment?.paymentId || "N/A";
    const result = await syncToSheets(snap.ref, orderData, paymentId);
    console.log(
      `[orderTriggers] onCreate sheets sync ${orderId}: ${result.success}`,
    );
    return null;
  });

/* ══════════════════════════════════════════════════════════════════════════
   TRIGGER 2 — Payment confirmed (Pending → Paid transition)
   ══════════════════════════════════════════════════════════════════════════ */
exports.onOrderPaymentConfirmed = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    const wasNotPaid = !isPaid(before.payment?.status);
    const isNowPaid = isPaid(after.payment?.status);

    if (!wasNotPaid || !isNowPaid) return null;

    console.log(`[orderTriggers] Payment confirmed: ${orderId}`);

    const orderData = {
      ...after,
      id: orderId,
      timestamp: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    const paymentId = after.payment?.paymentId || "N/A";
    const result = await syncToSheets(change.after.ref, orderData, paymentId);
    console.log(
      `[orderTriggers] onUpdate sheets sync ${orderId}: ${result.success}`,
    );
    return null;
  });

/* ══════════════════════════════════════════════════════════════════════════
   CALLABLE — Manual resend from admin dashboard
   ══════════════════════════════════════════════════════════════════════════ */
exports.resendOrderToSheet = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be logged in",
    );
  }

  const userDoc = await admin
    .firestore()
    .collection("users")
    .doc(context.auth.uid)
    .get();
  if (!userDoc.exists || userDoc.data().role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Admins only");
  }

  const { orderId } = data;
  if (!orderId)
    throw new functions.https.HttpsError(
      "invalid-argument",
      "orderId required",
    );

  const orderDoc = await admin
    .firestore()
    .collection("orders")
    .doc(orderId)
    .get();
  if (!orderDoc.exists)
    throw new functions.https.HttpsError("not-found", "Order not found");

  const orderData = { ...orderDoc.data(), id: orderId };
  const paymentId = orderData.payment?.paymentId || "N/A";

  const result = await syncToSheets(orderDoc.ref, orderData, paymentId);

  return {
    success: result.success,
    orderId,
    message: result.success
      ? "Synced to Google Sheets"
      : "Sync failed: " + result.error,
  };
});

/* ══════════════════════════════════════════════════════════════════════════
   SCHEDULED — Retry failed syncs every 6 hours
   ══════════════════════════════════════════════════════════════════════════ */
exports.retryFailedOrderSyncs = functions.pubsub
  .schedule("every 6 hours")
  .onRun(async () => {
    const oneDayAgo = new Date(Date.now() - 86400000);

    const snap = await admin
      .firestore()
      .collection("orders")
      .where("payment.status", "==", "Paid")
      .where("googleSheets.ordersSync.success", "==", false)
      .limit(50)
      .get();

    console.log(`[orderTriggers] Retrying ${snap.size} failed syncs`);

    const results = await Promise.all(
      snap.docs.map(async (doc) => {
        const orderData = { ...doc.data(), id: doc.id };
        const paymentId = orderData.payment?.paymentId || "N/A";
        const result = await syncToSheets(doc.ref, orderData, paymentId);
        return { orderId: doc.id, success: result.success };
      }),
    );

    const ok = results.filter((r) => r.success).length;
    console.log(`[orderTriggers] Retry: ${ok}/${results.length} OK`);
    return { total: results.length, successful: ok };
  });

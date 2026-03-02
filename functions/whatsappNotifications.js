const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {
  sendWhatsAppMessage,
  getOrderConfirmationMessage,
  getOutForDeliveryMessage,
  getOrderDeliveredMessage,
  getInquiryAcknowledgmentMessage,
  getPaymentReminderMessage,
} = require("./whatsappService");

/**
 * ✅ 1️⃣ SEND WHATSAPP AFTER ORDER CREATION
 *
 * Triggers: When new order is created
 * Message: Order confirmation with details
 */
exports.sendOrderConfirmationWhatsApp = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const orderData = { ...snap.data(), id: context.params.orderId };
    const customerPhone = orderData.customer?.phone;

    if (!customerPhone) {
      console.log(
        "No customer phone number for order:",
        context.params.orderId,
      );
      return null;
    }

    console.log(
      `Sending order confirmation WhatsApp for order: ${orderData.orderNumber}`,
    );

    try {
      // Generate message
      const message = getOrderConfirmationMessage(orderData);

      // Send WhatsApp
      const result = await sendWhatsAppMessage(customerPhone, message);

      // Update order with WhatsApp status
      await snap.ref.update({
        "whatsappNotifications.orderConfirmation": {
          sent: result.success,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          messageId: result.messageId || null,
          error: result.error || null,
          provider: result.provider,
        },
      });

      console.log(`Order confirmation WhatsApp sent: ${result.success}`);
      return result;
    } catch (error) {
      console.error("Error sending order confirmation WhatsApp:", error);

      // Log error but don't fail
      await snap.ref.update({
        "whatsappNotifications.orderConfirmation": {
          sent: false,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          error: error.message,
        },
      });

      return null;
    }
  });

/**
 * ✅ 2️⃣ SEND WHATSAPP WHEN DELIVERY STATUS CHANGES
 *
 * Triggers: When order status is updated
 * Messages:
 *   - "Out for Delivery" → Driver details, ETA
 *   - "Delivered" → Thank you, invoice link
 */
exports.sendDeliveryStatusWhatsApp = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const customerPhone = afterData.customer?.phone;

    if (!customerPhone) {
      console.log(
        "No customer phone number for order:",
        context.params.orderId,
      );
      return null;
    }

    // Check if status changed
    if (beforeData.status === afterData.status) {
      return null; // Status didn't change
    }

    const orderId = context.params.orderId;
    const newStatus = afterData.status;
    const orderData = { ...afterData, id: orderId };

    console.log(
      `Order ${orderData.orderNumber} status changed: ${beforeData.status} → ${newStatus}`,
    );

    try {
      let message = null;
      let notificationType = null;

      // Determine which message to send based on new status
      if (newStatus === "dispatched" || newStatus === "out_for_delivery") {
        message = getOutForDeliveryMessage(orderData);
        notificationType = "outForDelivery";
      } else if (newStatus === "delivered") {
        message = getOrderDeliveredMessage(orderData);
        notificationType = "delivered";
      }

      // Send WhatsApp if message was generated
      if (message && notificationType) {
        const result = await sendWhatsAppMessage(customerPhone, message);

        // Update order with WhatsApp status
        await change.after.ref.update({
          [`whatsappNotifications.${notificationType}`]: {
            sent: result.success,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            messageId: result.messageId || null,
            error: result.error || null,
            provider: result.provider,
          },
        });

        console.log(`${notificationType} WhatsApp sent: ${result.success}`);
        return result;
      }

      return null;
    } catch (error) {
      console.error("Error sending delivery status WhatsApp:", error);
      return null;
    }
  });

/**
 * ✅ 3️⃣ SEND WHATSAPP AFTER INQUIRY/ESTIMATE SUBMISSION
 *
 * Triggers: When new inquiry or estimate is created
 * Message: Acknowledgment and next steps
 */
exports.sendInquiryAcknowledgmentWhatsApp = functions.firestore
  .document("inquiries/{inquiryId}")
  .onCreate(async (snap, context) => {
    const inquiryData = { ...snap.data(), id: context.params.inquiryId };
    const customerPhone = inquiryData.customer?.phone || inquiryData.phone;
    const ownerPhone =
      functions.config().business?.owner_phone ||
      functions.config().whatsapp?.owner_phone;

    console.log(`New inquiry: ${inquiryData.inquiryNumber || inquiryData.id}`);

    try {
      const results = { customer: null, owner: null };

      // ── 1. Send acknowledgment to CUSTOMER ──────────────────────────────
      if (customerPhone) {
        const customerMsg = getInquiryAcknowledgmentMessage(inquiryData);
        results.customer = await sendWhatsAppMessage(
          customerPhone,
          customerMsg,
        );
        console.log(`Customer WhatsApp sent: ${results.customer.success}`);
      } else {
        console.log("No customer phone — skipping customer WhatsApp");
      }

      // ── 2. Send LEAD ALERT to YOU (business owner) ──────────────────────
      if (ownerPhone) {
        const name =
          inquiryData.customer?.name || inquiryData.name || "Unknown";
        const phone = inquiryData.customer?.phone || inquiryData.phone || "N/A";
        const email =
          inquiryData.customer?.email || inquiryData.email || "Not provided";
        const product =
          inquiryData.product || inquiryData.type || "Not specified";
        const qty = inquiryData.quantity || "Not specified";
        const area =
          inquiryData.deliveryArea ||
          inquiryData.customer?.city ||
          "Not specified";
        const msg = inquiryData.message || "No message";
        const ref = inquiryData.inquiryNumber || inquiryData.id;

        const ownerMsg = [
          "🔔 *NEW QUOTE REQUEST — BUILDMART*",
          "",
          `📋 *Ref:* ${ref}`,
          "",
          "👤 *Customer Details:*",
          `   Name:  ${name}`,
          `   Phone: +${phone}`,
          `   Email: ${email}`,
          "",
          "🏗 *What They Need:*",
          `   Product:  ${product}`,
          `   Quantity: ${qty}`,
          `   Area:     ${area}`,
          "",
          msg !== "No message" ? `💬 *Message:* ${msg}` : "",
          "",
          "⚡ *Reply within 2 hours to close the lead!*",
          "",
          `📲 Call/WhatsApp customer:`,
          `https://wa.me/${phone}`,
        ]
          .filter((l) => l !== "")
          .join("\n");

        results.owner = await sendWhatsAppMessage(ownerPhone, ownerMsg);
        console.log(`Owner alert WhatsApp sent: ${results.owner.success}`);
      } else {
        console.warn(
          'Owner phone not configured. Set: firebase functions:config:set business.owner_phone="91XXXXXXXXXX"',
        );
      }

      // ── 3. Update Firestore with notification status ─────────────────────
      await snap.ref.update({
        "whatsappNotifications.acknowledgment": {
          customerSent: results.customer?.success || false,
          ownerSent: results.owner?.success || false,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });

      return results;
    } catch (error) {
      console.error("Error sending inquiry WhatsApp:", error);
      await snap.ref.update({
        "whatsappNotifications.acknowledgment": {
          customerSent: false,
          ownerSent: false,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          error: error.message,
        },
      });
      return null;
    }
  });

/**
 * ✅ 3️⃣ (ALTERNATIVE) SEND WHATSAPP AFTER ESTIMATE SUBMISSION
 *
 * Triggers: When new cost calculator estimate is created
 * Message: Acknowledgment with estimate details
 */
exports.sendEstimateAcknowledgmentWhatsApp = functions.firestore
  .document("estimates/{estimateId}")
  .onCreate(async (snap, context) => {
    const estimateData = {
      ...snap.data(),
      id: context.params.estimateId,
      type: "estimate",
    };
    const customerPhone = estimateData.customer?.phone || estimateData.phone;

    if (!customerPhone) {
      console.log(
        "No customer phone number for estimate:",
        context.params.estimateId,
      );
      return null;
    }

    console.log(
      `Sending estimate acknowledgment WhatsApp for estimate: ${estimateData.estimateNumber}`,
    );

    try {
      // Generate message
      const message = getInquiryAcknowledgmentMessage(estimateData);

      // Send WhatsApp
      const result = await sendWhatsAppMessage(customerPhone, message);

      // Update estimate with WhatsApp status
      await snap.ref.update({
        "whatsappNotifications.acknowledgment": {
          sent: result.success,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          messageId: result.messageId || null,
          error: result.error || null,
          provider: result.provider,
        },
      });

      console.log(`Estimate acknowledgment WhatsApp sent: ${result.success}`);
      return result;
    } catch (error) {
      console.error("Error sending estimate acknowledgment WhatsApp:", error);

      await snap.ref.update({
        "whatsappNotifications.acknowledgment": {
          sent: false,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          error: error.message,
        },
      });

      return null;
    }
  });

/**
 * ⏰ BONUS: PAYMENT REMINDER (Scheduled Function)
 *
 * Triggers: Every 30 minutes
 * Sends reminder for pending payments older than 30 minutes
 */
exports.sendPaymentReminders = functions.pubsub
  .schedule("every 30 minutes")
  .onRun(async (context) => {
    console.log("Running payment reminder job...");

    try {
      const thirtyMinutesAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 30 * 60 * 1000),
      );

      // Find orders with pending payment older than 30 minutes
      const pendingOrders = await admin
        .firestore()
        .collection("orders")
        .where("payment.status", "==", "Pending")
        .where("createdAt", "<", thirtyMinutesAgo)
        .where("whatsappNotifications.paymentReminder.sent", "!=", true)
        .limit(50)
        .get();

      console.log(
        `Found ${pendingOrders.size} orders needing payment reminder`,
      );

      const promises = pendingOrders.docs.map(async (doc) => {
        const orderData = { ...doc.data(), id: doc.id };
        const customerPhone = orderData.customer?.phone;

        if (!customerPhone) return null;

        try {
          const message = getPaymentReminderMessage(orderData);
          const result = await sendWhatsAppMessage(customerPhone, message);

          await doc.ref.update({
            "whatsappNotifications.paymentReminder": {
              sent: result.success,
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              messageId: result.messageId || null,
              error: result.error || null,
            },
          });

          return result;
        } catch (error) {
          console.error(`Error sending payment reminder for ${doc.id}:`, error);
          return null;
        }
      });

      await Promise.all(promises);

      console.log("Payment reminder job completed");
      return { processed: pendingOrders.size };
    } catch (error) {
      console.error("Error in payment reminder job:", error);
      return { error: error.message };
    }
  });

/**
 * 🔧 MANUAL RESEND FUNCTION (for admin dashboard)
 *
 * Allows admin to manually resend WhatsApp notification
 */
exports.resendWhatsAppNotification = functions.https.onCall(
  async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
      );
    }

    // Verify admin role
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid)
      .get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User must be an admin",
      );
    }

    const { orderId, notificationType } = data;

    if (!orderId || !notificationType) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "orderId and notificationType required",
      );
    }

    try {
      // Fetch order
      const orderDoc = await admin
        .firestore()
        .collection("orders")
        .doc(orderId)
        .get();

      if (!orderDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Order not found");
      }

      const orderData = { ...orderDoc.data(), id: orderId };
      const customerPhone = orderData.customer?.phone;

      if (!customerPhone) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "No customer phone number",
        );
      }

      // Generate appropriate message
      let message;
      switch (notificationType) {
        case "orderConfirmation":
          message = getOrderConfirmationMessage(orderData);
          break;
        case "outForDelivery":
          message = getOutForDeliveryMessage(orderData);
          break;
        case "delivered":
          message = getOrderDeliveredMessage(orderData);
          break;
        case "paymentReminder":
          message = getPaymentReminderMessage(orderData);
          break;
        default:
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Invalid notification type",
          );
      }

      // Send WhatsApp
      const result = await sendWhatsAppMessage(customerPhone, message);

      // Update order
      await orderDoc.ref.update({
        [`whatsappNotifications.${notificationType}`]: {
          sent: result.success,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          messageId: result.messageId || null,
          error: result.error || null,
          manualResend: true,
          resendBy: context.auth.uid,
        },
      });

      return {
        success: result.success,
        message: result.success
          ? "WhatsApp sent successfully"
          : "Failed to send WhatsApp",
        error: result.error || null,
      };
    } catch (error) {
      console.error("Error in resendWhatsAppNotification:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

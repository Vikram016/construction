const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// ── Google Reviews (fetches from Places API server-side, 24hr cache) ──────────
const { getGoogleReviews } = require("./googleReviews");
exports.getGoogleReviews = getGoogleReviews;

// ── Razorpay Payment Webhook ──────────────────────────────────────────────────
const { razorpayWebhook } = require("./razorpayWebhook");
exports.razorpayWebhook = razorpayWebhook;

// Export Waste Sand Booking Triggers (Google Sheets)
const {
  onWasteSandBookingCreated,
  resendWasteSandToSheet,
  retryFailedWasteSandSyncs,
} = require("./wasteSandTriggers");

exports.onWasteSandBookingCreated = onWasteSandBookingCreated;
exports.resendWasteSandToSheet = resendWasteSandToSheet;
exports.retryFailedWasteSandSyncs = retryFailedWasteSandSyncs;

// Export Debris Sand Booking Triggers (Google Sheets)
const {
  onDebrisSandBookingCreated,
  resendDebrisSandToSheet,
  retryFailedDebrisSandSyncs,
} = require("./debrisSandTriggers");

exports.onDebrisSandBookingCreated = onDebrisSandBookingCreated;
exports.resendDebrisSandToSheet = resendDebrisSandToSheet;
exports.retryFailedDebrisSandSyncs = retryFailedDebrisSandSyncs;

// Export Order Triggers (Google Sheets)
const {
  onOrderCreated,
  onOrderPaymentConfirmed,
  resendOrderToSheet,
  retryFailedOrderSyncs,
} = require("./orderTriggers");

exports.onOrderCreated = onOrderCreated;
exports.onOrderPaymentConfirmed = onOrderPaymentConfirmed;
exports.resendOrderToSheet = resendOrderToSheet;
exports.retryFailedOrderSyncs = retryFailedOrderSyncs;

// Export Inquiry Triggers (Google Sheets)
const {
  onEstimateCreated,
  onInquiryCreated,
  resendInquiryToSheet,
  retryFailedInquirySyncs,
} = require("./inquiryTriggers");

exports.onEstimateCreated = onEstimateCreated;
exports.onInquiryCreated = onInquiryCreated;
exports.resendInquiryToSheet = resendInquiryToSheet;
exports.retryFailedInquirySyncs = retryFailedInquirySyncs;

// Export WhatsApp Notification Triggers
const {
  sendOrderConfirmationWhatsApp,
  sendDeliveryStatusWhatsApp,
  sendInquiryAcknowledgmentWhatsApp,
  sendEstimateAcknowledgmentWhatsApp,
  sendPaymentReminders,
  resendWhatsAppNotification,
} = require("./whatsappNotifications");

exports.sendOrderConfirmationWhatsApp = sendOrderConfirmationWhatsApp;
exports.sendDeliveryStatusWhatsApp = sendDeliveryStatusWhatsApp;
exports.sendInquiryAcknowledgmentWhatsApp = sendInquiryAcknowledgmentWhatsApp;
exports.sendEstimateAcknowledgmentWhatsApp = sendEstimateAcknowledgmentWhatsApp;
exports.sendPaymentReminders = sendPaymentReminders;
exports.resendWhatsAppNotification = resendWhatsAppNotification;

// Export Invoice Triggers
const {
  generateAndSendInvoiceOnOrderCreation,
  resendInvoiceOnStatusChange,
  resendInvoiceManually,
  cleanupOldInvoices,
} = require("./invoiceTriggers");

exports.generateAndSendInvoiceOnOrderCreation =
  generateAndSendInvoiceOnOrderCreation;
exports.resendInvoiceOnStatusChange = resendInvoiceOnStatusChange;
exports.resendInvoiceManually = resendInvoiceManually;
exports.cleanupOldInvoices = cleanupOldInvoices;

// Export Delivery Routing & Invoice Preference
const {
  onOrderFinalizedWithDelivery,
  onInvoicePreferenceSet,
} = require("./triggers/orderFinalizedWithDelivery");

exports.onOrderFinalizedWithDelivery = onOrderFinalizedWithDelivery;
exports.onInvoicePreferenceSet = onInvoicePreferenceSet;

// Export utility functions
const { resendToSheet } = require("./googleSheets");

/**
 * Generic resend function for admin dashboard
 */
exports.resendToGoogleSheets = require("firebase-functions").https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new require("firebase-functions").https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
      );
    }

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid)
      .get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      throw new require("firebase-functions").https.HttpsError(
        "permission-denied",
        "User must be an admin",
      );
    }

    const { type, collection, documentId } = data;

    if (!type || !collection || !documentId) {
      throw new require("firebase-functions").https.HttpsError(
        "invalid-argument",
        "type, collection, and documentId are required",
      );
    }

    try {
      const doc = await admin
        .firestore()
        .collection(collection)
        .doc(documentId)
        .get();

      if (!doc.exists) {
        throw new require("firebase-functions").https.HttpsError(
          "not-found",
          `Document ${documentId} not found in ${collection}`,
        );
      }

      const docData = { ...doc.data(), id: documentId };
      const result = await resendToSheet(type, docData);

      const syncField = type === "purchase" ? "purchaseSync" : "inquirySync";
      await doc.ref.update({
        [`googleSheets.${syncField}`]: {
          success: result.success,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error: result.error || null,
          manualResend: true,
          resendBy: context.auth.uid,
        },
      });

      return {
        success: result.success,
        documentId: documentId,
        message: result.success
          ? "Successfully sent to Google Sheets"
          : `Failed: ${result.error}`,
      };
    } catch (error) {
      console.error("Error in resendToGoogleSheets:", error);
      throw new require("firebase-functions").https.HttpsError(
        "internal",
        error.message,
      );
    }
  },
);

// Export Site Clean Booking Triggers (Google Sheets)
const {
  onSiteCleanBookingCreated,
  resendSiteCleanToSheet,
  retryFailedSiteCleanSyncs,
} = require("./siteCleanTriggers");

exports.onSiteCleanBookingCreated = onSiteCleanBookingCreated;
exports.resendSiteCleanToSheet = resendSiteCleanToSheet;
exports.retryFailedSiteCleanSyncs = retryFailedSiteCleanSyncs;

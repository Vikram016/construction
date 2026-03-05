/**
 * siteCleanTriggers.js
 *
 * Cloud Functions for Site Clean bookings — full feature parity with wasteSandTriggers.js
 *
 * Exports:
 *   onSiteCleanBookingCreated  — Firestore onCreate → Google Sheets (auto)
 *   resendSiteCleanToSheet     — HTTPS callable (admin manual resend)
 *   retryFailedSiteCleanSyncs  — Scheduled every 6 hours (auto retry failures)
 *
 * Setup:
 *   1. firebase functions:config:set sheets.site_clean_webhook="<Apps Script URL>"
 *   2. firebase deploy --only functions:onSiteCleanBookingCreated,resendSiteCleanToSheet,retryFailedSiteCleanSyncs
 *
 * Firestore collection : site_clean_bookings
 * Google Sheets tab    : "Site Clean Bookings"
 * Apps Script file     : GoogleAppsScript_SiteClean.js
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { sendSiteCleanToSheet } = require("./googleSheets");

/* ── 1. onCreate: new site_clean_bookings doc → Google Sheets ─────────────── */

exports.onSiteCleanBookingCreated = functions.firestore
  .document("site_clean_bookings/{bookingId}")
  .onCreate(async (snap, context) => {
    const bookingData = snap.data();
    const bookingId = context.params.bookingId;

    console.log(`[SiteClean] New booking created: ${bookingId}`, {
      name: bookingData.name,
      phone: bookingData.phone,
      area: bookingData.area,
      siteArea: bookingData.quantity,
      package: bookingData.package,
    });

    try {
      const dataWithId = {
        ...bookingData,
        id: bookingId,
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
      const result = await sendSiteCleanToSheet(dataWithId);

      await snap.ref.update({
        "googleSheets.sheetSync": {
          success: result.success,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error: result.error || null,
        },
      });

      console.log(
        `[SiteClean] Booking ${bookingId} synced to Google Sheets:`,
        result.success,
      );
    } catch (error) {
      console.error(`[SiteClean] Failed to sync booking ${bookingId}:`, error);

      await snap.ref.update({
        "googleSheets.sheetSync": {
          success: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error: error.message,
        },
      });
    }

    return null;
  });

/* ── 2. HTTPS Callable: admin manual resend ───────────────────────────────── */

exports.resendSiteCleanToSheet = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to resend bookings",
      );
    }

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can resend bookings to Google Sheets",
      );
    }

    const { bookingId } = data;
    if (!bookingId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "bookingId is required",
      );
    }

    try {
      const doc = await admin
        .firestore()
        .collection("site_clean_bookings")
        .doc(bookingId)
        .get();

      if (!doc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          `Site Clean booking ${bookingId} not found`,
        );
      }

      const bookingData = { ...doc.data(), id: bookingId };
      const result = await sendSiteCleanToSheet(bookingData);

      await doc.ref.update({
        "googleSheets.sheetSync": {
          success: result.success,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          error: result.error || null,
          manualResend: true,
          resendBy: context.auth.uid,
        },
      });

      return {
        success: result.success,
        bookingId,
        message: result.success
          ? "Booking successfully resent to Google Sheets"
          : `Failed to resend: ${result.error}`,
      };
    } catch (error) {
      console.error("[SiteClean] resendSiteCleanToSheet error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/* ── 3. Scheduled: retry failed syncs every 6 hours ─────────────────────── */

exports.retryFailedSiteCleanSyncs = functions.pubsub
  .schedule("every 6 hours")
  .onRun(async () => {
    console.log("[SiteClean] Starting retry of failed sheet syncs…");

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const failedSnap = await admin
        .firestore()
        .collection("site_clean_bookings")
        .where("googleSheets.sheetSync.success", "==", false)
        .where("googleSheets.sheetSync.timestamp", ">=", oneDayAgo)
        .limit(25)
        .get();

      console.log(`[SiteClean] ${failedSnap.size} failed syncs to retry`);

      const retryResults = await Promise.all(
        failedSnap.docs.map(async (doc) => {
          try {
            const data = { ...doc.data(), id: doc.id };
            const result = await sendSiteCleanToSheet(data);

            await doc.ref.update({
              "googleSheets.sheetSync": {
                success: result.success,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                error: result.error || null,
                retried: true,
              },
            });

            return { id: doc.id, success: result.success };
          } catch (err) {
            console.error(`[SiteClean] Retry failed for ${doc.id}:`, err);
            return { id: doc.id, success: false, error: err.message };
          }
        }),
      );

      const successCount = retryResults.filter((r) => r.success).length;
      console.log(
        `[SiteClean] Retry complete: ${successCount}/${retryResults.length} succeeded`,
      );

      return { total: retryResults.length, successful: successCount };
    } catch (error) {
      console.error("[SiteClean] retryFailedSiteCleanSyncs error:", error);
      return { error: error.message };
    }
  });

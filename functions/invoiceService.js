/**
 * invoiceService.js
 *
 * Generates GST-compliant PDF invoices and delivers them to customers via:
 *   1. WhatsApp — download link sent via the order confirmation message
 *   2. Email    — PDF attached via AWS SES (if customer provided email)
 *
 * Required Firebase Function config:
 *   firebase functions:config:set \
 *     aws.region="ap-south-1" \
 *     aws.access_key_id="AKIA..." \
 *     aws.secret_access_key="..." \
 *     aws.from_email="invoices@buildmart.in"
 */

const PDFDocument = require("pdfkit");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses");

// Company details — single source of truth
const COMPANY = {
  name: "BuildMart Pvt. Ltd.",
  tagline: "Premium Construction Materials",
  address: "#22/7, Marappa Road, Ulsoor, Bangalore - 560008",
  city: "Bangalore, Karnataka 560058",
  country: "India",
  phone: "+91 81221 07464",
  email: "sales@buildmart.in",
  gstin: "29AFRPV9911K1ZC",
  website: "https://buildmart.in",
};

const YELLOW = "#FDB913";
const BLACK = "#1A1A1A";
const GREY = "#6B7280";
const GREEN = "#10B981";
const RED = "#EF4444";

/* ── Invoice Number ───────────────────────────────────────────────────────── */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const counterRef = admin.firestore().collection("counters").doc("invoices");
  try {
    const count = await admin.firestore().runTransaction(async (tx) => {
      const doc = await tx.get(counterRef);
      const next = (doc.exists ? doc.data().count || 0 : 0) + 1;
      tx.set(counterRef, { count: next, year }, { merge: true });
      return next;
    });
    return `INV-${year}-${String(count).padStart(5, "0")}`;
  } catch {
    return `INV-${year}-${Date.now()}`;
  }
};

/* ── Date helper ──────────────────────────────────────────────────────────── */
const formatDate = (date) => {
  const d =
    date && date.toDate ? date.toDate() : date ? new Date(date) : new Date();
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ── PDF Generator ────────────────────────────────────────────────────────── */
const createInvoicePDF = (orderData, invoiceNumber) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 45 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = 505;

      // Yellow bar
      doc.rect(0, 0, 595, 10).fill(YELLOW);

      // Brand
      doc
        .font("Helvetica-Bold")
        .fontSize(26)
        .fillColor(YELLOW)
        .text("BUILDMART", 45, 25);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(GREY)
        .text(COMPANY.tagline, 45, 55);

      // Company details right
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(BLACK)
        .text(COMPANY.name, 350, 22, { align: "right", width: 200 })
        .text(COMPANY.address, 350, 34, { align: "right", width: 200 })
        .text(COMPANY.city, 350, 46, { align: "right", width: 200 })
        .text(COMPANY.phone, 350, 58, { align: "right", width: 200 })
        .text(COMPANY.email, 350, 70, { align: "right", width: 200 })
        .font("Helvetica-Bold")
        .text("GSTIN: " + COMPANY.gstin, 350, 82, {
          align: "right",
          width: 200,
        });

      doc
        .moveTo(45, 100)
        .lineTo(550, 100)
        .strokeColor("#E5E7EB")
        .lineWidth(1)
        .stroke();

      // Invoice title
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(BLACK)
        .text("INVOICE", 45, 115);

      // Meta box
      doc.rect(45, 140, W, 70).strokeColor(YELLOW).lineWidth(1.5).stroke();
      const col2 = 300;
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(GREY)
        .text("INVOICE NO.", 55, 153)
        .text("DATE", 55, 170)
        .text("ORDER ID", 55, 187)
        .text("PAYMENT STATUS", col2, 153)
        .text("PAYMENT MODE", col2, 170);

      const payStatus =
        (orderData.payment && orderData.payment.status) || "Pending";
      const payColor =
        payStatus === "Paid"
          ? GREEN
          : payStatus === "Pending"
            ? "#D97706"
            : RED;

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(BLACK)
        .text(invoiceNumber, 150, 153)
        .text(formatDate(orderData.createdAt), 150, 170)
        .text(
          orderData.orderNumber ||
            (orderData.id || "").slice(0, 8).toUpperCase() ||
            "N/A",
          150,
          187,
        );

      doc
        .font("Helvetica-Bold")
        .fillColor(payColor)
        .text(payStatus, col2 + 95, 153);
      doc
        .font("Helvetica")
        .fillColor(BLACK)
        .text(
          orderData.paymentMethod ||
            (orderData.payment && orderData.payment.method) ||
            "WhatsApp Order",
          col2 + 95,
          170,
        );

      // Bill to
      const c = orderData.customer || {};
      const shipLines = [
        c.address,
        c.city && c.pincode ? c.city + " - " + c.pincode : c.city || c.pincode,
        c.landmark ? "Near: " + c.landmark : null,
      ].filter(Boolean);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(GREY)
        .text("BILL TO / SHIP TO", 45, 228);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(BLACK)
        .text(c.name || "Customer", 45, 243);
      doc
        .font("Helvetica")
        .fontSize(9)
        .text(c.phone || "", 45, 257)
        .text(c.email || "", 45, 269);
      shipLines.forEach((line, i) => doc.text(line, 45, 281 + i * 12));

      // Items table
      const tableTop = 340;
      doc.rect(45, tableTop, W, 24).fill(BLACK);
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("#", 50, tableTop + 8, { width: 20 })
        .text("Item", 75, tableTop + 8, { width: 185 })
        .text("Category", 265, tableTop + 8, { width: 70 })
        .text("Qty", 340, tableTop + 8, { width: 55, align: "right" })
        .text("Rate (Rs.)", 400, tableTop + 8, { width: 65, align: "right" })
        .text("Amount (Rs.)", 470, tableTop + 8, { width: 75, align: "right" });

      const items = orderData.items || [];
      let y = tableTop + 28;

      items.forEach((item, i) => {
        const bg = i % 2 === 0 ? "#FAFAFA" : "#FFFFFF";
        const rowH = 26;
        doc.rect(45, y, W, rowH).fill(bg);
        const name = item.name || item.productName || "Item";
        const qty = (item.quantity || 0) + " " + (item.unit || "");
        const rate = (item.basePrice || 0).toLocaleString("en-IN");
        const total = (
          (item.basePrice || 0) * (item.quantity || 1)
        ).toLocaleString("en-IN");
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(BLACK)
          .text(i + 1, 50, y + 9, { width: 20 })
          .text(name, 75, y + 9, { width: 185 })
          .text(item.category || "", 265, y + 9, { width: 70 })
          .text(qty, 340, y + 9, { width: 55, align: "right" })
          .text(rate, 400, y + 9, { width: 65, align: "right" })
          .text(total, 470, y + 9, { width: 75, align: "right" });
        y += rowH;
        if (y > 680 && i < items.length - 1) {
          doc.addPage();
          y = 45;
        }
      });

      doc
        .moveTo(45, y)
        .lineTo(550, y)
        .strokeColor("#E5E7EB")
        .lineWidth(1)
        .stroke();
      y += 10;

      // Totals
      const pricing = orderData.pricing || {};
      const addRow = (label, val, bold, color) => {
        doc
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(9)
          .fillColor(GREY)
          .text(label, 360, y, { width: 100 })
          .fillColor(color || BLACK)
          .text("Rs." + val.toLocaleString("en-IN"), 465, y, {
            width: 80,
            align: "right",
          });
        y += 16;
      };
      addRow("Subtotal", pricing.subtotal || 0);
      if (pricing.deliveryCharge)
        addRow("Delivery Charge", pricing.deliveryCharge);
      if (pricing.discount) addRow("Discount", pricing.discount);
      // Payment ID below total
      const payId = orderData.payment && orderData.payment.paymentId;

      doc.rect(355, y, 195, 28).fill(BLACK);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(YELLOW)
        .text("GRAND TOTAL", 360, y + 8, { width: 100 })
        .text(
          "Rs." + (pricing.grandTotal || 0).toLocaleString("en-IN"),
          460,
          y + 8,
          { width: 85, align: "right" },
        );
      y += 38;
      // Payment status + ID
      const payStatusLabel =
        (orderData.payment && orderData.payment.status) || "Pending";
      const payIdLabel = payId ? payId : "N/A";
      const payColor2 = payStatusLabel === "Paid" ? GREEN : RED;
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(GREY)
        .text("Payment Status:", 360, y, { width: 100 });
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(payColor2)
        .text(payStatusLabel, 465, y, { width: 80, align: "right" });
      y += 14;
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(GREY)
        .text("Payment ID:", 360, y, { width: 100 });
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(BLACK)
        .text(payIdLabel, 465, y, { width: 80, align: "right" });
      y += 18;

      // Notes
      if (c.notes) {
        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(GREY)
          .text("DELIVERY NOTES", 45, y);
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(BLACK)
          .text(c.notes, 45, y + 12, { width: 300 });
        y += 36;
      }

      // Terms
      if (y > 700) {
        doc.addPage();
        y = 45;
      }
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(GREY)
        .text("TERMS & CONDITIONS", 45, y + 10);
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(GREY)
        .text(
          "1. Goods once delivered cannot be returned unless damaged in transit.",
          45,
          y + 24,
        )
        .text("2. Interest @ 18% p.a. charged on overdue payments.", 45, y + 36)
        .text("3. Subject to Bangalore jurisdiction.", 45, y + 48);

      // Footer
      doc.rect(0, 790, 595, 55).fill("#F9FAFB");
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(GREY)
        .text(
          "This is a computer-generated invoice and does not require a physical signature.",
          45,
          793,
          { align: "center", width: W },
        )
        .text(
          COMPANY.website + "  .  " + COMPANY.email + "  .  " + COMPANY.phone,
          45,
          806,
          { align: "center", width: W },
        );
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(BLACK)
        .text("For BuildMart Pvt. Ltd.", 400, 755)
        .font("Helvetica")
        .fontSize(7)
        .fillColor(GREY)
        .text("Authorised Signatory", 400, 770);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

/* ── Upload PDF ───────────────────────────────────────────────────────────── */
const uploadInvoiceToStorage = async (pdfBuffer, invoiceNumber) => {
  const bucket = admin.storage().bucket();
  const fileName = "invoices/" + invoiceNumber + ".pdf";
  const file = bucket.file(fileName);
  await file.save(pdfBuffer, {
    metadata: { contentType: "application/pdf", metadata: { invoiceNumber } },
  });
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2500",
  });
  return url;
};

/* ── Send invoice to customer (WhatsApp link + Email with PDF) ────────────── */
const sendInvoiceToCustomer = async ({
  orderData,
  invoiceNumber,
  invoiceUrl,
  pdfBuffer,
}) => {
  const results = { whatsapp: true, email: false, emailSkipped: false };
  const customer = orderData.customer || {};

  if (!customer.email) {
    results.emailSkipped = true;
    return results;
  }

  try {
    const cfg = functions.config().aws || {};
    if (!cfg.access_key_id || !cfg.secret_access_key) {
      console.warn("[invoice] AWS SES not configured — skipping email");
      results.emailSkipped = true;
      return results;
    }

    const ses = new SESClient({
      region: cfg.region || "ap-south-1",
      credentials: {
        accessKeyId: cfg.access_key_id,
        secretAccessKey: cfg.secret_access_key,
      },
    });

    const fromEmail = cfg.from_email || "invoices@buildmart.in";
    const toEmail = customer.email;
    const subject = "Your BuildMart Invoice - " + invoiceNumber;
    const boundary = "----=_Part_" + Date.now();
    const pdfBase64 = pdfBuffer.toString("base64");

    const pricing = orderData.pricing || {};
    const items = orderData.items || [];
    const itemRows = items
      .map(
        (item) =>
          '<tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">' +
          (item.name || item.productName) +
          "</td>" +
          '<td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6;">' +
          item.quantity +
          " " +
          (item.unit || "") +
          "</td>" +
          '<td style="padding:8px 12px;text-align:right;border-bottom:1px solid #f3f4f6;">Rs.' +
          (item.basePrice || 0).toLocaleString("en-IN") +
          "</td>" +
          '<td style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6;">Rs.' +
          ((item.basePrice || 0) * (item.quantity || 1)).toLocaleString(
            "en-IN",
          ) +
          "</td></tr>",
      )
      .join("");

    const htmlBody =
      '<!DOCTYPE html><html><body style="margin:0;background:#f9fafb;font-family:Arial,sans-serif;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;"><tr><td align="center">' +
      '<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;">' +
      '<tr><td style="background:#1a1a1a;padding:28px 32px;">' +
      '<span style="font-size:24px;font-weight:900;color:#FDB913;">BUILDMART</span>' +
      '<p style="color:#9ca3af;margin:4px 0 0;font-size:12px;">Premium Construction Materials</p>' +
      "</td></tr>" +
      '<tr><td style="padding:32px;">' +
      '<p style="color:#374151;margin:0 0 6px;">Hello <strong>' +
      (customer.name || "Valued Customer") +
      "</strong>,</p>" +
      '<p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Thank you for your order. Please find your tax invoice attached to this email.</p>' +
      '<table width="100%" style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;margin-bottom:24px;">' +
      '<tr><td style="padding:16px 20px;">' +
      '<p style="margin:0;font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;">Invoice Number</p>' +
      '<p style="margin:4px 0 0;font-size:20px;font-weight:900;font-family:monospace;">' +
      invoiceNumber +
      "</p>" +
      '</td><td style="padding:16px 20px;text-align:right;">' +
      '<a href="' +
      invoiceUrl +
      '" style="display:inline-block;background:#FDB913;color:#1a1a1a;font-weight:700;font-size:13px;padding:10px 20px;border-radius:4px;text-decoration:none;">Download PDF</a>' +
      "</td></tr>" +
      "</table>" +
      '<table width="100%" style="border:1px solid #f3f4f6;border-radius:6px;margin-bottom:20px;font-size:13px;">' +
      '<thead><tr style="background:#f9fafb;">' +
      '<th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:11px;">Item</th>' +
      '<th style="padding:10px 12px;text-align:center;color:#6b7280;font-size:11px;">Qty</th>' +
      '<th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:11px;">Rate</th>' +
      '<th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:11px;">Total</th>' +
      "</tr></thead>" +
      "<tbody>" +
      itemRows +
      "</tbody>" +
      "<tfoot>" +
      '<tr><td colspan="3" style="padding:10px 12px;text-align:right;color:#6b7280;font-size:12px;">Subtotal</td><td style="padding:10px 12px;text-align:right;">Rs.' +
      (pricing.subtotal || 0).toLocaleString("en-IN") +
      "</td></tr>" +
      // GST row removed —
      (pricing.deliveryCharge
        ? '<tr><td colspan="3" style="padding:4px 12px;text-align:right;color:#6b7280;font-size:12px;">Delivery</td><td style="padding:4px 12px;text-align:right;">Rs.' +
          pricing.deliveryCharge.toLocaleString("en-IN") +
          "</td></tr>"
        : "") +
      '<tr style="background:#1a1a1a;">' +
      '<td colspan="3" style="padding:12px;text-align:right;color:#FDB913;font-weight:700;">GRAND TOTAL</td>' +
      '<td style="padding:12px;text-align:right;color:#FDB913;font-weight:900;font-size:15px;">Rs.' +
      (pricing.grandTotal || 0).toLocaleString("en-IN") +
      "</td>" +
      "</tr>" +
      "</tfoot>" +
      "</table>" +
      '<p style="color:#6b7280;font-size:13px;margin:0;">Questions? WhatsApp: +91 98765 43210 | Email: support@buildmart.in</p>' +
      "</td></tr>" +
      '<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;">' +
      '<p style="color:#9ca3af;font-size:11px;margin:0;">BuildMart Pvt. Ltd. - 12 Industrial Layout, Peenya, Bangalore 560058</p>' +
      '<p style="color:#9ca3af;font-size:11px;margin:4px 0 0;">GSTIN: 29AAAAA0000A1Z5</p>' +
      "</td></tr>" +
      "</table></td></tr></table></body></html>";

    const rawEmail = [
      "From: BuildMart <" + fromEmail + ">",
      "To: " +
        (customer.name ? '"' + customer.name + '" <' + toEmail + ">" : toEmail),
      "Subject: " + subject,
      "MIME-Version: 1.0",
      'Content-Type: multipart/mixed; boundary="' + boundary + '"',
      "",
      "--" + boundary,
      "Content-Type: text/html; charset=UTF-8",
      "",
      htmlBody,
      "",
      "--" + boundary,
      'Content-Type: application/pdf; name="' + invoiceNumber + '.pdf"',
      "Content-Transfer-Encoding: base64",
      'Content-Disposition: attachment; filename="' + invoiceNumber + '.pdf"',
      "",
      pdfBase64,
      "",
      "--" + boundary + "--",
    ].join("\r\n");

    await ses.send(
      new SendRawEmailCommand({ RawMessage: { Data: Buffer.from(rawEmail) } }),
    );
    results.email = true;
    console.log("[invoice] Email sent to " + toEmail + " for " + invoiceNumber);
  } catch (err) {
    console.error("[invoice] Email failed:", err.message);
    results.emailError = err.message;
  }

  return results;
};

module.exports = {
  generateInvoiceNumber,
  createInvoicePDF,
  uploadInvoiceToStorage,
  sendInvoiceToCustomer,
  formatDate,
};

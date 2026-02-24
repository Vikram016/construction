/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GoogleAppsScript_SiteClean.js
 * BuildMart — Site Cleaning Bookings → Google Sheets
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * WHAT THIS DOES:
 *   Receives HTTP POST from BuildMart Firebase Cloud Function whenever a new
 *   site_clean_bookings document is created in Firestore, then appends a row
 *   to the "Site Clean Bookings" tab in this Google Sheet.
 *
 * SHEET COLUMNS (A → N):
 *   A  Booking ID       B  Date              C  Name
 *   D  Phone            E  Location          F  Site Area (sq ft)
 *   G  Package          H  Total Amount      I  Status
 *   J  Preferred Date   K  Notes             L  Source
 *   M  Assigned To      N  Synced At
 *
 * ── SETUP INSTRUCTIONS ────────────────────────────────────────────────────────
 *
 *  1. Open https://script.google.com → Create new project
 *     Name it: "BuildMart Site Clean Webhook"
 *
 *  2. Paste this entire file into the editor (replace the empty function)
 *
 *  3. Deploy as Web App:
 *     Click "Deploy" → "New Deployment"
 *     Type: Web App
 *     Execute as: Me (your Google account)
 *     Who has access: Anyone
 *     → Click Deploy → Copy the Web App URL
 *
 *  4. Set the webhook URL in Firebase:
 *     firebase functions:config:set sheets.site_clean_webhook="<YOUR WEB APP URL>"
 *
 *  5. Deploy the Cloud Function:
 *     firebase deploy --only functions:onSiteCleanBookingCreated,resendSiteCleanToSheet,retryFailedSiteCleanSyncs
 *
 *  6. Test by submitting a booking on /services/site-clean — row should appear
 *     in "Site Clean Bookings" tab within 5 seconds.
 *
 * ── TROUBLESHOOTING ───────────────────────────────────────────────────────────
 *   • No row appearing? Check Cloud Function logs in Firebase Console.
 *   • "Error" in column N? The webhook received data but threw an exception —
 *     check Apps Script "Executions" log (View → Executions).
 *   • "Permission denied"? Re-deploy the Web App with "Anyone" access.
 *   • Wrong spreadsheet? Make sure this script is bound to the right sheet
 *     (open it from within the Google Sheet via Extensions → Apps Script).
 *
 * ── CONNECTING TO YOUR SHEET ─────────────────────────────────────────────────
 *   RECOMMENDED: Open your Google Sheet → Extensions → Apps Script → paste here.
 *   This binds the script to the sheet and getActiveSpreadsheet() just works.
 *
 *   ALTERNATIVE: Open script.google.com separately, then set SPREADSHEET_ID below:
 *   const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';
 */

/* ── Configuration ───────────────────────────────────────────────────────────── */
const SHEET_NAME = 'Site Clean Bookings';

// Only needed if running as a standalone script (not bound to a sheet)
// const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

const HEADERS = [
  'Booking ID',
  'Date',
  'Name',
  'Phone',
  'Location',
  'Site Area (sq ft)',
  'Package',
  'Total Amount',
  'Status',
  'Preferred Date',
  'Notes',
  'Source',
  'Assigned To',
  'Synced At',
];

// Column header colours — blue theme for Site Clean (matches app UI)
const HEADER_BG    = '#1e3a8a';   // dark blue
const HEADER_FG    = '#ffffff';   // white text
const ALT_ROW_BG   = '#eff6ff';   // very light blue for alternating rows
const STATUS_COLORS = {
  'pending':          '#fef3c7',   // amber
  'confirmed':        '#d1fae5',   // green
  'in_progress':      '#dbeafe',   // blue
  'completed':        '#d1fae5',   // green
  'cancelled':        '#fee2e2',   // red
  'pending_payment':  '#fef3c7',   // amber
};

/* ── Main webhook handler ────────────────────────────────────────────────────── */
function doPost(e) {
  try {
    // Parse request body
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'No POST body received' });
    }

    const payload = JSON.parse(e.postData.contents);

    if (payload.type !== 'site_clean_booking') {
      return jsonResponse({
        success: false,
        error:   `Unknown booking type: ${payload.type}`,
      });
    }

    const data = payload.data || {};
    const sheet = getOrCreateSheet();

    // Build the row
    const now = nowIST();
    const preferredDate = data.preferredDate
      ? new Date(data.preferredDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
      : 'Not specified';

    const newRow = [
      data.bookingId    || `SCB-${Date.now()}`,   // A: Booking ID
      data.date
        ? new Date(data.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : now,                                      // B: Date
      data.name         || 'Unknown',              // C: Name
      data.phone        || 'N/A',                  // D: Phone
      data.area         || 'N/A',                  // E: Location
      data.siteArea     || data.quantity || 0,      // F: Site Area (sq ft)
      data.package      || 'To be quoted',         // G: Package
      data.totalAmount  || '₹0',                   // H: Total Amount
      data.status       || 'pending',              // I: Status
      preferredDate,                               // J: Preferred Date
      data.notes        || '',                     // K: Notes
      data.source       || 'website',              // L: Source
      data.assignedTo   || '',                     // M: Assigned To
      now,                                         // N: Synced At
    ];

    const lastRow = sheet.getLastRow();
    const newRowIndex = lastRow + 1;
    sheet.appendRow(newRow);

    // Style the new row
    styleNewRow(sheet, newRowIndex, data.status);

    // Auto-resize columns to content
    sheet.autoResizeColumns(1, HEADERS.length);

    console.log(`[SiteClean] Booking ${data.bookingId} appended at row ${newRowIndex}`);

    return jsonResponse({
      success: true,
      message: `Site Clean booking ${data.bookingId} logged at row ${newRowIndex}`,
      row:     newRowIndex,
    });

  } catch (err) {
    console.error('[SiteClean] doPost error:', err.toString());
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/* ── GET handler — health check / browser test ──────────────────────────────── */
function doGet(e) {
  const sheet = getOrCreateSheet();
  return jsonResponse({
    status:       'ok',
    service:      'BuildMart Site Clean Webhook',
    sheet:        SHEET_NAME,
    rowCount:     sheet.getLastRow() - 1,  // exclude header
    timestamp:    nowIST(),
  });
}

/* ── Helpers ─────────────────────────────────────────────────────────────────── */

/**
 * Get "Site Clean Bookings" tab, creating it with headers if it doesn't exist.
 */
function getOrCreateSheet() {
  const ss = (typeof SPREADSHEET_ID !== 'undefined' && SPREADSHEET_ID)
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupHeaders(sheet);
    console.log(`[SiteClean] Created new sheet tab: "${SHEET_NAME}"`);
  } else if (sheet.getLastRow() === 0) {
    // Sheet exists but is empty — set up headers
    setupHeaders(sheet);
  }

  return sheet;
}

/**
 * Write and style the header row.
 */
function setupHeaders(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);
  headerRange.setBackground(HEADER_BG);
  headerRange.setFontColor(HEADER_FG);
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  // Set sensible column widths
  const widths = [140, 160, 140, 120, 160, 120, 140, 110, 110, 120, 200, 90, 130, 160];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
}

/**
 * Apply zebra-striping and status colour to the newly added row.
 */
function styleNewRow(sheet, rowIndex, status) {
  const range = sheet.getRange(rowIndex, 1, 1, HEADERS.length);

  // Alternating row background
  const bg = (rowIndex % 2 === 0) ? ALT_ROW_BG : '#ffffff';
  range.setBackground(bg);
  range.setFontSize(10);
  range.setVerticalAlignment('middle');

  // Colour the Status cell (column I = index 9)
  const statusBg = STATUS_COLORS[status] || '#f9fafb';
  sheet.getRange(rowIndex, 9).setBackground(statusBg).setFontWeight('bold');

  // Bold the Name cell (column C = index 3)
  sheet.getRange(rowIndex, 3).setFontWeight('bold');

  // Format Site Area cell as number (column F = index 6)
  sheet.getRange(rowIndex, 6).setNumberFormat('#,##0');
}

/**
 * Return current IST time as a formatted string.
 */
function nowIST() {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

/**
 * Return a JSON ContentService response.
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Manual test from Apps Script editor ────────────────────────────────────── */

/**
 * Run this from the Apps Script editor (Run → testDoPost) to verify
 * the sheet setup and row styling without needing a real booking.
 */
function testDoPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        type: 'site_clean_booking',
        data: {
          bookingId:     'SCB-TEST-001',
          date:          new Date().toISOString(),
          name:          'Suresh Patil',
          phone:         '9876543210',
          area:          'Whitefield, Bangalore',
          siteArea:      1200,
          package:       'Standard Clean',
          totalAmount:   '₹6,999',
          status:        'pending',
          preferredDate: '2026-03-15',
          notes:         'Ground floor, new construction site. Gate access by 9am.',
          source:        'website',
          assignedTo:    '',
        },
      }),
    },
  };

  const result = doPost(fakeEvent);
  Logger.log('Test result: ' + result.getContent());
}

/**
 * Run this to manually re-create the header row (e.g. if it got deleted).
 */
function resetHeaders() {
  const sheet = getOrCreateSheet();
  setupHeaders(sheet);
  Logger.log('Headers reset on sheet: ' + SHEET_NAME);
}

/**
 * Bulk-style all existing rows (run once if you have unformatted rows).
 */
function reformatAllRows() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) { Logger.log('No data rows to format'); return; }

  for (let row = 2; row <= lastRow; row++) {
    const status = sheet.getRange(row, 9).getValue() || 'pending';
    styleNewRow(sheet, row, status);
  }
  Logger.log(`Reformatted ${lastRow - 1} rows`);
}

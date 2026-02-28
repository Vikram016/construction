/**
 * BuildMart — Google Apps Script
 * 2-Sheet Order System: "Orders" + "Order Items"
 *
 * SETUP:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this entire file into Code.gs
 * 3. Deploy → New deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL
 * 5. Set Firebase config:
 *    firebase functions:config:set sheets.orders_webhook="<WEB_APP_URL>"
 */

const SPREADSHEET_ID = ''; // Leave blank if script is bound to the sheet

/* ── Sheet names ── */
const ORDERS_SHEET       = 'Orders';
const ORDER_ITEMS_SHEET  = 'Order Items';

/* ── Orders sheet columns (A → O) ── */
const ORDERS_HEADERS = [
  'Order ID',          // A
  'Date',              // B
  'Customer Name',     // C
  'Phone',             // D
  'Email',             // E
  'Address',           // F
  'Area',              // G
  'Delivery Type',     // H
  'Payment Status',    // I
  'Payment ID',        // J
  'Order Total (₹)',   // K
  'Delivery Charge (₹)',// L
  'Grand Total (₹)',   // M
  'Items Summary',     // N
  'Notes',             // O
];

/* ── Order Items sheet columns (A → H) ── */
const ITEMS_HEADERS = [
  'Order ID',          // A
  'Product Name',      // B
  'Category',          // C
  'Unit Price (₹)',    // D
  'Quantity',          // E
  'Unit',              // F
  'Subtotal (₹)',      // G
  'Date',              // H
];

/* ═══════════════════════════════════════════════════════════════════════════
   SETUP — creates sheets and headers if they don't exist
   ═══════════════════════════════════════════════════════════════════════════ */
function setupSheets() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  [
    { name: ORDERS_SHEET,      headers: ORDERS_HEADERS,      color: '#FDB913' },
    { name: ORDER_ITEMS_SHEET, headers: ITEMS_HEADERS,       color: '#10B981' },
  ].forEach(({ name, headers, color }) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }

    // Only write headers if row 1 is empty
    if (!sheet.getRange(1, 1).getValue()) {
      const range = sheet.getRange(1, 1, 1, headers.length);
      range.setValues([headers]);
      range.setBackground(color);
      range.setFontColor(name === ORDERS_SHEET ? '#1A1A1A' : '#FFFFFF');
      range.setFontWeight('bold');
      range.setFontSize(11);
      sheet.setFrozenRows(1);
      sheet.setColumnWidths(1, headers.length, 160);
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast('BuildMart sheets ready ✓', 'Setup Complete', 4);
  return 'Setup complete';
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN WEBHOOK — receives POST from Firebase Functions
   ═══════════════════════════════════════════════════════════════════════════ */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const body = JSON.parse(e.postData.contents);

    if (body.type === 'order') {
      return handleOrder(body.data);
    }

    return buildResponse(false, 'Unknown type: ' + body.type);

  } catch (err) {
    console.error('doPost error:', err.message, err.stack);
    return buildResponse(false, err.message);
  } finally {
    lock.releaseLock();
  }
}

/* Also allow GET for testing */
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'setup') {
    setupSheets();
    return ContentService
      .createTextOutput('Setup complete. Sheets created.')
      .setMimeType(ContentService.MimeType.TEXT);
  }
  return ContentService
    .createTextOutput('BuildMart Order Webhook — OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ORDER HANDLER
   ═══════════════════════════════════════════════════════════════════════════ */
function handleOrder(data) {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  // Ensure sheets exist
  ensureSheet(ss, ORDERS_SHEET,      ORDERS_HEADERS,      '#FDB913', '#1A1A1A');
  ensureSheet(ss, ORDER_ITEMS_SHEET, ITEMS_HEADERS,        '#10B981', '#FFFFFF');

  const ordersSheet = ss.getSheetByName(ORDERS_SHEET);
  const itemsSheet  = ss.getSheetByName(ORDER_ITEMS_SHEET);

  const orderId   = data.orderId     || 'N/A';
  const date      = data.date        || new Date().toLocaleDateString('en-IN');
  const items     = data.items       || [];

  // ── Build items summary for Orders sheet column N ──
  const itemsSummary = items
    .map(it => `${it.name} ×${it.quantity} ${it.unit} = ₹${(it.subtotal || 0).toLocaleString('en-IN')}`)
    .join('\n');

  // ── Orders sheet — one row ──
  ordersSheet.appendRow([
    orderId,
    date,
    data.customerName     || 'N/A',
    data.phone            || 'N/A',
    data.email            || 'N/A',
    data.address          || 'N/A',
    data.area             || 'N/A',
    data.deliveryType     || 'Site Delivery',
    data.paymentStatus    || 'Pending',
    data.paymentId        || 'N/A',
    data.orderTotal       || 0,
    data.deliveryCharge   || 0,
    data.grandTotal       || 0,
    itemsSummary,
    data.notes            || '',
  ]);

  // ── Order Items sheet — one row per item ──
  items.forEach(item => {
    itemsSheet.appendRow([
      orderId,
      item.name         || 'Unknown',
      item.category     || 'N/A',
      item.unitPrice    || 0,
      item.quantity     || 0,
      item.unit         || 'N/A',
      item.subtotal     || 0,
      date,
    ]);
  });

  // ── Format newly added Orders row ──
  const newOrderRow = ordersSheet.getLastRow();
  const statusCell  = ordersSheet.getRange(newOrderRow, 9); // Payment Status col I
  const statusVal   = data.paymentStatus || 'Pending';
  if (statusVal === 'Paid' || statusVal === 'paid') {
    statusCell.setBackground('#D1FAE5').setFontColor('#065F46').setFontWeight('bold');
  } else if (statusVal === 'Failed' || statusVal === 'failed') {
    statusCell.setBackground('#FEE2E2').setFontColor('#991B1B').setFontWeight('bold');
  } else {
    statusCell.setBackground('#FEF3C7').setFontColor('#92400E').setFontWeight('bold');
  }

  console.log('Order saved:', orderId, '| Items:', items.length);
  return buildResponse(true, 'Order ' + orderId + ' saved. Items: ' + items.length);
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
function ensureSheet(ss, name, headers, bgColor, fontColor) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range.setBackground(bgColor);
    range.setFontColor(fontColor);
    range.setFontWeight('bold');
    range.setFontSize(11);
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, headers.length, 160);
  }
  return sheet;
}

function buildResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, message, ts: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

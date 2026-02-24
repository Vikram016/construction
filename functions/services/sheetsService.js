const { google } = require('googleapis');
const functions = require('firebase-functions');

/**
 * Google Sheets Service
 * Automatically records orders when payment is successful and delivery is confirmed
 */

// Initialize Google Sheets API
const initSheetsAPI = () => {
  const serviceAccountEmail = functions.config().google?.service_account_email;
  const privateKey = functions.config().google?.private_key?.replace(/\\n/g, '\n');
  const spreadsheetId = functions.config().google?.sheet_id;

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    throw new Error('Google Sheets configuration missing');
  }

  const auth = new google.auth.JWT(
    serviceAccountEmail,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });

  return { sheets, spreadsheetId };
};

/**
 * Calculate week number (ISO week)
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

/**
 * Get month name
 */
const getMonthName = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[date.getMonth()];
};

/**
 * Format date for sheet (DD/MM/YYYY)
 */
const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Append order to Google Sheets
 * @param {Object} orderData - Complete order data from Firestore
 * @returns {Promise<Object>} - Success/failure response
 */
const appendOrderToSheet = async (orderData) => {
  try {
    const { sheets, spreadsheetId } = initSheetsAPI();
    const sheetName = 'All Orders';

    // Get order date (use server time)
    const orderDate = orderData.createdAt?.toDate 
      ? orderData.createdAt.toDate() 
      : new Date(orderData.createdAt || Date.now());

    // Calculate week number and month name
    const weekNumber = getWeekNumber(orderDate);
    const monthName = getMonthName(orderDate);

    // Prepare row data (exact column order as specified)
    const rowData = [
      formatDate(orderDate),                                    // Date
      weekNumber,                                               // Week Number
      monthName,                                                // Month Name
      orderData.orderNumber || orderData.id,                   // Order ID
      orderData.customer?.name || 'N/A',                       // Customer Name
      orderData.customer?.phone || 'N/A',                      // Phone
      orderData.pricing?.subtotal || 0,                        // Order Value
      orderData.pricing?.deliveryCharge || 0,                  // Delivery Charge
      orderData.pricing?.handlingFee || 0,                     // Handling Fee
      orderData.pricing?.wasteCollectionFee || 0,              // Waste Collection Fee
      orderData.pricing?.grandTotal || 0,                      // Total Amount
      orderData.delivery?.slot || 'N/A',                       // Delivery Slot
      orderData.status || 'Unknown'                            // Order Status
    ];

    // Append row to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:M`, // A to M columns (13 columns)
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData]
      }
    });

    console.log('Order appended to Google Sheets:', {
      orderId: orderData.orderNumber,
      range: response.data.updates.updatedRange,
      rows: response.data.updates.updatedRows
    });

    return {
      success: true,
      orderId: orderData.orderNumber,
      range: response.data.updates.updatedRange,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error appending to Google Sheets:', {
      orderId: orderData.orderNumber,
      error: error.message,
      stack: error.stack
    });

    // Don't throw error - log and return failure
    // We don't want to block order processing if Sheets sync fails
    return {
      success: false,
      orderId: orderData.orderNumber,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Check if sheet exists and has correct headers
 * @returns {Promise<boolean>} - True if sheet is properly configured
 */
const verifySheetSetup = async () => {
  try {
    const { sheets, spreadsheetId } = initSheetsAPI();
    const sheetName = 'All Orders';

    // Check if sheet exists and get headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:M1`
    });

    const expectedHeaders = [
      'Date',
      'Week Number',
      'Month Name',
      'Order ID',
      'Customer Name',
      'Phone',
      'Order Value',
      'Delivery Charge',
      'Handling Fee',
      'Waste Collection Fee',
      'Total Amount',
      'Delivery Slot',
      'Order Status'
    ];

    const actualHeaders = response.data.values?.[0] || [];

    // Check if headers match
    const headersMatch = expectedHeaders.every((header, index) => 
      actualHeaders[index] === header
    );

    if (!headersMatch) {
      console.warn('Sheet headers do not match expected format');
      return false;
    }

    console.log('Google Sheets setup verified successfully');
    return true;

  } catch (error) {
    console.error('Error verifying sheet setup:', error);
    return false;
  }
};

/**
 * Initialize sheet with headers if needed
 * @returns {Promise<boolean>} - Success status
 */
const initializeSheet = async () => {
  try {
    const { sheets, spreadsheetId } = initSheetsAPI();
    const sheetName = 'All Orders';

    const headers = [[
      'Date',
      'Week Number',
      'Month Name',
      'Order ID',
      'Customer Name',
      'Phone',
      'Order Value',
      'Delivery Charge',
      'Handling Fee',
      'Waste Collection Fee',
      'Total Amount',
      'Delivery Slot',
      'Order Status'
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:M1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: headers
      }
    });

    // Format header row (bold, background color)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 13
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.98, green: 0.74, blue: 0.07 }, // Yellow
                  textFormat: {
                    bold: true,
                    fontSize: 11
                  },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          }
        ]
      }
    });

    console.log('Google Sheet initialized with headers');
    return true;

  } catch (error) {
    console.error('Error initializing sheet:', error);
    return false;
  }
};

module.exports = {
  appendOrderToSheet,
  verifySheetSetup,
  initializeSheet,
  getWeekNumber,
  getMonthName,
  formatDate
};

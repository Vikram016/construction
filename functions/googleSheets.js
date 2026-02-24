const axios = require('axios');
const functions = require('firebase-functions');

/**
 * Format products array into readable string
 * Example: "Cement – 20 bags | Steel – 500kg | Sand – 5 tons"
 */
const formatProducts = (items) => {
  if (!items || items.length === 0) return 'No products';
  
  return items
    .map(item => `${item.productName} – ${item.quantity} ${item.unit}`)
    .join(' | ');
};

/**
 * Format currency for sheets
 */
const formatCurrency = (amount) => {
  return amount ? `₹${amount.toLocaleString('en-IN')}` : '₹0';
};

/**
 * Format date for sheets
 */
const formatDate = (timestamp) => {
  if (!timestamp) return new Date().toISOString();
  
  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  
  // Handle JavaScript Date
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // Handle ISO string
  return new Date(timestamp).toISOString();
};

/**
 * Send purchase data to Google Sheets
 * @param {Object} orderData - Complete order data from Firestore
 * @returns {Promise<Object>} - Success/failure response
 */
const sendPurchaseToSheet = async (orderData) => {
  const webhookUrl = functions.config().sheets?.purchase_webhook;
  
  if (!webhookUrl) {
    console.error('Purchase Sheet webhook URL not configured');
    throw new Error('Purchase Sheet webhook not configured');
  }

  try {
    // Prepare payload for Google Sheets
    const payload = {
      type: 'purchase',
      data: {
        orderId: orderData.id || orderData.orderNumber || 'N/A',
        orderNumber: orderData.orderNumber || 'N/A',
        customerName: orderData.customer?.name || 'Unknown',
        customerPhone: orderData.customer?.phone || 'N/A',
        customerEmail: orderData.customer?.email || 'N/A',
        products: formatProducts(orderData.items),
        area: `${orderData.customer?.pincode || 'N/A'} - ${orderData.delivery?.city || 'N/A'}`,
        city: orderData.delivery?.city || orderData.customer?.city || 'N/A',
        pincode: orderData.customer?.pincode || orderData.delivery?.pincode || 'N/A',
        address: orderData.customer?.address || orderData.delivery?.address || 'N/A',
        total: formatCurrency(orderData.pricing?.grandTotal),
        subtotal: formatCurrency(orderData.pricing?.subtotal),
        gst: formatCurrency(orderData.pricing?.totalGST),
        deliveryCharge: formatCurrency(orderData.pricing?.deliveryCharge),
        paymentStatus: orderData.payment?.status || 'Unknown',
        paymentMethod: orderData.payment?.method || 'N/A',
        transactionId: orderData.payment?.transactionId || 'N/A',
        deliveryStatus: orderData.status || 'Unknown',
        distance: orderData.delivery?.distance ? `${orderData.delivery.distance} km` : 'N/A',
        vehicleType: orderData.delivery?.vehicleType || 'N/A',
        createdDate: formatDate(orderData.createdAt),
        paidDate: formatDate(orderData.payment?.paymentDate),
        source: orderData.source || 'website'
      }
    };

    // Send to Google Sheets webhook
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`Purchase sent to Google Sheets: ${orderData.orderNumber}`, {
      status: response.status,
      data: response.data
    });

    return {
      success: true,
      orderId: orderData.orderNumber,
      timestamp: new Date().toISOString(),
      response: response.data
    };

  } catch (error) {
    console.error('Error sending purchase to Google Sheets:', {
      orderId: orderData.orderNumber,
      error: error.message,
      response: error.response?.data
    });

    // Don't throw error - log and continue
    // We don't want to block order processing
    return {
      success: false,
      orderId: orderData.orderNumber,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

/**
 * Send inquiry data to Google Sheets
 * @param {Object} inquiryData - Inquiry or estimate data
 * @returns {Promise<Object>} - Success/failure response
 */
const sendInquiryToSheet = async (inquiryData) => {
  const webhookUrl = functions.config().sheets?.inquiry_webhook;
  
  if (!webhookUrl) {
    console.error('Inquiry Sheet webhook URL not configured');
    throw new Error('Inquiry Sheet webhook not configured');
  }

  try {
    // Determine source type
    let source = inquiryData.source || 'Unknown';
    if (inquiryData.type === 'estimate' || inquiryData.inputs) {
      source = 'Cost Calculator';
    } else if (inquiryData.type === 'contact') {
      source = 'Contact Form';
    } else if (inquiryData.type === 'whatsapp') {
      source = 'WhatsApp';
    }

    // Prepare payload for Google Sheets
    const payload = {
      type: 'inquiry',
      data: {
        inquiryId: inquiryData.id || inquiryData.estimateNumber || `INQ-${Date.now()}`,
        name: inquiryData.customer?.name || inquiryData.name || 'Unknown',
        phone: inquiryData.customer?.phone || inquiryData.phone || 'N/A',
        email: inquiryData.customer?.email || inquiryData.email || 'N/A',
        city: inquiryData.location?.city || inquiryData.city || 'N/A',
        pincode: inquiryData.location?.pincode || inquiryData.pincode || 'N/A',
        source: source,
        
        // For Cost Calculator estimates
        plotArea: inquiryData.inputs?.plotArea || 'N/A',
        floors: inquiryData.inputs?.floors || 'N/A',
        constructionType: inquiryData.inputs?.constructionType || 'N/A',
        builtUpArea: inquiryData.results?.builtUpArea || inquiryData.totals?.builtUpArea || 'N/A',
        
        // Products/Materials
        products: inquiryData.materials 
          ? formatMaterials(inquiryData.materials) 
          : formatProducts(inquiryData.items || []),
        
        // Estimated cost
        estimatedTotal: inquiryData.totals?.grandTotal 
          ? formatCurrency(inquiryData.totals.grandTotal) 
          : (inquiryData.estimatedCost ? formatCurrency(inquiryData.estimatedCost) : 'N/A'),
        
        // Contact form message
        message: inquiryData.message || 'N/A',
        subject: inquiryData.subject || 'N/A',
        
        createdDate: formatDate(inquiryData.createdAt),
        status: inquiryData.status || 'New',
        convertedToOrder: inquiryData.convertedToOrderId ? 'Yes' : 'No'
      }
    };

    // Send to Google Sheets webhook
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`Inquiry sent to Google Sheets: ${inquiryData.id}`, {
      status: response.status,
      data: response.data
    });

    return {
      success: true,
      inquiryId: inquiryData.id,
      timestamp: new Date().toISOString(),
      response: response.data
    };

  } catch (error) {
    console.error('Error sending inquiry to Google Sheets:', {
      inquiryId: inquiryData.id,
      error: error.message,
      response: error.response?.data
    });

    // Don't throw error - log and continue
    return {
      success: false,
      inquiryId: inquiryData.id,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

/**
 * Format materials object for Cost Calculator
 */
const formatMaterials = (materials) => {
  if (!materials || typeof materials !== 'object') return 'No materials';
  
  const parts = [];
  
  if (materials.cement?.quantity) {
    parts.push(`Cement – ${materials.cement.quantity} bags`);
  }
  if (materials.steel?.quantity) {
    parts.push(`Steel – ${materials.steel.quantity} kg`);
  }
  if (materials.sand?.quantity) {
    parts.push(`Sand – ${materials.sand.quantity} tons`);
  }
  if (materials.bricks?.quantity) {
    parts.push(`Bricks – ${materials.bricks.quantity} pieces`);
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'No materials';
};

/**
 * Manual resend to Google Sheets (for admin dashboard)
 * @param {string} type - 'purchase' or 'inquiry'
 * @param {Object} data - Data to resend
 */
const resendToSheet = async (type, data) => {
  if (type === 'purchase') {
    return await sendPurchaseToSheet(data);
  } else if (type === 'inquiry') {
    return await sendInquiryToSheet(data);
  } else {
    throw new Error('Invalid type. Must be "purchase" or "inquiry"');
  }
};

/**
 * Send Waste Sand Booking data to Google Sheets
 *
 * Expects a dedicated sheet tab named "Waste Sand Bookings" in the same
 * spreadsheet.  Webhook URL is stored in Firebase Functions config:
 *   firebase functions:config:set sheets.waste_sand_webhook="<Apps Script URL>"
 *
 * Sheet columns (A → L):
 *   Booking ID | Date | Name | Phone | Area | Qty (tons) |
 *   Price/Ton | Total | Advance | Status | Notes | Source
 *
 * @param {Object} bookingData - Document data from waste_sand_bookings/{id}
 * @returns {Promise<Object>} - { success, bookingId, timestamp, error? }
 */
const sendWasteSandToSheet = async (bookingData) => {
  const webhookUrl = functions.config().sheets?.waste_sand_webhook;

  if (!webhookUrl) {
    console.error('[WasteSand] waste_sand_webhook not configured in Firebase Functions config');
    throw new Error(
      'Waste Sand Sheet webhook not configured. ' +
      'Run: firebase functions:config:set sheets.waste_sand_webhook="<your Apps Script URL>"'
    );
  }

  try {
    const payload = {
      type: 'waste_sand_booking',
      data: {
        bookingId:  bookingData.id || `WSB-${Date.now()}`,
        date:       formatDate(bookingData.createdAt || new Date()),
        name:       bookingData.name       || 'Unknown',
        phone:      bookingData.phone      || 'N/A',
        area:       bookingData.area       || 'N/A',
        quantity:   bookingData.quantity   || 0,          // tons (number)
        pricePerTon: bookingData.pricePerTon || 1200,     // INR
        total:      formatCurrency(bookingData.totalAmount || 0),
        advance:    formatCurrency(bookingData.advance     || 0),
        status:     bookingData.status     || 'pending_payment',
        notes:      bookingData.notes      || '',
        source:     bookingData.source     || 'website',
      },
    };

    const response = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    console.log(`[WasteSand] Booking ${bookingData.id} sent to Google Sheets`, {
      status: response.status,
      data:   response.data,
    });

    return {
      success:   true,
      bookingId: bookingData.id,
      timestamp: new Date().toISOString(),
      response:  response.data,
    };
  } catch (error) {
    console.error('[WasteSand] Error sending to Google Sheets:', {
      bookingId: bookingData.id,
      error:     error.message,
      response:  error.response?.data,
    });

    // Non-throwing — caller decides whether to block the booking
    return {
      success:   false,
      bookingId: bookingData.id,
      timestamp: new Date().toISOString(),
      error:     error.message,
    };
  }
};


/**
 * sendDebrisSandToSheet
 *
 * Posts a debris_sand_bookings document to the Google Sheets webhook
 * configured at sheets.debris_sand_webhook in Firebase Functions config.
 *
 * Sheet columns (A→M):
 *   Booking ID | Date | Name | Phone | Area | Qty (tons) |
 *   Price/Ton ₹ | Total ₹ | Advance ₹ | Status | Notes | Source | Synced At
 *
 * Setup:
 *   firebase functions:config:set sheets.debris_sand_webhook="<Apps Script URL>"
 */
const sendDebrisSandToSheet = async (bookingData) => {
  const webhookUrl = functions.config().sheets?.debris_sand_webhook;

  if (!webhookUrl) {
    console.error('[DebrisSand] debris_sand_webhook not configured in Firebase Functions config');
    throw new Error(
      'Debris Sand Sheet webhook not configured. ' +
      'Run: firebase functions:config:set sheets.debris_sand_webhook="<your Apps Script URL>"'
    );
  }

  try {
    const payload = {
      type: 'debris_sand_booking',
      data: {
        bookingId:   bookingData.id || `DSB-${Date.now()}`,
        date:        formatDate(bookingData.createdAt || new Date()),
        name:        bookingData.name        || 'Unknown',
        phone:       bookingData.phone       || 'N/A',
        area:        bookingData.area        || 'N/A',
        quantity:    bookingData.quantity    || 0,
        pricePerTon: bookingData.pricePerTon || 900,
        total:       formatCurrency(bookingData.totalAmount || 0),
        advance:     formatCurrency(bookingData.advance     || 0),
        status:      bookingData.status      || 'pending_payment',
        notes:       bookingData.notes       || '',
        source:      bookingData.source      || 'website',
      },
    };

    const response = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    console.log(`[DebrisSand] Sheet sync response: ${response.status}`);

    return {
      success:   true,
      bookingId: bookingData.id,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[DebrisSand] sendDebrisSandToSheet error:', error.message);
    return {
      success:   false,
      bookingId: bookingData.id,
      timestamp: new Date().toISOString(),
      error:     error.message,
    };
  }
};


/**
 * sendSiteCleanToSheet
 *
 * Posts a site_clean_bookings document to the Google Sheets webhook
 * configured at sheets.site_clean_webhook in Firebase Functions config.
 *
 * Sheet columns (A → N):
 *   Booking ID | Date | Name | Phone | Location | Site Area (sq ft) |
 *   Package | Total ₹ | Status | Preferred Date | Notes | Source |
 *   Assigned To | Synced At
 *
 * Setup:
 *   firebase functions:config:set sheets.site_clean_webhook="<Apps Script URL>"
 */
const sendSiteCleanToSheet = async (bookingData) => {
  const webhookUrl = functions.config().sheets?.site_clean_webhook;

  if (!webhookUrl) {
    console.error('[SiteClean] site_clean_webhook not configured in Firebase Functions config');
    throw new Error(
      'Site Clean Sheet webhook not configured. ' +
      'Run: firebase functions:config:set sheets.site_clean_webhook="<your Apps Script URL>"'
    );
  }

  try {
    const payload = {
      type: 'site_clean_booking',
      data: {
        bookingId:     bookingData.id    || `SCB-${Date.now()}`,
        date:          formatDate(bookingData.createdAt || new Date()),
        name:          bookingData.name          || 'Unknown',
        phone:         bookingData.phone         || 'N/A',
        area:          bookingData.area          || 'N/A',
        siteArea:      bookingData.quantity      || 0,           // sq ft
        package:       bookingData.package       || 'To be quoted',
        totalAmount:   formatCurrency(bookingData.totalAmount || 0),
        status:        bookingData.status        || 'pending',
        preferredDate: bookingData.preferredDate || '',
        notes:         bookingData.notes         || '',
        source:        bookingData.source        || 'website',
        assignedTo:    bookingData.assignedTo    || '',
      },
    };

    const response = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    console.log(`[SiteClean] Booking ${bookingData.id} sent to Google Sheets`, {
      status: response.status,
      data:   response.data,
    });

    return {
      success:   true,
      bookingId: bookingData.id,
      timestamp: new Date().toISOString(),
      response:  response.data,
    };
  } catch (error) {
    console.error('[SiteClean] Error sending to Google Sheets:', {
      bookingId: bookingData.id,
      error:     error.message,
      response:  error.response?.data,
    });

    return {
      success:   false,
      bookingId: bookingData.id,
      timestamp: new Date().toISOString(),
      error:     error.message,
    };
  }
};

module.exports = {
  sendPurchaseToSheet,
  sendInquiryToSheet,
  sendWasteSandToSheet,
  sendDebrisSandToSheet,
  sendSiteCleanToSheet,
  resendToSheet,
  formatProducts,
  formatMaterials,
  formatCurrency,
  formatDate
};

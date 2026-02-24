const axios = require('axios');
const functions = require('firebase-functions');

/**
 * WhatsApp Business API Configuration
 * 
 * OPTIONS:
 * 1. Twilio WhatsApp API (Recommended - Easy setup)
 * 2. WhatsApp Business Platform (Official - More features)
 * 3. Third-party services (WATI, Interakt, Gupshup, etc.)
 */

// Get WhatsApp configuration from Firebase environment
const getWhatsAppConfig = () => {
  const provider = functions.config().whatsapp?.provider || 'twilio';
  
  if (provider === 'twilio') {
    return {
      provider: 'twilio',
      accountSid: functions.config().whatsapp?.twilio_account_sid,
      authToken: functions.config().whatsapp?.twilio_auth_token,
      fromNumber: functions.config().whatsapp?.twilio_from_number, // format: whatsapp:+14155238886
      baseUrl: 'https://api.twilio.com/2010-04-01'
    };
  } else if (provider === 'wati') {
    return {
      provider: 'wati',
      apiKey: functions.config().whatsapp?.wati_api_key,
      apiUrl: functions.config().whatsapp?.wati_api_url, // e.g., https://live-server-XXXX.wati.io
    };
  } else if (provider === 'whatsapp_business') {
    return {
      provider: 'whatsapp_business',
      accessToken: functions.config().whatsapp?.access_token,
      phoneNumberId: functions.config().whatsapp?.phone_number_id,
      baseUrl: 'https://graph.facebook.com/v18.0'
    };
  }
  
  throw new Error('WhatsApp provider not configured');
};

/**
 * Format phone number for WhatsApp
 * Input: +919876543210 or 919876543210 or 9876543210
 * Output: Depends on provider
 */
const formatPhoneNumber = (phone, provider) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming India)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  // Format based on provider
  if (provider === 'twilio') {
    return `whatsapp:+${cleaned}`;
  } else if (provider === 'wati' || provider === 'whatsapp_business') {
    return cleaned;
  }
  
  return cleaned;
};

/**
 * Send WhatsApp message via Twilio
 */
const sendViaTwilio = async (to, message, config) => {
  const url = `${config.baseUrl}/Accounts/${config.accountSid}/Messages.json`;
  
  const data = new URLSearchParams({
    From: config.fromNumber,
    To: formatPhoneNumber(to, 'twilio'),
    Body: message
  });
  
  try {
    const response = await axios.post(url, data, {
      auth: {
        username: config.accountSid,
        password: config.authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return { success: true, messageId: response.data.sid, provider: 'twilio' };
  } catch (error) {
    console.error('Twilio WhatsApp error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send WhatsApp message via WATI
 */
const sendViaWATI = async (to, message, config) => {
  const url = `${config.apiUrl}/api/v1/sendSessionMessage/${formatPhoneNumber(to, 'wati')}`;
  
  try {
    const response = await axios.post(
      url,
      {
        messageText: message
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, messageId: response.data.id, provider: 'wati' };
  } catch (error) {
    console.error('WATI WhatsApp error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send WhatsApp message via WhatsApp Business Platform
 */
const sendViaWhatsAppBusiness = async (to, message, config) => {
  const url = `${config.baseUrl}/${config.phoneNumberId}/messages`;
  
  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: formatPhoneNumber(to, 'whatsapp_business'),
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, messageId: response.data.messages[0].id, provider: 'whatsapp_business' };
  } catch (error) {
    console.error('WhatsApp Business error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Main function to send WhatsApp message
 * @param {string} to - Phone number (with or without country code)
 * @param {string} message - Message text
 * @returns {Promise<Object>} - Success/failure response
 */
const sendWhatsAppMessage = async (to, message) => {
  if (!to || !message) {
    throw new Error('Phone number and message are required');
  }
  
  try {
    const config = getWhatsAppConfig();
    
    console.log(`Sending WhatsApp to ${to} via ${config.provider}`);
    
    let result;
    
    switch (config.provider) {
      case 'twilio':
        result = await sendViaTwilio(to, message, config);
        break;
      case 'wati':
        result = await sendViaWATI(to, message, config);
        break;
      case 'whatsapp_business':
        result = await sendViaWhatsAppBusiness(to, message, config);
        break;
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
    
    console.log('WhatsApp sent successfully:', result);
    return result;
    
  } catch (error) {
    console.error('Failed to send WhatsApp:', error);
    
    // Don't throw error - just log and return failure
    // We don't want to block order processing if WhatsApp fails
    return {
      success: false,
      error: error.message,
      provider: error.config?.provider || 'unknown'
    };
  }
};

/**
 * MESSAGE TEMPLATES
 */

/**
 * Template: Order Confirmation
 */
const getOrderConfirmationMessage = (orderData) => {
  const itemsList = orderData.items
    .map(item => `• ${item.productName} - ${item.quantity} ${item.unit}`)
    .join('\n');
  
  const trackingUrl = `https://buildmart.com/track/${orderData.id}`;
  
  // Include invoice link if available
  const invoiceSection = orderData.invoice?.invoiceUrl 
    ? `\n📄 *Download Invoice:*\n${orderData.invoice.invoiceUrl}\n` 
    : '\n📄 *Invoice:* Will be sent shortly\n';
  
  return `🎉 *ORDER CONFIRMED - BUILDMART*

Order ID: *${orderData.orderNumber}*

📦 *Products:*
${itemsList}

💰 *Total Amount:* ₹${orderData.pricing.grandTotal.toLocaleString()}

📍 *Delivery Area:* ${orderData.delivery?.city || orderData.customer?.pincode}

💳 *Payment Status:* ${orderData.payment?.status || 'Pending'}
${invoiceSection}
🚚 *Track Your Order:*
${trackingUrl}

📞 Need help? Reply to this message or call us!

Thank you for choosing BuildMart! 🏗️`;
};

/**
 * Template: Order Out for Delivery
 */
const getOutForDeliveryMessage = (orderData) => {
  const driverInfo = orderData.deliveryPerson 
    ? `\n🚗 *Driver:* ${orderData.deliveryPerson.driverName}\n📞 *Contact:* ${orderData.deliveryPerson.driverPhone}\n🚛 *Vehicle:* ${orderData.deliveryPerson.vehicleNumber}`
    : '';
  
  return `🚚 *OUT FOR DELIVERY - BUILDMART*

Order ID: *${orderData.orderNumber}*
${driverInfo}

📍 *Delivery Address:*
${orderData.customer?.address}
${orderData.customer?.city}, ${orderData.customer?.pincode}

⏰ *Expected Delivery:* Today

Please keep ₹${orderData.pricing.grandTotal.toLocaleString()} ready if payment is pending.

📞 Questions? Call the driver or contact us!

BuildMart 🏗️`;
};

/**
 * Template: Order Delivered
 */
const getOrderDeliveredMessage = (orderData) => {
  const invoiceLink = orderData.invoice?.invoiceUrl || 'Check your email';
  
  return `✅ *ORDER DELIVERED - BUILDMART*

Order ID: *${orderData.orderNumber}*

Thank you for your order! 🎉

💰 *Total Paid:* ₹${orderData.pricing.grandTotal.toLocaleString()}

📄 *Download Invoice:*
${invoiceLink}

⭐ *Rate Your Experience:*
We'd love to hear your feedback!

Need more materials? Order again at buildmart.com

Thank you for choosing BuildMart! 🏗️`;
};

/**
 * Template: Inquiry Acknowledgment
 */
const getInquiryAcknowledgmentMessage = (inquiryData) => {
  const estimateInfo = inquiryData.totals?.grandTotal 
    ? `\n💰 *Estimated Cost:* ₹${inquiryData.totals.grandTotal.toLocaleString()}`
    : '';
  
  return `🙏 *THANK YOU - BUILDMART*

Dear ${inquiryData.customer?.name || inquiryData.name || 'Customer'},

Thank you for your inquiry!

${inquiryData.type === 'estimate' ? '📊 Your cost estimate has been received.' : ''}
${estimateInfo}

📞 *Our team will contact you shortly* to discuss:
• Product availability
• Delivery schedule
• Best pricing
• Any questions you may have

⏰ *Expected Response:* Within 2-4 hours

Meanwhile, you can:
• Browse products: buildmart.com/products
• Read our blog: buildmart.com/blog
• WhatsApp us: Reply to this message

BuildMart - Premium Construction Materials 🏗️`;
};

/**
 * Template: Payment Reminder
 */
const getPaymentReminderMessage = (orderData) => {
  return `⏰ *PAYMENT REMINDER - BUILDMART*

Order ID: *${orderData.orderNumber}*

💰 *Amount Due:* ₹${orderData.pricing.grandTotal.toLocaleString()}

Your order is ready, but we haven't received payment yet.

💳 *Pay Now:*
${orderData.payment?.razorpayLink || 'Contact us for payment link'}

📞 *Need Help?*
Call us or reply to this message.

Complete payment to start delivery! 🚚

BuildMart 🏗️`;
};

/**
 * Template: Order Cancelled
 */
const getOrderCancelledMessage = (orderData) => {
  return `❌ *ORDER CANCELLED - BUILDMART*

Order ID: *${orderData.orderNumber}*

Your order has been cancelled.

${orderData.cancellationReason ? `*Reason:* ${orderData.cancellationReason}` : ''}

💰 *Refund (if paid):* Will be processed within 3-5 business days

📞 *Questions?* Contact us anytime!

We're here to help! 🙏

BuildMart 🏗️`;
};

module.exports = {
  sendWhatsAppMessage,
  getOrderConfirmationMessage,
  getOutForDeliveryMessage,
  getOrderDeliveredMessage,
  getInquiryAcknowledgmentMessage,
  getPaymentReminderMessage,
  getOrderCancelledMessage
};

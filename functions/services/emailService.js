const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Amazon SES Email Service
 * Sends professional customer invoice emails with PDF attachments
 */

// Initialize SES Client
const initSESClient = () => {
  const accessKeyId = functions.config().aws?.access_key_id;
  const secretAccessKey = functions.config().aws?.secret_access_key;
  const region = functions.config().aws?.region || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS SES configuration missing');
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
};

/**
 * Check if customer should receive invoice email
 */
const shouldSendInvoiceEmail = (orderData) => {
  // Send if customer email exists
  if (orderData.customer?.email) {
    return true;
  }

  // Send if order value >= 5000
  if (orderData.pricing?.grandTotal >= 5000) {
    return true;
  }

  // Send if GST number provided
  if (orderData.customer?.gstNumber || orderData.gstNumber) {
    return true;
  }

  // Send if corporate customer
  if (orderData.customer?.type === 'CORPORATE' || orderData.customerType === 'CORPORATE') {
    return true;
  }

  return false;
};

/**
 * Generate email HTML body
 */
const generateEmailHTML = (orderData) => {
  const trackingUrl = `https://buildmart.com/track/${orderData.id}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #FDB913; padding: 20px; text-align: center; border: 3px solid #1f2937; }
    .header h1 { margin: 0; color: #1f2937; font-size: 28px; font-weight: 900; }
    .content { background: white; padding: 30px; border: 3px solid #1f2937; margin-top: 20px; }
    .order-id { font-size: 20px; font-weight: bold; color: #FDB913; margin-bottom: 20px; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; color: #1f2937; margin-bottom: 10px; font-size: 16px; text-transform: uppercase; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { color: #6b7280; }
    .info-value { font-weight: 600; color: #1f2937; }
    .highlight { background: #fffbeb; padding: 15px; border-left: 4px solid #FDB913; margin: 20px 0; }
    .total { font-size: 24px; font-weight: 900; color: #FDB913; text-align: center; padding: 20px; background: #1f2937; border: 3px solid #FDB913; }
    .button { display: inline-block; background: #FDB913; color: #1f2937; padding: 12px 30px; text-decoration: none; font-weight: bold; border: 3px solid #1f2937; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏗️ BUILDMART</h1>
    <p style="margin: 5px 0; color: #1f2937;">Premium Construction Materials</p>
  </div>

  <div class="content">
    <div class="order-id">
      Order #${orderData.orderNumber}
    </div>

    <div class="highlight">
      ✅ <strong>Your order has been confirmed and payment received!</strong><br>
      Your invoice is attached to this email.
    </div>

    <div class="section">
      <div class="section-title">📦 Order Summary</div>
      ${orderData.items.map(item => `
        <div class="info-row">
          <span>${item.productName}</span>
          <span>${item.quantity} ${item.unit}</span>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <div class="section-title">🚚 Delivery Details</div>
      <div class="info-row">
        <span class="info-label">Delivery Date:</span>
        <span class="info-value">${orderData.delivery?.estimatedDelivery ? new Date(orderData.delivery.estimatedDelivery.toDate ? orderData.delivery.estimatedDelivery.toDate() : orderData.delivery.estimatedDelivery).toLocaleDateString('en-IN') : 'Within 24-48 hours'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Delivery Slot:</span>
        <span class="info-value">${orderData.delivery?.slot || 'Standard'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Address:</span>
        <span class="info-value">${orderData.customer?.address}</span>
      </div>
      ${orderData.wasteCollection?.selected ? `
      <div class="highlight" style="margin-top: 15px;">
        🧹 <strong>Waste Sand Collection Included</strong><br>
        We'll collect old sand from your site!
      </div>
      ` : ''}
    </div>

    <div class="section">
      <div class="section-title">💰 Payment Summary</div>
      <div class="info-row">
        <span class="info-label">Subtotal:</span>
        <span class="info-value">₹${orderData.pricing?.subtotal.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">GST (18%):</span>
        <span class="info-value">₹${orderData.pricing?.totalGST.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Delivery Charge:</span>
        <span class="info-value">₹${orderData.pricing?.deliveryCharge.toLocaleString()}</span>
      </div>
      ${orderData.wasteCollection?.fee ? `
      <div class="info-row">
        <span class="info-label">Waste Collection:</span>
        <span class="info-value">${orderData.wasteCollection.isFree ? 'FREE' : `₹${orderData.wasteCollection.fee}`}</span>
      </div>
      ` : ''}
    </div>

    <div class="total">
      TOTAL: ₹${orderData.pricing?.grandTotal.toLocaleString()}
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${trackingUrl}" class="button">📍 Track Your Order</a>
    </div>

    <div class="highlight" style="margin-top: 30px;">
      <strong>📄 Invoice Attached</strong><br>
      Your GST invoice is attached to this email as a PDF file.
    </div>
  </div>

  <div class="footer">
    <p><strong>BuildMart - Premium Construction Materials</strong></p>
    <p>📞 +91 98765 43210 | 📧 sales@buildmart.com</p>
    <p>🌐 www.buildmart.com</p>
    <p style="margin-top: 15px; font-size: 11px;">
      This is an automated email. Please do not reply to this email.<br>
      For support, contact us via WhatsApp or call our helpline.
    </p>
  </div>
</body>
</html>
  `;
};

/**
 * Download invoice PDF from Firebase Storage
 */
const downloadInvoicePDF = async (invoiceUrl) => {
  try {
    const bucket = admin.storage().bucket();
    
    // Extract file path from URL
    const urlObj = new URL(invoiceUrl);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+?)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid invoice URL format');
    }
    
    const filePath = decodeURIComponent(pathMatch[1]);
    const file = bucket.file(filePath);
    
    // Download file as buffer
    const [buffer] = await file.download();
    
    return buffer;
    
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    throw error;
  }
};

/**
 * Create MIME email with PDF attachment
 */
const createMIMEMessage = (to, subject, htmlBody, pdfBuffer, invoiceNumber) => {
  const fromEmail = functions.config().aws?.from_email || 'noreply@buildmart.com';
  const boundary = `----=_Part_${Date.now()}`;
  
  // Base64 encode PDF
  const pdfBase64 = pdfBuffer.toString('base64');
  
  // Build MIME message
  const message = [
    `From: BuildMart <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlBody,
    ``,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${invoiceNumber}.pdf"`,
    `Content-Description: ${invoiceNumber}.pdf`,
    `Content-Disposition: attachment; filename="${invoiceNumber}.pdf"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    pdfBase64,
    ``,
    `--${boundary}--`
  ].join('\r\n');
  
  return message;
};

/**
 * Send invoice email via Amazon SES
 */
const sendInvoiceEmail = async (orderData) => {
  try {
    // Check if email should be sent
    if (!shouldSendInvoiceEmail(orderData)) {
      console.log('Order does not meet criteria for invoice email');
      return { success: false, reason: 'Does not meet criteria' };
    }

    // Get customer email (or use fallback)
    const toEmail = orderData.customer?.email || orderData.email;
    
    if (!toEmail) {
      console.log('No email address available for customer');
      return { success: false, reason: 'No email address' };
    }

    // Check if invoice exists
    if (!orderData.invoice?.invoiceUrl) {
      console.log('Invoice URL not available yet');
      return { success: false, reason: 'Invoice not generated' };
    }

    const sesClient = initSESClient();
    const fromEmail = functions.config().aws?.from_email || 'noreply@buildmart.com';

    // Download invoice PDF
    const pdfBuffer = await downloadInvoicePDF(orderData.invoice.invoiceUrl);

    // Generate email HTML
    const htmlBody = generateEmailHTML(orderData);

    // Create subject
    const subject = `Invoice & Delivery Confirmation – Order #${orderData.orderNumber}`;

    // Create MIME message with attachment
    const mimeMessage = createMIMEMessage(
      toEmail,
      subject,
      htmlBody,
      pdfBuffer,
      orderData.invoice.invoiceNumber
    );

    // Send email via SES
    const command = new SendRawEmailCommand({
      Source: fromEmail,
      Destinations: [toEmail],
      RawMessage: {
        Data: Buffer.from(mimeMessage)
      }
    });

    const response = await sesClient.send(command);

    console.log('Invoice email sent successfully:', {
      orderId: orderData.orderNumber,
      to: toEmail,
      messageId: response.MessageId
    });

    return {
      success: true,
      messageId: response.MessageId,
      to: toEmail,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error sending invoice email:', {
      orderId: orderData.orderNumber,
      error: error.message,
      stack: error.stack
    });

    // Don't throw - log and return failure
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  sendInvoiceEmail,
  shouldSendInvoiceEmail
};

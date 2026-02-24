const PDFDocument = require('pdfkit');
const admin = require('firebase-admin');

/**
 * Generate Invoice Number
 * Format: INV-2026-00123
 */
const generateInvoiceNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  
  // Get counter from Firestore
  const counterRef = admin.firestore().collection('counters').doc('invoices');
  
  try {
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 1;
      if (counterDoc.exists) {
        currentCount = (counterDoc.data().count || 0) + 1;
      }
      
      transaction.set(counterRef, { count: currentCount, year: year }, { merge: true });
      
      return currentCount;
    });
    
    // Format: INV-2026-00123
    const invoiceNumber = `INV-${year}-${String(result).padStart(5, '0')}`;
    return invoiceNumber;
    
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to timestamp-based
    return `INV-${year}-${Date.now()}`;
  }
};

/**
 * Format date for invoice
 */
const formatDate = (date) => {
  if (!date) return new Date().toLocaleDateString('en-IN');
  
  if (date.toDate) {
    return date.toDate().toLocaleDateString('en-IN');
  }
  
  return new Date(date).toLocaleDateString('en-IN');
};

/**
 * Create Invoice PDF
 * @param {Object} orderData - Complete order data
 * @param {string} invoiceNumber - Generated invoice number
 * @returns {Promise<Buffer>} - PDF buffer
 */
const createInvoicePDF = async (orderData, invoiceNumber) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const chunks = [];
      
      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Company Logo and Header
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#FDB913')
         .text('BUILDMART', 50, 50);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#000000')
         .text('Premium Construction Materials', 50, 85);
      
      // Company Details (Right side)
      doc.fontSize(9)
         .text('BuildMart Pvt. Ltd.', 350, 50, { align: 'right' })
         .text('123 Industrial Area, Navi Mumbai', 350, 65, { align: 'right' })
         .text('Maharashtra 400703, India', 350, 80, { align: 'right' })
         .text('Phone: +91 98765 43210', 350, 95, { align: 'right' })
         .text('Email: sales@buildmart.com', 350, 110, { align: 'right' })
         .text('GSTIN: 27AAAAA0000A1Z5', 350, 125, { align: 'right' });

      // Invoice Title
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('TAX INVOICE', 50, 160);

      // Invoice Details Box
      doc.strokeColor('#FDB913')
         .lineWidth(2)
         .rect(50, 195, 495, 80)
         .stroke();

      // Invoice Info
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Invoice Number:', 60, 210)
         .font('Helvetica')
         .text(invoiceNumber, 160, 210);

      doc.font('Helvetica-Bold')
         .text('Invoice Date:', 60, 230)
         .font('Helvetica')
         .text(formatDate(orderData.createdAt), 160, 230);

      doc.font('Helvetica-Bold')
         .text('Order ID:', 60, 250)
         .font('Helvetica')
         .text(orderData.orderNumber || 'N/A', 160, 250);

      doc.font('Helvetica-Bold')
         .text('Payment Status:', 320, 210)
         .font('Helvetica')
         .fillColor(orderData.payment?.status === 'Paid' ? '#10B981' : '#EF4444')
         .text(orderData.payment?.status || 'Pending', 420, 210)
         .fillColor('#000000');

      if (orderData.payment?.transactionId) {
        doc.font('Helvetica-Bold')
           .text('Transaction ID:', 320, 230)
           .font('Helvetica')
           .text(orderData.payment.transactionId, 420, 230);
      }

      // Customer Details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('BILL TO:', 50, 300);

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(orderData.customer?.name || 'N/A', 50, 320)
         .font('Helvetica')
         .text(orderData.customer?.phone || 'N/A', 50, 335)
         .text(orderData.customer?.email || 'N/A', 50, 350);

      // Delivery Address
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('SHIP TO:', 320, 300);

      doc.fontSize(10)
         .font('Helvetica')
         .text(orderData.customer?.address || orderData.delivery?.address || 'N/A', 320, 320, { width: 225 })
         .text(`${orderData.delivery?.city || ''}, ${orderData.customer?.pincode || orderData.delivery?.pincode || ''}`, 320, 350);

      // Items Table Header
      const tableTop = 400;
      
      doc.strokeColor('#000000')
         .lineWidth(1)
         .moveTo(50, tableTop)
         .lineTo(545, tableTop)
         .stroke();

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('S.No', 55, tableTop + 10, { width: 40 })
         .text('Description', 100, tableTop + 10, { width: 200 })
         .text('Qty', 310, tableTop + 10, { width: 60, align: 'right' })
         .text('Rate', 380, tableTop + 10, { width: 70, align: 'right' })
         .text('Amount', 460, tableTop + 10, { width: 80, align: 'right' });

      doc.moveTo(50, tableTop + 30)
         .lineTo(545, tableTop + 30)
         .stroke();

      // Items
      let yPosition = tableTop + 45;
      const items = orderData.items || [];
      
      items.forEach((item, index) => {
        doc.font('Helvetica')
           .text(index + 1, 55, yPosition, { width: 40 })
           .text(`${item.productName}\n(${item.category})`, 100, yPosition, { width: 200 })
           .text(`${item.quantity} ${item.unit}`, 310, yPosition, { width: 60, align: 'right' })
           .text(`₹${item.basePrice.toLocaleString()}`, 380, yPosition, { width: 70, align: 'right' })
           .text(`₹${(item.basePrice * item.quantity).toLocaleString()}`, 460, yPosition, { width: 80, align: 'right' });
        
        yPosition += 50;
        
        // Add new page if needed
        if (yPosition > 700 && index < items.length - 1) {
          doc.addPage();
          yPosition = 50;
        }
      });

      // Bottom line
      doc.moveTo(50, yPosition)
         .lineTo(545, yPosition)
         .stroke();

      yPosition += 20;

      // Totals Section
      const totalsX = 350;
      
      doc.font('Helvetica')
         .text('Subtotal:', totalsX, yPosition, { width: 100 })
         .text(`₹${(orderData.pricing?.subtotal || 0).toLocaleString()}`, 460, yPosition, { width: 80, align: 'right' });

      yPosition += 20;

      if (orderData.pricing?.totalGST) {
        doc.text(`GST (18%):`, totalsX, yPosition, { width: 100 })
           .text(`₹${orderData.pricing.totalGST.toLocaleString()}`, 460, yPosition, { width: 80, align: 'right' });
        yPosition += 20;
      }

      if (orderData.pricing?.deliveryCharge) {
        doc.text('Delivery Charge:', totalsX, yPosition, { width: 100 })
           .text(`₹${orderData.pricing.deliveryCharge.toLocaleString()}`, 460, yPosition, { width: 80, align: 'right' });
        yPosition += 20;
      }

      if (orderData.pricing?.discount) {
        doc.fillColor('#EF4444')
           .text('Discount:', totalsX, yPosition, { width: 100 })
           .text(`-₹${orderData.pricing.discount.toLocaleString()}`, 460, yPosition, { width: 80, align: 'right' })
           .fillColor('#000000');
        yPosition += 20;
      }

      // Grand Total
      doc.strokeColor('#FDB913')
         .lineWidth(2)
         .moveTo(350, yPosition)
         .lineTo(545, yPosition)
         .stroke();

      yPosition += 15;

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('GRAND TOTAL:', totalsX, yPosition, { width: 100 })
         .fontSize(14)
         .fillColor('#FDB913')
         .text(`₹${(orderData.pricing?.grandTotal || 0).toLocaleString()}`, 460, yPosition, { width: 80, align: 'right' })
         .fillColor('#000000');

      yPosition += 40;

      // Payment Details
      if (orderData.payment?.method) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Payment Method:', 50, yPosition)
           .font('Helvetica')
           .text(orderData.payment.method, 150, yPosition);
      }

      // Terms and Conditions
      yPosition += 40;
      
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Terms & Conditions:', 50, yPosition);

      yPosition += 20;

      doc.fontSize(8)
         .font('Helvetica')
         .text('1. Payment due within 7 days of invoice date.', 50, yPosition)
         .text('2. Goods once sold will not be taken back.', 50, yPosition + 12)
         .text('3. Interest @ 18% p.a. will be charged on delayed payments.', 50, yPosition + 24)
         .text('4. Subject to Maharashtra jurisdiction only.', 50, yPosition + 36);

      // Footer
      const footerY = 750;
      
      doc.fontSize(8)
         .fillColor('#666666')
         .text('This is a computer-generated invoice and does not require a signature.', 50, footerY, { align: 'center', width: 495 })
         .text('For queries, contact: sales@buildmart.com | +91 98765 43210', 50, footerY + 15, { align: 'center', width: 495 });

      // Authorized Signature
      doc.fontSize(10)
         .fillColor('#000000')
         .font('Helvetica-Bold')
         .text('For BuildMart Pvt. Ltd.', 400, yPosition + 60)
         .font('Helvetica-Oblique')
         .fontSize(8)
         .text('Authorized Signatory', 400, yPosition + 100);

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Upload PDF to Firebase Storage
 * @param {Buffer} pdfBuffer - PDF data
 * @param {string} invoiceNumber - Invoice number for filename
 * @returns {Promise<string>} - Public download URL
 */
const uploadInvoiceToStorage = async (pdfBuffer, invoiceNumber) => {
  const bucket = admin.storage().bucket();
  const fileName = `invoices/${invoiceNumber}.pdf`;
  const file = bucket.file(fileName);

  // Upload PDF
  await file.save(pdfBuffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        invoiceNumber: invoiceNumber,
        generatedAt: new Date().toISOString()
      }
    }
  });

  // Get signed URL (valid for 10 years)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2500' // Far future date
  });

  return url;
};

module.exports = {
  generateInvoiceNumber,
  createInvoicePDF,
  uploadInvoiceToStorage,
  formatDate
};

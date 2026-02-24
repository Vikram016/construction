const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { appendOrderToSheet } = require('../services/sheetsService');
const { sendInvoiceEmail, shouldSendInvoiceEmail } = require('../services/emailService');
const { 
  routeDelivery, 
  isDeliveryAlreadyCreated,
  DELIVERY_STATUS 
} = require('../services/deliveryRouting');

/**
 * COMPREHENSIVE ORDER FINALIZED TRIGGER
 * 
 * Handles:
 * - Order finalization (payment + delivery confirmed)
 * - Delivery routing (OWN/THIRD_PARTY/PICKUP)
 * - Invoice preference checking
 * - Google Sheets sync
 * - Email sending (respects invoice preference)
 * - WhatsApp notifications
 * - Duplicate prevention
 * - Error handling
 */

/**
 * Check if order should be processed
 */
const shouldProcessOrder = (beforeData, afterData) => {
  // Check state transition: Not finalized → Finalized
  const wasNotFinalized = beforeData.paymentStatus !== 'SUCCESS' || 
                          beforeData.deliveryStatus !== 'CONFIRMED';
  
  const isNowFinalized = afterData.paymentStatus === 'SUCCESS' && 
                         afterData.deliveryStatus === 'CONFIRMED';
  
  if (!(wasNotFinalized && isNowFinalized)) {
    return false;
  }
  
  return true;
};

/**
 * Check if invoice can be sent based on preference
 */
const canSendInvoice = (orderData, method) => {
  // If no preference set, don't send yet (wait for user selection)
  if (!orderData.invoice?.deliveryMethod) {
    console.log('Invoice delivery method not set yet, skipping send');
    return false;
  }
  
  const preference = orderData.invoice.deliveryMethod;
  
  // Check if this method matches preference
  if (method === 'EMAIL') {
    return preference === 'EMAIL' || preference === 'BOTH';
  }
  
  if (method === 'WHATSAPP') {
    return preference === 'WHATSAPP' || preference === 'BOTH';
  }
  
  return false;
};

/**
 * Main order finalized trigger
 */
exports.onOrderFinalizedWithDelivery = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const orderId = context.params.orderId;
    
    // GUARD 1: Check if order should be processed
    if (!shouldProcessOrder(beforeData, afterData)) {
      return null;
    }
    
    console.log(`Processing finalized order: ${afterData.orderNumber}`);
    
    // Use data from trigger (don't re-fetch)
    const orderData = { ...afterData, id: orderId };
    
    // Track updates to make
    const updates = {};
    const processingResults = {
      delivery: null,
      sheetSync: null,
      emailSend: null
    };
    
    // =================================================================
    // STEP 1: DELIVERY ROUTING (CRITICAL - Do this first)
    // =================================================================
    
    if (!afterData.delivery?.trackingId && !afterData.delivery?.thirdPartyTrackingId) {
      // GUARD 2: Prevent duplicate delivery creation
      if (!isDeliveryAlreadyCreated(beforeData, afterData)) {
        try {
          console.log(`Routing delivery for ${orderData.orderNumber}, type: ${orderData.delivery?.type}`);
          
          const deliveryResult = await routeDelivery(orderData);
          
          processingResults.delivery = deliveryResult;
          
          if (deliveryResult.success) {
            console.log(`Delivery routed successfully: ${JSON.stringify(deliveryResult)}`);
          } else {
            console.error(`Delivery routing failed: ${deliveryResult.error}`);
            updates.deliveryRoutingError = deliveryResult.error;
          }
          
        } catch (error) {
          console.error(`Delivery routing exception for ${orderData.orderNumber}:`, error.message);
          updates.deliveryRoutingError = error.message;
          // Continue processing - don't fail the entire function
        }
      } else {
        console.log(`Delivery already created for ${orderData.orderNumber}, skipping`);
      }
    }
    
    // =================================================================
    // STEP 2: GOOGLE SHEETS SYNC
    // =================================================================
    
    if (!afterData.sheetSynced) {
      try {
        console.log(`Syncing order ${orderData.orderNumber} to Google Sheets...`);
        const sheetResult = await appendOrderToSheet(orderData);
        
        processingResults.sheetSync = sheetResult;
        updates.sheetSynced = sheetResult.success;
        updates.sheetSyncedAt = admin.firestore.FieldValue.serverTimestamp();
        
        if (!sheetResult.success) {
          updates.sheetSyncError = sheetResult.error;
        }
        
        console.log(`Sheet sync ${sheetResult.success ? 'successful' : 'failed'}`);
      } catch (error) {
        console.error(`Sheet sync error for ${orderData.orderNumber}:`, error.message);
        updates.sheetSynced = false;
        updates.sheetSyncError = error.message;
      }
    } else {
      console.log(`Order ${orderData.orderNumber} already synced to sheet`);
    }
    
    // =================================================================
    // STEP 3: INVOICE EMAIL (Respects preference)
    // =================================================================
    
    if (!afterData.emailSent) {
      // Check if invoice preference allows email
      if (canSendInvoice(orderData, 'EMAIL')) {
        // Check if email should be sent (order value, corporate, etc.)
        if (shouldSendInvoiceEmail(orderData)) {
          try {
            console.log(`Sending invoice email for ${orderData.orderNumber}...`);
            const emailResult = await sendInvoiceEmail(orderData);
            
            processingResults.emailSend = emailResult;
            updates.emailSent = emailResult.success;
            updates.emailSentAt = admin.firestore.FieldValue.serverTimestamp();
            
            if (emailResult.success) {
              updates.emailSentTo = emailResult.to;
            } else {
              updates.emailError = emailResult.error;
            }
            
            console.log(`Email send ${emailResult.success ? 'successful' : 'failed'}`);
          } catch (error) {
            console.error(`Email error for ${orderData.orderNumber}:`, error.message);
            updates.emailSent = false;
            updates.emailError = error.message;
          }
        } else {
          console.log(`Order ${orderData.orderNumber} does not meet email criteria`);
          updates.emailSent = false;
          updates.emailSkipped = true;
          updates.emailSkipReason = 'Does not meet criteria';
        }
      } else {
        console.log(`Invoice preference does not allow EMAIL for ${orderData.orderNumber}`);
        updates.emailPending = true;
        updates.emailPendingReason = 'Waiting for invoice delivery preference';
      }
    } else {
      console.log(`Email already sent for ${orderData.orderNumber}`);
    }
    
    // =================================================================
    // STEP 4: BATCH UPDATE (Single write operation)
    // =================================================================
    
    if (Object.keys(updates).length > 0) {
      const batch = admin.firestore().batch();
      
      // Update order document
      const orderRef = change.after.ref;
      batch.update(orderRef, {
        ...updates,
        lastProcessedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Log processing event
      if (processingResults.delivery || processingResults.sheetSync || processingResults.emailSend) {
        const logRef = admin.firestore().collection('processingLogs').doc();
        batch.set(logRef, {
          type: 'ORDER_FINALIZED',
          orderId: orderId,
          orderNumber: orderData.orderNumber,
          deliveryType: orderData.delivery?.type,
          deliverySuccess: processingResults.delivery?.success || false,
          sheetSyncSuccess: processingResults.sheetSync?.success || false,
          emailSendSuccess: processingResults.emailSend?.success || false,
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Commit batch
      await batch.commit();
      console.log(`Batch update committed for ${orderData.orderNumber}`);
    }
    
    return {
      orderId,
      orderNumber: orderData.orderNumber,
      processed: true,
      deliveryRouted: !!processingResults.delivery,
      sheetSynced: updates.sheetSynced,
      emailSent: updates.emailSent
    };
  });

/**
 * Trigger when invoice preference is set
 * This sends pending emails/WhatsApp based on preference
 */
exports.onInvoicePreferenceSet = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const orderId = context.params.orderId;
    
    // Check if invoice preference was just set
    const preferenceJustSet = !beforeData.invoice?.deliveryMethod && 
                              afterData.invoice?.deliveryMethod;
    
    if (!preferenceJustSet) {
      return null;
    }
    
    console.log(`Invoice preference set for ${afterData.orderNumber}: ${afterData.invoice.deliveryMethod}`);
    
    const orderData = { ...afterData, id: orderId };
    const updates = {};
    
    // Send email if preference allows and not already sent
    if (!afterData.emailSent && canSendInvoice(orderData, 'EMAIL')) {
      if (shouldSendInvoiceEmail(orderData)) {
        try {
          const emailResult = await sendInvoiceEmail(orderData);
          
          updates.emailSent = emailResult.success;
          updates.emailSentAt = admin.firestore.FieldValue.serverTimestamp();
          
          if (emailResult.success) {
            updates.emailSentTo = emailResult.to;
          }
        } catch (error) {
          console.error('Error sending email after preference set:', error);
          updates.emailError = error.message;
        }
      }
    }
    
    // Update if needed
    if (Object.keys(updates).length > 0) {
      await change.after.ref.update(updates);
    }
    
    return null;
  });

module.exports = {
  shouldProcessOrder,
  canSendInvoice
};

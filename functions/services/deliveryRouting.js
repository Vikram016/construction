const admin = require('firebase-admin');
const axios = require('axios');
const functions = require('firebase-functions');

/**
 * DELIVERY ROUTING SERVICE
 * Handles all three delivery types: OWN, THIRD_PARTY, PICKUP
 * 
 * Key Features:
 * - Customer choice is always respected
 * - No price-based overrides
 * - Duplicate prevention
 * - Error handling with optional fallback
 * - Status standardization
 */

// Standardized delivery statuses
const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  COLLECTED: 'COLLECTED'
};

/**
 * Validate delivery type exists
 */
const validateDeliveryType = (order) => {
  const validTypes = ['OWN', 'THIRD_PARTY', 'PICKUP'];
  
  if (!order.delivery?.type) {
    throw new Error('Delivery type is required');
  }
  
  if (!validTypes.includes(order.delivery.type)) {
    throw new Error(`Invalid delivery type: ${order.delivery.type}`);
  }
  
  return true;
};

/**
 * Check if delivery has already been created
 */
const isDeliveryAlreadyCreated = (beforeData, afterData) => {
  // Check if trackingId was already set before this update
  if (beforeData?.delivery?.trackingId) {
    console.log('Delivery already created - trackingId exists');
    return true;
  }
  
  // Check if thirdPartyTrackingId exists (for third-party deliveries)
  if (beforeData?.delivery?.thirdPartyTrackingId) {
    console.log('Third-party delivery already created');
    return true;
  }
  
  // Check if pickup assignment already done
  if (beforeData?.delivery?.status === DELIVERY_STATUS.READY_FOR_PICKUP) {
    console.log('Pickup already marked as ready');
    return true;
  }
  
  return false;
};

/**
 * Create OWN delivery
 * Assigns to internal delivery fleet
 */
const createOwnDelivery = async (order) => {
  console.log(`Creating OWN delivery for order: ${order.orderNumber}`);
  
  try {
    const trackingId = `TRK-${order.orderNumber}-${Date.now()}`;
    
    // Calculate estimated delivery time (24-48 hours)
    const estimatedDelivery = new Date();
    estimatedDelivery.setHours(estimatedDelivery.getHours() + 24);
    
    // Adjust for waste collection if needed
    if (order.wasteCollection?.selected) {
      estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 30);
    }
    
    // Update order with delivery details
    await admin.firestore().collection('orders').doc(order.id).update({
      'delivery.trackingId': trackingId,
      'delivery.status': DELIVERY_STATUS.PENDING,
      'delivery.estimatedDelivery': admin.firestore.Timestamp.fromDate(estimatedDelivery),
      'delivery.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
      'delivery.type': 'OWN' // Ensure type is preserved
    });
    
    console.log(`OWN delivery created with tracking ID: ${trackingId}`);
    
    return {
      success: true,
      trackingId,
      estimatedDelivery,
      type: 'OWN'
    };
    
  } catch (error) {
    console.error('Error creating OWN delivery:', error);
    throw error;
  }
};

/**
 * Create THIRD_PARTY delivery
 * Calls external delivery API (e.g., Dunzo, Porter, Shadowfax)
 */
const createThirdPartyShipment = async (order) => {
  console.log(`Creating THIRD_PARTY delivery for order: ${order.orderNumber}`);
  
  try {
    // Get third-party API configuration
    const apiUrl = functions.config().delivery?.third_party_api_url || process.env.THIRD_PARTY_API_URL;
    const apiKey = functions.config().delivery?.third_party_api_key || process.env.THIRD_PARTY_API_KEY;
    
    if (!apiUrl || !apiKey) {
      console.warn('Third-party delivery API not configured, will use fallback');
      
      // Check if fallback to OWN is configured
      const allowFallback = functions.config().delivery?.allow_fallback === 'true';
      
      if (allowFallback) {
        console.log('Falling back to OWN delivery');
        return await createOwnDelivery(order);
      } else {
        throw new Error('Third-party delivery API not configured and fallback disabled');
      }
    }
    
    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setHours(estimatedDelivery.getHours() + 2);
    
    // Prepare API payload
    const payload = {
      order_id: order.orderNumber,
      pickup: {
        address: "BuildMart Warehouse, Navi Mumbai",
        contact: "+919876543210"
      },
      delivery: {
        address: order.customer?.address || order.delivery?.address,
        city: order.delivery?.city || order.customer?.city,
        pincode: order.customer?.pincode || order.delivery?.pincode,
        contact: order.customer?.phone,
        contact_name: order.customer?.name
      },
      items: order.items?.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        unit: item.unit
      })) || [],
      estimated_delivery: estimatedDelivery.toISOString(),
      vehicle_type: order.delivery?.vehicleType || 'Mini Truck',
      notes: order.wasteCollection?.selected 
        ? 'WASTE COLLECTION SERVICE - Allocate +30 mins'
        : 'Standard delivery'
    };
    
    // Call third-party API
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    const thirdPartyTrackingId = response.data.tracking_id || response.data.shipment_id;
    
    if (!thirdPartyTrackingId) {
      throw new Error('Third-party API did not return tracking ID');
    }
    
    // Update order with third-party tracking
    await admin.firestore().collection('orders').doc(order.id).update({
      'delivery.thirdPartyTrackingId': thirdPartyTrackingId,
      'delivery.status': DELIVERY_STATUS.SHIPPED,
      'delivery.estimatedDelivery': admin.firestore.Timestamp.fromDate(estimatedDelivery),
      'delivery.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
      'delivery.type': 'THIRD_PARTY', // Ensure type is preserved
      'delivery.provider': response.data.provider || 'External'
    });
    
    console.log(`THIRD_PARTY delivery created with tracking: ${thirdPartyTrackingId}`);
    
    return {
      success: true,
      thirdPartyTrackingId,
      estimatedDelivery,
      type: 'THIRD_PARTY',
      provider: response.data.provider
    };
    
  } catch (error) {
    console.error('Error creating THIRD_PARTY delivery:', error.message);
    
    // Check if fallback is allowed
    const allowFallback = functions.config().delivery?.allow_fallback === 'true';
    
    if (allowFallback) {
      console.log('Third-party API failed, falling back to OWN delivery');
      return await createOwnDelivery(order);
    } else {
      // Log error but don't crash - mark as pending for manual handling
      await admin.firestore().collection('orders').doc(order.id).update({
        'delivery.status': DELIVERY_STATUS.PENDING,
        'delivery.error': error.message,
        'delivery.lastUpdated': admin.firestore.FieldValue.serverTimestamp()
      });
      
      throw error;
    }
  }
};

/**
 * Mark order as READY_FOR_PICKUP
 * Customer will collect from warehouse/store
 */
const markReadyForPickup = async (order) => {
  console.log(`Marking order READY_FOR_PICKUP: ${order.orderNumber}`);
  
  try {
    const pickupId = `PICKUP-${order.orderNumber}`;
    
    // Update order for pickup
    await admin.firestore().collection('orders').doc(order.id).update({
      'delivery.trackingId': pickupId,
      'delivery.status': DELIVERY_STATUS.READY_FOR_PICKUP,
      'delivery.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
      'delivery.type': 'PICKUP', // Ensure type is preserved
      'delivery.pickupLocation': 'BuildMart Warehouse, Navi Mumbai, 400703',
      'delivery.pickupHours': 'Mon-Sat: 9 AM - 7 PM'
    });
    
    console.log(`Order marked READY_FOR_PICKUP: ${pickupId}`);
    
    return {
      success: true,
      pickupId,
      type: 'PICKUP'
    };
    
  } catch (error) {
    console.error('Error marking order for pickup:', error);
    throw error;
  }
};

/**
 * Route delivery based on type
 * Main entry point for delivery creation
 */
const routeDelivery = async (order) => {
  console.log(`Routing delivery for order: ${order.orderNumber}, Type: ${order.delivery?.type}`);
  
  try {
    // Validate delivery type exists
    validateDeliveryType(order);
    
    const deliveryType = order.delivery.type;
    
    // Route to appropriate handler
    switch (deliveryType) {
      case 'OWN':
        return await createOwnDelivery(order);
        
      case 'THIRD_PARTY':
        return await createThirdPartyShipment(order);
        
      case 'PICKUP':
        return await markReadyForPickup(order);
        
      default:
        throw new Error(`Unsupported delivery type: ${deliveryType}`);
    }
    
  } catch (error) {
    console.error('Error routing delivery:', error);
    
    // Log error to Firestore for admin review
    await admin.firestore().collection('orders').doc(order.id).update({
      'delivery.error': error.message,
      'delivery.errorAt': admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Don't crash the function - return error for logging
    return {
      success: false,
      error: error.message,
      type: order.delivery?.type
    };
  }
};

/**
 * Normalize legacy delivery status
 */
const normalizeDeliveryStatus = (status) => {
  const statusMap = {
    'pending': DELIVERY_STATUS.PENDING,
    'confirmed': DELIVERY_STATUS.ASSIGNED,
    'dispatched': DELIVERY_STATUS.OUT_FOR_DELIVERY,
    'out_for_delivery': DELIVERY_STATUS.OUT_FOR_DELIVERY,
    'delivered': DELIVERY_STATUS.DELIVERED,
    'ready': DELIVERY_STATUS.READY_FOR_PICKUP,
    'collected': DELIVERY_STATUS.COLLECTED
  };
  
  return statusMap[status?.toLowerCase()] || status;
};

module.exports = {
  routeDelivery,
  createOwnDelivery,
  createThirdPartyShipment,
  markReadyForPickup,
  validateDeliveryType,
  isDeliveryAlreadyCreated,
  normalizeDeliveryStatus,
  DELIVERY_STATUS
};

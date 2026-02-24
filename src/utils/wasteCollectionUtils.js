/**
 * Waste Sand Collection Service Utilities
 * 
 * Strategic Feature: Site cleanup support alongside delivery
 * Pricing: Free for orders ≥ ₹10,000, otherwise ₹199
 */

const WASTE_COLLECTION_CONFIG = {
  fee: 199,
  freeThreshold: 10000,
  additionalTimeMinutes: 30
};

/**
 * Calculate waste collection fee based on order total
 * @param {number} orderTotal - Total order amount (before waste fee)
 * @param {boolean} isSelected - Whether waste collection is selected
 * @returns {number} - Fee to charge (0 if free or not selected)
 */
const calculateWasteCollectionFee = (orderTotal, isSelected) => {
  if (!isSelected) {
    return 0;
  }

  // Free if order >= ₹10,000
  if (orderTotal >= WASTE_COLLECTION_CONFIG.freeThreshold) {
    return 0;
  }

  // Otherwise charge ₹199
  return WASTE_COLLECTION_CONFIG.fee;
};

/**
 * Check if waste collection is free for given order total
 * @param {number} orderTotal - Total order amount
 * @returns {boolean} - True if waste collection would be free
 */
const isWasteCollectionFree = (orderTotal) => {
  return orderTotal >= WASTE_COLLECTION_CONFIG.freeThreshold;
};

/**
 * Get waste collection display info
 * @param {number} orderTotal - Total order amount
 * @param {boolean} isSelected - Whether waste collection is selected
 * @returns {Object} - Display information
 */
const getWasteCollectionInfo = (orderTotal, isSelected) => {
  const fee = calculateWasteCollectionFee(orderTotal, isSelected);
  const isFree = isWasteCollectionFree(orderTotal);

  return {
    isSelected,
    fee,
    isFree,
    freeThreshold: WASTE_COLLECTION_CONFIG.freeThreshold,
    displayText: isSelected 
      ? (isFree ? 'Waste Sand Collection (FREE)' : `Waste Sand Collection - ₹${fee}`)
      : 'Waste Sand Collection (Not Selected)',
    whatsappText: isSelected
      ? `🧹 Waste Sand Collection: ${isFree ? 'FREE (Order > ₹10,000)' : `₹${fee}`}`
      : null,
    invoiceText: isSelected
      ? (isFree ? 'Waste Sand Collection (FREE - Order ≥ ₹10,000)' : 'Waste Sand Collection')
      : null
  };
};

/**
 * Calculate final order total including waste collection
 * @param {Object} pricing - Order pricing breakdown
 * @param {boolean} wasteCollectionSelected - Whether waste collection is selected
 * @returns {Object} - Updated pricing with waste collection
 */
const calculateFinalTotal = (pricing, wasteCollectionSelected) => {
  const {
    subtotal = 0,
    totalGST = 0,
    deliveryCharge = 0,
    discount = 0
  } = pricing;

  // Calculate base total (before waste collection)
  const baseTotal = subtotal + totalGST + deliveryCharge - discount;

  // Calculate waste collection fee
  const wasteCollectionFee = calculateWasteCollectionFee(baseTotal, wasteCollectionSelected);

  // Calculate grand total
  const grandTotal = baseTotal + wasteCollectionFee;

  return {
    ...pricing,
    wasteCollectionFee,
    wasteCollectionSelected,
    wasteCollectionFree: wasteCollectionSelected && wasteCollectionFee === 0,
    grandTotal
  };
};

/**
 * Adjust delivery time for waste collection
 * @param {Date} estimatedDelivery - Original estimated delivery time
 * @param {boolean} wasteCollectionSelected - Whether waste collection is selected
 * @returns {Date} - Adjusted delivery time
 */
const adjustDeliveryTime = (estimatedDelivery, wasteCollectionSelected) => {
  if (!wasteCollectionSelected) {
    return estimatedDelivery;
  }

  const adjusted = new Date(estimatedDelivery);
  adjusted.setMinutes(adjusted.getMinutes() + WASTE_COLLECTION_CONFIG.additionalTimeMinutes);
  return adjusted;
};

/**
 * Generate delivery notes for waste collection
 * @param {boolean} wasteCollectionSelected - Whether waste collection is selected
 * @param {string} existingNotes - Existing delivery notes
 * @returns {string} - Updated delivery notes
 */
const generateDeliveryNotes = (wasteCollectionSelected, existingNotes = '') => {
  if (!wasteCollectionSelected) {
    return existingNotes;
  }

  const wasteNote = '🧹 WASTE SAND COLLECTION SERVICE INCLUDED - Please collect old/waste sand from site after delivery. Additional 30 minutes allocated for cleanup.';

  return existingNotes 
    ? `${existingNotes}\n\n${wasteNote}`
    : wasteNote;
};

export {
  WASTE_COLLECTION_CONFIG,
  calculateWasteCollectionFee,
  isWasteCollectionFree,
  getWasteCollectionInfo,
  calculateFinalTotal,
  adjustDeliveryTime,
  generateDeliveryNotes
};
export default getWasteCollectionInfo;

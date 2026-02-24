/**
 * WhatsApp Utility Functions
 * Centralized WhatsApp integration for the entire app
 */

import { CONTACT_CONFIG } from '../config/contactConfig';

/**
 * Format message for WhatsApp with proper encoding
 * @param {Object} params - Message parameters
 * @returns {string} Encoded WhatsApp URL
 */
export const openWhatsApp = ({ 
  product = null, 
  dimensions = null, 
  quantity = null, 
  total = null,
  customMessage = null 
}) => {
  let message = '';

  if (customMessage) {
    // Use custom message if provided
    message = customMessage;
  } else if (product) {
    // Format product quote message
    message = `Hi! I'm interested in:\n\n`;
    message += `🏗️ *Product:* ${product}\n`;
    
    if (dimensions) {
      message += `📐 *Dimensions:* ${dimensions}\n`;
    }
    
    if (quantity) {
      message += `📦 *Quantity:* ${quantity}\n`;
    }
    
    if (total) {
      message += `💰 *Estimated Total:* ₹${total}\n`;
    }
    
    message += `\n📱 *Website:* BuildMart\n`;
    message += `\nPlease share more details and pricing.`;
  } else {
    // Default message
    message = `Hi! I need construction materials. Please share pricing.`;
  }

  // Encode message properly
  const encodedMessage = encodeURIComponent(message);
  
  // Get phone number from config
  const phoneNumber = CONTACT_CONFIG.whatsapp;
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  // Open in new window
  window.open(whatsappUrl, '_blank');
  
  return whatsappUrl;
};

/**
 * Format product details for WhatsApp
 * @param {Object} product - Product object
 * @param {number} qty - Quantity
 * @returns {string} Formatted message
 */
export const formatProductMessage = (product, qty = 1) => {
  let message = `Hi! I want to order:\n\n`;
  message += `🏗️ *${product.name}*\n`;
  message += `📦 Quantity: ${qty}\n`;
  
  if (product.price) {
    const total = product.price * qty;
    message += `💰 Price: ₹${product.price} per unit\n`;
    message += `💵 Total: ₹${total}\n`;
  }
  
  message += `\n📱 Website: BuildMart\n`;
  message += `\nPlease confirm availability and delivery details.`;
  
  return message;
};

/**
 * Format cart for WhatsApp checkout
 * @param {Array} cartItems - Array of cart items
 * @param {number} totalAmount - Total cart amount
 * @returns {string} Formatted message
 */
export const formatCartMessage = (cartItems, totalAmount) => {
  let message = `Hi! I want to place an order:\n\n`;
  message += `🛒 *Order Details:*\n`;
  
  cartItems.forEach((item, index) => {
    const price = item.basePrice || item.price || 0;
    message += `\n${index + 1}. ${item.name}\n`;
    message += `   Qty: ${item.quantity} ${item.unit} | Price: ₹${(price * item.quantity).toLocaleString()}\n`;
  });
  
  message += `\n💰 *Total Amount: ₹${totalAmount}*\n`;
  message += `\n📱 Website: BuildMart\n`;
  message += `\nPlease process this order and share delivery details.`;
  
  return message;
};

/**
 * Open WhatsApp with cart checkout
 * @param {Array} cartItems - Cart items
 * @param {number} total - Total amount
 */
export const openWhatsAppCheckout = (cartItems, total) => {
  const message = formatCartMessage(cartItems, total);
  openWhatsApp({ customMessage: message });
};

/**
 * Open WhatsApp for single product purchase
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to purchase
 */
export const openWhatsAppBuyNow = (product, quantity = 1) => {
  const message = formatProductMessage(product, quantity);
  openWhatsApp({ customMessage: message });
};

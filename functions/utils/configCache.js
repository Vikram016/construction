const admin = require('firebase-admin');

/**
 * CONFIGURATION CACHING UTILITY
 * 
 * Reduces Firestore reads by caching static configuration data in memory
 * Cache duration: 10 minutes
 * 
 * Cost Savings:
 * - Without cache: 1 read per function invocation
 * - With cache: 1 read per 10 minutes
 * - Example: 1000 invocations/hour → 1000 reads without cache, 6 reads with cache
 * - Savings: 99.4% reduction in config reads
 */

// In-memory cache
let cachedConfig = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Get application configuration with caching
 * @returns {Promise<Object>} - Configuration object
 */
const getAppConfig = async () => {
  const now = Date.now();
  
  // Return cached config if still valid
  if (cachedConfig && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached config');
    return cachedConfig;
  }
  
  console.log('Fetching fresh config from Firestore');
  
  try {
    const configDoc = await admin.firestore()
      .collection('config')
      .doc('appConfig')
      .get();
    
    if (!configDoc.exists) {
      console.warn('Config document not found, using defaults');
      cachedConfig = getDefaultConfig();
    } else {
      cachedConfig = configDoc.data();
    }
    
    cacheTimestamp = now;
    
    return cachedConfig;
    
  } catch (error) {
    console.error('Error fetching config:', error);
    
    // Return cached config if available, otherwise defaults
    if (cachedConfig) {
      console.log('Using stale cached config due to error');
      return cachedConfig;
    }
    
    console.log('Using default config due to error');
    return getDefaultConfig();
  }
};

/**
 * Get pricing configuration with caching
 */
const getPricingConfig = async () => {
  const config = await getAppConfig();
  return config.pricing || getDefaultPricingConfig();
};

/**
 * Get delivery configuration with caching
 */
const getDeliveryConfig = async () => {
  const config = await getAppConfig();
  return config.delivery || getDefaultDeliveryConfig();
};

/**
 * Get email configuration with caching
 */
const getEmailConfig = async () => {
  const config = await getAppConfig();
  return config.email || getDefaultEmailConfig();
};

/**
 * Clear cache (call this when config is updated)
 */
const clearConfigCache = () => {
  console.log('Clearing config cache');
  cachedConfig = null;
  cacheTimestamp = 0;
};

/**
 * Force refresh config
 */
const refreshConfig = async () => {
  clearConfigCache();
  return await getAppConfig();
};

/**
 * Default configuration (fallback)
 */
const getDefaultConfig = () => {
  return {
    pricing: getDefaultPricingConfig(),
    delivery: getDefaultDeliveryConfig(),
    email: getDefaultEmailConfig()
  };
};

const getDefaultPricingConfig = () => {
  return {
    gstRate: 0.18,
    wasteCollectionFee: 199,
    wasteCollectionFreeThreshold: 10000,
    handlingFeeRate: 0.02
  };
};

const getDefaultDeliveryConfig = () => {
  return {
    baseCharge: 200,
    perKmRate: 15,
    freeDeliveryThreshold: 10000,
    slots: ['Morning', 'Afternoon', 'Evening']
  };
};

const getDefaultEmailConfig = () => {
  return {
    sendEmailThreshold: 5000,
    corporateEmailRequired: true,
    gstEmailRequired: true
  };
};

/**
 * Get specific config value with fallback
 */
const getConfigValue = async (path, defaultValue) => {
  try {
    const config = await getAppConfig();
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) {
        return defaultValue;
      }
    }
    
    return value;
    
  } catch (error) {
    console.error(`Error getting config value for ${path}:`, error);
    return defaultValue;
  }
};

module.exports = {
  getAppConfig,
  getPricingConfig,
  getDeliveryConfig,
  getEmailConfig,
  clearConfigCache,
  refreshConfig,
  getConfigValue
};

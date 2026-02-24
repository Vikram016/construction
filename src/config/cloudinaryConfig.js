// src/config/cloudinaryConfig.js
// Cloudinary configuration and helper functions
// SECURITY: Never expose API secret in frontend - use upload preset or backend

/**
 * Cloudinary Configuration
 * 
 * SECURITY NOTES:
 * - VITE_CLOUDINARY_API_KEY is optional (only needed for signed uploads)
 * - NEVER add CLOUDINARY_API_SECRET to frontend .env
 * - Use unsigned upload preset for frontend uploads
 * - For production, implement signed uploads via Cloud Function
 * 
 * Get values from: https://cloudinary.com/console
 * Add to .env:
 * VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
 * VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
 */

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  // API Key is optional and only for signed uploads (handled server-side)
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
};

/**
 * Validate Cloudinary configuration
 * @returns {Object} { isValid: boolean, missing: string[] }
 */
export const validateCloudinaryConfig = () => {
  const missing = [];
  
  if (!CLOUDINARY_CONFIG.cloudName) {
    missing.push('VITE_CLOUDINARY_CLOUD_NAME');
  }
  
  if (!CLOUDINARY_CONFIG.uploadPreset) {
    missing.push('VITE_CLOUDINARY_UPLOAD_PRESET');
  }
  
  if (missing.length > 0) {
    console.warn(`
╔═══════════════════════════════════════════════════════════════╗
║ ⚠️  CLOUDINARY NOT CONFIGURED                                ║
╠═══════════════════════════════════════════════════════════════╣
║ Missing environment variables:                                ║
${missing.map(m => `║   • ${m}`).join('\n')}
║                                                                ║
║ Image uploads will not work until configured.                 ║
║ Add these to your .env file.                                  ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
};

/**
 * Check if Cloudinary is configured and ready to use
 * @returns {boolean}
 */
export const isCloudinaryConfigured = () => {
  return Boolean(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
};

/**
 * Get Cloudinary upload URL
 * @returns {string}
 */
export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string}
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  if (!publicId || !CLOUDINARY_CONFIG.cloudName) return '';

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
  ];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);

  const transformString = transformations.join(',');
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformString}/${publicId}`;
};

/**
 * Get thumbnail URL
 * @param {string} publicId
 * @returns {string}
 */
export const getThumbnailUrl = (publicId) => {
  return getOptimizedImageUrl(publicId, {
    width: 300,
    height: 300,
    crop: 'fill',
  });
};

/**
 * Get product image URL
 * @param {string} publicId
 * @returns {string}
 */
export const getProductImageUrl = (publicId) => {
  return getOptimizedImageUrl(publicId, {
    width: 800,
    quality: 'auto:good',
  });
};

/**
 * Supported image formats
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Maximum file size (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Validate image file
 * @param {File} file
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload JPG, PNG, or WebP images.' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` 
    };
  }

  return { valid: true, error: null };
};

export default CLOUDINARY_CONFIG;

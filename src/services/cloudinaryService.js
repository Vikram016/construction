// src/services/cloudinaryService.js
// Cloudinary upload and management service

import { 
  CLOUDINARY_CONFIG, 
  getCloudinaryUploadUrl,
  validateImageFile 
} from '../config/cloudinaryConfig';

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export const uploadImageToCloudinary = async (file, options = {}) => {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Check configuration
  if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
    throw new Error('Cloudinary is not configured. Please add credentials to .env file.');
  }

  const {
    folder = 'products', // Default folder
    tags = [],
    resourceType = 'image',
  } = options;

  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', folder);
  
  if (tags.length > 0) {
    formData.append('tags', tags.join(','));
  }

  // Optional: Add timestamp for unique naming
  formData.append('timestamp', Date.now());

  try {
    const response = await fetch(getCloudinaryUploadUrl(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();

    // Return standardized metadata
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * Note: This requires backend/Cloud Function implementation
 * Client-side delete needs authentication
 * 
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>}
 */
export const deleteImageFromCloudinary = async (publicId) => {
  // This should be called from a Cloud Function with admin credentials
  // For now, we'll just log it
  console.warn('Delete image from Cloudinary:', publicId);
  console.warn('Implement this in a Cloud Function with Cloudinary Admin API');
  
  // TODO: Implement Cloud Function endpoint
  // try {
  //   const response = await fetch('/api/cloudinary/delete', {
  //     method: 'DELETE',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ publicId }),
  //   });
  //   return response.ok;
  // } catch (error) {
  //   console.error('Delete error:', error);
  //   return false;
  // }

  return true; // Return true for now
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Upload options
 * @param {Function} onProgress - Progress callback (uploaded, total)
 * @returns {Promise<Object[]>} Array of upload results
 */
export const uploadMultipleImages = async (files, options = {}, onProgress = null) => {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadImageToCloudinary(files[i], options);
      results.push({ success: true, data: result, file: files[i] });
      
      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (error) {
      results.push({ 
        success: false, 
        error: error.message, 
        file: files[i] 
      });
      
      if (onProgress) {
        onProgress(i + 1, total);
      }
    }
  }

  return results;
};

/**
 * Generate signed upload params (for secure uploads)
 * This should be called from backend
 * 
 * @returns {Promise<Object>}
 */
export const getSignedUploadParams = async () => {
  // TODO: Implement backend endpoint
  // const response = await fetch('/api/cloudinary/signature', {
  //   method: 'POST',
  // });
  // return response.json();
  
  throw new Error('Signed uploads not implemented yet. Use upload preset for now.');
};

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  uploadMultipleImages,
  getSignedUploadParams,
};

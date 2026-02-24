// src/components/ImageUpload.jsx
// Reusable image upload component with drag & drop, preview, and validation

import { useState, useRef, useCallback } from 'react';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { validateImageFile, MAX_FILE_SIZE } from '../config/cloudinaryConfig';

/**
 * ImageUpload Component
 * 
 * @param {Object} props
 * @param {Function} props.onUploadComplete - Callback when upload succeeds (metadata)
 * @param {Function} props.onUploadError - Callback when upload fails (error)
 * @param {string} props.folder - Cloudinary folder (default: 'products')
 * @param {string[]} props.tags - Array of tags for categorization
 * @param {boolean} props.multiple - Allow multiple files
 * @param {string} props.label - Upload button label
 * @param {string} props.className - Additional CSS classes
 */
const ImageUpload = ({
  onUploadComplete,
  onUploadError,
  folder = 'products',
  tags = [],
  multiple = false,
  label = 'Upload Image',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((files) => {
    setError('');
    const fileArray = Array.from(files);
    
    // Validate each file
    const validFiles = [];
    const previews = [];
    
    for (const file of fileArray) {
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      
      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setPreviewUrls(previews);
        }
      };
      reader.readAsDataURL(file);
    }
    
    setSelectedFiles(validFiles);
  }, []);

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  /**
   * Handle file input change
   */
  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  /**
   * Upload files to Cloudinary
   */
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const uploadOptions = { folder, tags };
      const results = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        try {
          const result = await uploadImageToCloudinary(file, uploadOptions);
          results.push(result);
          
          // Update progress
          setUploadProgress(((i + 1) / selectedFiles.length) * 100);
        } catch (err) {
          throw err;
        }
      }

      // Success
      if (multiple) {
        onUploadComplete?.(results);
      } else {
        onUploadComplete?.(results[0]);
      }

      // Reset
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
      onUploadError?.(err);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Clear selection
   */
  const handleClear = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Open file picker
   */
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-construction-yellow bg-construction-yellow/10' 
            : 'border-neutral-300 bg-neutral-50 hover:border-construction-yellow hover:bg-neutral-100'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
        onClick={openFilePicker}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Icon & Text */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-neutral-700">
            {isDragging ? 'Drop files here' : 'Drag & drop images here'}
          </p>
          <p className="text-xs text-neutral-500">
            or click to browse
          </p>
          <p className="text-xs text-neutral-400">
            JPG, PNG, WebP · Max {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB
          </p>
        </div>
      </div>

      {/* Preview */}
      {previewUrls.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-700">
              Selected: {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
            </p>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-700 font-semibold"
              disabled={isUploading}
            >
              Clear
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-200">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                  {selectedFiles[index]?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Uploading...</span>
            <span className="font-semibold text-neutral-900">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-construction-yellow h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !isUploading && (
        <button
          onClick={handleUpload}
          className="w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-bold py-3 px-6 rounded-xl border-2 border-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading}
        >
          {label}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;

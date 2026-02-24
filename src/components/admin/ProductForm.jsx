// src/components/admin/ProductForm.jsx
// UPDATED: Now uses Cloudinary for image uploads instead of Firebase Storage
// Reusable form for both "Add Product" and "Edit Product"

import { useState } from 'react';
import ImageUpload from '../ImageUpload';
import { getProductImageUrl, getThumbnailUrl } from '../../config/cloudinaryConfig';

const CATEGORIES = ['Cement', 'Steel', 'Bricks', 'Sand & Aggregates', 'Other'];
const UNITS = ['bag (50kg)', 'kg', 'ton', 'piece', 'cubic meter', 'litre'];
const GST_RATES = [5, 12, 18, 28];

const EMPTY = {
  name: '',
  category: 'Cement',
  basePrice: '',
  gstPercentage: 18,
  unit: 'bag (50kg)',
  description: '',
  seoDescription: '',
  images: [], // Changed from imageUrl to images array
  stock: '',
  isActive: true,
};

const ProductForm = ({ initial = null, onSave, onCancel, loading = false }) => {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // ── field change ────────────────────────────────────────────────────────────
  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  // ── image upload complete (Cloudinary) ──────────────────────────────────────
  const handleImageUploadComplete = (metadata) => {
    // Cloudinary returns: { url, publicId, width, height, format, bytes, createdAt }
    const newImage = {
      url: metadata.url,
      publicId: metadata.publicId,
      width: metadata.width,
      height: metadata.height,
      uploadedAt: new Date(),
    };

    // Add to images array
    setForm((f) => ({
      ...f,
      images: [...(f.images || []), newImage],
    }));
    
    setUploadingImage(false);
  };

  // ── image upload error ──────────────────────────────────────────────────────
  const handleImageUploadError = (error) => {
    setErrors((e) => ({ ...e, images: error.message }));
    setUploadingImage(false);
  };

  // ── remove image ────────────────────────────────────────────────────────────
  const handleRemoveImage = (index) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
    }));
  };

  // ── live price preview ──────────────────────────────────────────────────────
  const basePrice = Number(form.basePrice) || 0;
  const gstAmt = basePrice * (Number(form.gstPercentage) / 100);
  const priceWithGst = basePrice + gstAmt;

  // ── validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.basePrice || form.basePrice <= 0) e.basePrice = 'Enter a valid price';
    if (form.stock === '' || form.stock < 0) e.stock = 'Enter stock quantity';
    if (!form.description.trim()) e.description = 'Short description required';
    if (!form.images || form.images.length === 0) e.images = 'Please upload at least one image';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Pass form data with Cloudinary metadata (no File object needed)
    onSave(form);
  };

  // ── UI helpers ───────────────────────────────────────────────────────────────
  const Field = ({ label, error, children, required }) => (
    <div>
      <label className="block text-sm font-bold text-neutral-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const inp = 'w-full border-2 border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-construction-yellow focus:outline-none transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Row 1: Name + Category */}
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Product Name" error={errors.name} required>
          <input 
            className={inp} 
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="ACC Cement OPC 53 Grade" 
          />
        </Field>

        <Field label="Category">
          <select 
            className={inp} 
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {/* Row 2: Base Price + GST + Unit */}
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Base Price (₹)" error={errors.basePrice} required>
          <input 
            className={inp} 
            type="number" 
            min="0" 
            value={form.basePrice}
            onChange={(e) => set('basePrice', e.target.value)}
            placeholder="380" 
          />
        </Field>

        <Field label="GST %">
          <select 
            className={inp} 
            value={form.gstPercentage}
            onChange={(e) => set('gstPercentage', Number(e.target.value))}
          >
            {GST_RATES.map((r) => (
              <option key={r} value={r}>{r}%</option>
            ))}
          </select>
        </Field>

        <Field label="Unit Type">
          <select 
            className={inp} 
            value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
          >
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </Field>
      </div>

      {/* Live Price Preview */}
      {basePrice > 0 && (
        <div className="bg-construction-yellow/20 border border-construction-yellow rounded-lg p-3 flex gap-6 text-sm">
          <span>Base: <strong>₹{basePrice.toLocaleString()}</strong></span>
          <span>+GST: <strong>₹{gstAmt.toFixed(0)}</strong></span>
          <span>Total: <strong className="text-lg">₹{priceWithGst.toFixed(0)}</strong> / {form.unit}</span>
        </div>
      )}

      {/* Stock + Active */}
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Stock Quantity" error={errors.stock} required>
          <input 
            className={inp} 
            type="number" 
            min="0" 
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            placeholder="500" 
          />
        </Field>

        <Field label="Status">
          <div className="flex items-center gap-3 mt-2">
            <button 
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? 'bg-green-500' : 'bg-neutral-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.isActive ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm font-semibold ${
              form.isActive ? 'text-green-600' : 'text-neutral-500'
            }`}>
              {form.isActive ? 'Active (visible on site)' : 'Disabled (hidden)'}
            </span>
          </div>
        </Field>
      </div>

      {/* Description */}
      <Field label="Short Description" error={errors.description} required>
        <textarea 
          className={inp} 
          rows={2} 
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="High strength cement for structural work" 
        />
      </Field>

      {/* SEO Description */}
      <Field label="SEO Description (shown on product page)">
        <textarea 
          className={inp} 
          rows={4} 
          value={form.seoDescription}
          onChange={(e) => set('seoDescription', e.target.value)}
          placeholder="Detailed product description including material composition, strength grade, recommended usage, benefits..." 
        />
        <p className="text-xs text-neutral-400 mt-1">
          Include: material composition · strength grade · usage · benefits · durability
        </p>
      </Field>

      {/* Image Upload - CLOUDINARY */}
      <Field label="Product Images" error={errors.images} required>
        <div className="space-y-4">
          {/* Current Images */}
          {form.images && form.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {form.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={getThumbnailUrl(img.publicId) || img.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-b-lg">
                    {img.width} × {img.height}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload New Images */}
          <ImageUpload
            onUploadComplete={handleImageUploadComplete}
            onUploadError={handleImageUploadError}
            folder="products"
            tags={['product', form.category?.toLowerCase()]}
            multiple={false}
            label="Upload Image"
          />
        </div>
      </Field>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button 
          type="submit" 
          disabled={loading || uploadingImage}
          className="flex-1 bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-bold py-3 rounded-lg border-2 border-neutral-900 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving…' : initial ? 'Update Product' : 'Add Product'}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 border-2 border-neutral-300 rounded-lg text-sm font-semibold hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;

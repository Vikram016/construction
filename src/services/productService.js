// src/services/productService.js
// Firestore CRUD for the `products` collection.
// Admin uses this to add/edit products.
// Product pages use this to read live data.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';

const COLLECTION = 'products';

// ─── Firestore schema ────────────────────────────────────────────────────────
// products/{id}
// {
//   name           : string        — "ACC Cement OPC 53 Grade"
//   slug           : string        — "acc-cement-opc-53"  (URL-friendly)
//   category       : string        — "Cement" | "Steel" | "Bricks" | "Sand & Aggregates"
//   basePrice      : number        — price per unit (excl. GST)
//   gstPercentage  : number        — 5 | 12 | 18 | 28
//   unit           : string        — "bag (50kg)" | "kg" | "ton" | "piece"
//   description    : string        — short product description
//   seoDescription : string        — rich SEO description for product page
//   imageUrl       : string        — Firebase Storage download URL
//   stock          : number        — total units in stock
//   isActive       : boolean       — show/hide on storefront
//   createdAt      : Timestamp
//   updatedAt      : Timestamp
// }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a URL-safe slug from a product name
 * e.g. "ACC Cement OPC 53 Grade" → "acc-cement-opc-53-grade"
 */
export const buildSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

// ── READ ─────────────────────────────────────────────────────────────────────

/** Fetch all active products (storefront) */
export const fetchActiveProducts = async () => {
  const q = query(
    collection(db, COLLECTION),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Fetch ALL products (admin panel — includes disabled) */
export const fetchAllProducts = async () => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Fetch a single product by Firestore document ID */
export const fetchProductById = async (id) => {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

// ── CREATE ────────────────────────────────────────────────────────────────────

/**
 * Add a new product to Firestore.
 * NOW UPDATED: Accepts Cloudinary image metadata (no File upload needed)
 * @param {Object} productData — fields to save (includes images array with Cloudinary metadata)
 * @returns {string} new document ID
 */
export const createProduct = async (productData) => {
  // Images are already uploaded to Cloudinary
  // productData.images contains: [{ url, publicId, width, height, uploadedAt }]
  
  const payload = {
    ...productData,
    slug: buildSlug(productData.name),
    images: productData.images || [], // Cloudinary metadata array
    isActive: productData.isActive ?? true,
    stock: Number(productData.stock) || 0,
    basePrice: Number(productData.basePrice) || 0,
    gstPercentage: Number(productData.gstPercentage) || 18,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref_ = await addDoc(collection(db, COLLECTION), payload);
  return ref_.id;
};

// ── UPDATE ────────────────────────────────────────────────────────────────────

/**
 * Update an existing product.
 * NOW UPDATED: Handles Cloudinary image metadata
 * Merges only the supplied fields — any field not passed is left as-is.
 * @param {string} id — Firestore document ID
 * @param {Object} updates — partial product fields (includes images array)
 */
export const updateProduct = async (id, updates) => {
  let extra = {};

  if (updates.name) {
    extra.slug = buildSlug(updates.name);
  }

  // Images are already Cloudinary metadata - no upload needed
  await updateDoc(doc(db, COLLECTION, id), {
    ...updates,
    ...extra,
    basePrice: Number(updates.basePrice),
    gstPercentage: Number(updates.gstPercentage),
    stock: Number(updates.stock),
    updatedAt: serverTimestamp(),
  });
};

/** Toggle a product's isActive flag */
export const toggleProductActive = async (id, currentValue) => {
  await updateDoc(doc(db, COLLECTION, id), {
    isActive: !currentValue,
    updatedAt: serverTimestamp(),
  });
};

// ── DELETE ────────────────────────────────────────────────────────────────────

/** 
 * Permanently remove a product
 * NOW UPDATED: Handles Cloudinary image deletion
 * Note: Cloudinary deletion should be done via Cloud Function with admin credentials
 * @param {string} id — Firestore document ID
 * @param {Array} images — Array of Cloudinary image objects with publicId
 */
export const deleteProduct = async (id, images = []) => {
  await deleteDoc(doc(db, COLLECTION, id));
  
  // TODO: Call Cloud Function to delete Cloudinary images
  // For now, just log the publicIds that should be deleted
  if (images && images.length > 0) {
    const publicIds = images.map(img => img.publicId).filter(Boolean);
    console.warn('Delete these images from Cloudinary:', publicIds);
    console.warn('Implement Cloud Function: functions/deleteCloudinaryImages');
    
    // Example Cloud Function call:
    // await fetch('/api/cloudinary/delete-batch', {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ publicIds }),
    // });
  }
};

// ── IMAGE UPLOAD (DEPRECATED - USE CLOUDINARY) ───────────────────────────────

// ── IMAGE UPLOAD (DEPRECATED - USE CLOUDINARY) ───────────────────────────────

/**
 * [DEPRECATED] Upload an image File to Firebase Storage
 * 
 * ⚠️ DO NOT USE - This function is deprecated
 * Use Cloudinary upload instead (see cloudinaryService.js)
 * 
 * This is kept for backward compatibility only.
 * 
 * @param {File} file
 * @param {string} name — used to build the storage path
 * @returns {string} public download URL
 * @deprecated Use uploadImageToCloudinary from cloudinaryService instead
 */
export const uploadProductImage = async (file, name) => {
  console.warn('uploadProductImage is deprecated. Use Cloudinary instead.');
  
  const ext = file.name.split('.').pop();
  const slug = buildSlug(name);
  const path = `products/${slug}-${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// ── PAYMENT LINK (placeholder — ready for Razorpay) ──────────────────────────

/**
 * Generate a payment link for an order.
 * Replace the body of this function with your Razorpay API call.
 *
 * @param {Object} orderDetails — { productName, quantity, totalAmount, customerName, customerPhone }
 * @returns {string} payment URL
 */
export const generatePaymentLink = async (orderDetails) => {
  // TODO: POST to your backend / Razorpay API
  // const response = await axios.post('/api/create-payment-link', orderDetails);
  // return response.data.short_url;

  // Simulation: returns a dummy URL for UI testing
  const params = new URLSearchParams({
    amount: orderDetails.totalAmount,
    description: orderDetails.productName,
    customer_name: orderDetails.customerName,
    customer_phone: orderDetails.customerPhone,
  });
  return `https://rzp.io/l/buildmart-demo?${params.toString()}`;
};

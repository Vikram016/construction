/**
 * AdminProducts.jsx — /admin/products
 * Full product management: add, edit, delete, toggle active, upload images to Cloudinary
 * Images → Cloudinary → URL saved to Firestore → Products page reads live
 */

import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect } from "react";
import {
  CLOUDINARY_CONFIG,
  getCloudinaryUploadUrl,
  validateImageFile,
} from "../config/cloudinaryConfig";

/* ── Constants ───────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "jelly", label: "Jelly / Chips", emoji: "🪨", unit: "per load" },
  { id: "sand", label: "Sand", emoji: "🏖", unit: "per load" },
  { id: "bricks", label: "Red Bricks", emoji: "🧱", unit: "per brick" },
  {
    id: "blocks",
    label: "Concrete / Hollow Blocks",
    emoji: "🏗",
    unit: "per block",
  },
  {
    id: "weightless",
    label: "Weightless / AAC Blocks",
    emoji: "⬜",
    unit: "per block",
  },
  { id: "cement", label: "Cement", emoji: "🏢", unit: "per 50 kg bag" },
  { id: "tractor", label: "Tractor Loads", emoji: "🚜", unit: "per load" },
  { id: "other", label: "Other", emoji: "📦", unit: "per unit" },
];

const EMPTY_FORM = {
  name: "",
  category: "sand",
  price: "",
  unit: "per load",
  usedFor: "",
  img: "",
  imgPublicId: "",
  isActive: true,
};

/* ── Cloudinary upload helper ─────────────────────────────────────────────── */
const uploadToCloudinary = async (file, onProgress) => {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
    throw new Error(
      "Cloudinary not configured — add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("folder", "buildmart/products");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", getCloudinaryUploadUrl());

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url, publicId: data.public_id });
      } else {
        reject(new Error("Upload failed: " + xhr.statusText));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
};

/* ── Image Upload Zone component ─────────────────────────────────────────── */
const ImageUploadZone = ({ currentImg, onUploaded, disabled }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFile = useCallback(
    async (file) => {
      setError("");
      setUploading(true);
      setProgress(0);
      try {
        const result = await uploadToCloudinary(file, setProgress);
        onUploaded(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onUploaded],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      {/* Current image preview */}
      {currentImg && (
        <div className="relative w-full h-44 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
          <img
            src={currentImg}
            alt="Product"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">
              Change Image
            </span>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${dragging ? "border-orange-400 bg-orange-50" : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${uploading ? "pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files[0]) handleFile(e.target.files[0]);
          }}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="text-sm font-bold text-gray-600">
              Uploading to Cloudinary… {progress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: progress + "%" }}
              />
            </div>
          </div>
        ) : (
          <div>
            <svg
              className="w-10 h-10 text-gray-300 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-semibold text-gray-600">
              {currentImg
                ? "Drop new image to replace"
                : "Drop image here or click to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP · Max 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg font-semibold">
          ⚠ {error}
        </div>
      )}

      {/* Cloudinary not configured warning */}
      {!CLOUDINARY_CONFIG.cloudName && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg">
          <strong>Cloudinary not configured.</strong> Add{" "}
          <code>VITE_CLOUDINARY_CLOUD_NAME</code> and{" "}
          <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> to your <code>.env</code>{" "}
          file.
        </div>
      )}
    </div>
  );
};

/* ── Product Form modal ───────────────────────────────────────────────────── */
const ProductModal = ({ product, onSave, onClose, saving }) => {
  const isEdit = Boolean(product?.id);
  const [form, setForm] = useState(product || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Enter a valid price";
    if (!form.usedFor.trim()) e.usedFor = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, price: Number(form.price) });
  };

  const inp = (err) =>
    `w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all ${
      err
        ? "border-red-400 focus:border-red-500 bg-red-50"
        : "border-gray-200 focus:border-orange-400 bg-white"
    }`;

  const catObj = CATEGORIES.find((c) => c.id === form.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-black text-gray-900 text-lg">
            {isEdit ? `Edit — ${product.name}` : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. 20mm Baby Jelly"
              className={inp(errors.name)}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category + unit row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => {
                  set("category", e.target.value);
                  set(
                    "unit",
                    CATEGORIES.find((c) => c.id === e.target.value)?.unit ||
                      form.unit,
                  );
                }}
                className={inp(false)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Unit
              </label>
              <input
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="per load"
                className={inp(false)}
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="100"
                className={inp(errors.price) + " pl-7"}
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
            {form.price > 0 && (
              <p className="text-orange-600 text-xs mt-1 font-semibold">
                ₹{Number(form.price).toLocaleString("en-IN")} {form.unit}
              </p>
            )}
          </div>

          {/* Used for description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Used For (description) <span className="text-red-500">*</span>
            </label>
            <input
              value={form.usedFor}
              onChange={(e) => set("usedFor", e.target.value)}
              placeholder="e.g. Concrete aggregate for slabs & columns"
              className={inp(errors.usedFor)}
            />
            {errors.usedFor && (
              <p className="text-red-500 text-xs mt-1">{errors.usedFor}</p>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Product Image → Cloudinary
            </label>
            <ImageUploadZone
              currentImg={form.img}
              onUploaded={({ url, publicId }) => {
                set("img", url);
                set("imgPublicId", publicId);
              }}
              disabled={saving}
            />
            {/* OR paste URL */}
            <div className="mt-2">
              <input
                value={form.img}
                onChange={(e) => set("img", e.target.value)}
                placeholder="Or paste image URL directly"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900 text-sm">
                Visible on website
              </p>
              <p className="text-gray-400 text-xs">
                Toggle off to hide from customers
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : isEdit ? (
                "✓ Update Product"
              ) : (
                "+ Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Toast notification ───────────────────────────────────────────────────── */
const Toast = ({ msg }) =>
  msg ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-bounce-once">
      <span>✓</span> {msg}
    </div>
  ) : null;

/* ════ MAIN ADMIN PRODUCTS PAGE ════════════════════════════════════════════ */
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | product object
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [confirmDel, setConfirmDel] = useState(null);

  /* ── fetch all products from Firestore ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ── Save (add or edit) ── */
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (formData.id) {
        // Edit — update existing doc
        const { id, ...data } = formData;
        await updateDoc(doc(db, "products", id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        notify("Product updated ✓");
      } else {
        // Add — create new doc
        await addDoc(collection(db, "products"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        notify("Product added ✓");
      }
      await fetchProducts();
      setModal(null);
    } catch (e) {
      notify("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Toggle active ── */
  const handleToggle = async (p) => {
    try {
      await updateDoc(doc(db, "products", p.id), {
        isActive: !p.isActive,
        updatedAt: serverTimestamp(),
      });
      setProducts((ps) =>
        ps.map((x) => (x.id === p.id ? { ...x, isActive: !x.isActive } : x)),
      );
      notify(`${p.name} ${p.isActive ? "hidden" : "shown"} ✓`);
    } catch (e) {
      notify("Error: " + e.message);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (p) => {
    try {
      await deleteDoc(doc(db, "products", p.id));
      setProducts((ps) => ps.filter((x) => x.id !== p.id));
      setConfirmDel(null);
      notify("Deleted ✓");
    } catch (e) {
      notify("Error: " + e.message);
    }
  };

  /* ── Filter ── */
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.usedFor?.toLowerCase().includes(q);
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    hidden: products.filter((p) => !p.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="bg-gray-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Admin
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="font-black text-base sm:text-lg">
            🏗 Product Manager
          </h1>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Product
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "bg-blue-50 text-blue-800 border-blue-200",
            },
            {
              label: "Visible",
              value: stats.active,
              color: "bg-green-50 text-green-800 border-green-200",
            },
            {
              label: "Hidden",
              value: stats.hidden,
              color: "bg-gray-50 text-gray-700 border-gray-200",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`border rounded-2xl p-4 text-center ${s.color}`}
            >
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search + filter ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Product list ── */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Loading products from Firestore…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-bold text-gray-900 mb-1">
              {products.length === 0 ? "No products yet" : "No results"}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {products.length === 0
                ? "Add your first product to get started"
                : "Try a different search or filter"}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => setModal("add")}
                className="bg-orange-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-400 transition-colors"
              >
                + Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Table header — desktop only */}
            <div className="hidden sm:grid grid-cols-[64px_1fr_120px_90px_100px_110px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>Image</span>
              <span>Product</span>
              <span>Category</span>
              <span className="text-right">Price</span>
              <span className="text-center">Status</span>
              <span className="text-center">Actions</span>
            </div>

            {filtered.map((p, idx) => {
              const cat = CATEGORIES.find((c) => c.id === p.category);
              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-1 sm:grid-cols-[64px_1fr_120px_90px_100px_110px] gap-3 items-center px-5 py-4 ${idx < filtered.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/50 transition-colors`}
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                    {p.img ? (
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {cat?.emoji || "📦"}
                      </div>
                    )}
                  </div>

                  {/* Name + description */}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {p.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">
                      {p.usedFor}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{cat?.emoji}</span>
                    <span className="text-xs text-gray-600 font-medium truncate">
                      {cat?.label || p.category}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="sm:text-right">
                    <span className="font-black text-gray-900 text-base">
                      ₹{Number(p.price || 0).toLocaleString("en-IN")}
                    </span>
                    <p className="text-gray-400 text-xs">{p.unit}</p>
                  </div>

                  {/* Status toggle */}
                  <div className="sm:text-center">
                    <button
                      onClick={() => handleToggle(p)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                        p.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      {p.isActive ? "Visible" : "Hidden"}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:justify-center">
                    <button
                      onClick={() => setModal(p)}
                      className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDel(p)}
                      className="flex items-center justify-center w-8 h-8 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Firestore info note ── */}
        {products.length > 0 && (
          <p className="text-center text-gray-400 text-xs">
            {products.length} products in Firestore · Products page reads live
            from this data
          </p>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {modal && (
        <ProductModal
          product={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {/* ── Delete confirm ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <p className="text-4xl mb-3 text-center">🗑️</p>
            <h3 className="font-black text-gray-900 text-center mb-2">
              Delete Product?
            </h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              "<strong>{confirmDel.name}</strong>" will be permanently removed
              from Firestore and the Products page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDel(null)}
                className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDel)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
};

export default AdminProducts;

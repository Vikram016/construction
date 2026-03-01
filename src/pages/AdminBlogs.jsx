/**
 * AdminBlogs.jsx — /admin/blogs
 * Full blog management: add, edit, delete, upload cover image to Cloudinary
 * Images → Cloudinary → URL saved to Firestore → Blog page reads live
 */

import { useState, useRef, useCallback, useEffect } from "react";
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
import {
  CLOUDINARY_CONFIG,
  getCloudinaryUploadUrl,
  validateImageFile,
} from "../config/cloudinaryConfig";

/* ── Constants ───────────────────────────────────────────────────────────── */
const CATEGORIES = [
  "Construction Tips",
  "Material Guide",
  "Cost Saving",
  "Seasonal Tips",
  "Material Comparison",
  "Quality Control",
  "News",
  "Other",
];

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  coverImagePublicId: "",
  category: "Construction Tips",
  readTime: "5 min read",
  author: "BuildMart Team",
  featured: false,
  isActive: true,
  publishedAt: new Date().toISOString().split("T")[0],
};

/* ── Slug generator ──────────────────────────────────────────────────────── */
const toSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

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
  formData.append("folder", "buildmart/blogs");

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

/* ── Image Upload Zone ────────────────────────────────────────────────────── */
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

  return (
    <div className="space-y-3">
      {currentImg && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
          <img
            src={currentImg}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">
              Change Image
            </span>
          </div>
        </div>
      )}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${dragging ? "border-orange-400 bg-orange-50" : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"}
          ${disabled || uploading ? "pointer-events-none opacity-50" : ""}`}
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
            <p className="text-sm font-bold text-gray-600">
              Uploading to Cloudinary… {progress}%
            </p>
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
              className="w-8 h-8 text-gray-300 mx-auto mb-2"
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
                ? "Drop to replace cover image"
                : "Drop cover image here or click to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP · Max 5MB · Recommended: 800×500px
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-xs font-semibold bg-red-50 px-3 py-2 rounded-lg">
          ⚠ {error}
        </p>
      )}
      {!CLOUDINARY_CONFIG.cloudName && (
        <p className="text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <strong>Cloudinary not configured.</strong> Add env vars to enable
          upload.
        </p>
      )}
    </div>
  );
};

/* ── Blog Form Modal ──────────────────────────────────────────────────────── */
const BlogModal = ({ blog, onSave, onClose, saving }) => {
  const isEdit = Boolean(blog?.id);
  const [form, setForm] = useState(blog || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState("basic"); // 'basic' | 'content' | 'image'

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  // Auto-generate slug from title
  const handleTitleChange = (v) => {
    set("title", v);
    if (!isEdit || !form.slug) set("slug", toSlug(v));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.slug.trim()) e.slug = "Required";
    if (!form.excerpt.trim()) e.excerpt = "Required";
    if (!form.content.trim()) e.content = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const inp = (err) =>
    `w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all ${
      err
        ? "border-red-400 bg-red-50"
        : "border-gray-200 focus:border-orange-400"
    }`;

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "content", label: "Content" },
    { id: "image", label: "Cover Image" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">
            {isEdit
              ? `Edit — ${blog.title.slice(0, 30)}…`
              : "Write New Blog Post"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
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

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {t.label}
              {(t.id === "basic" &&
                (errors.title || errors.slug || errors.excerpt)) ||
              (t.id === "content" && errors.content) ? (
                <span className="ml-1.5 w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
              ) : null}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* ── BASIC TAB ── */}
            {tab === "basic" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="How to Choose the Right Cement for Your Project"
                    className={inp(errors.title)}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-mono">
                      /blog/
                    </span>
                    <input
                      value={form.slug}
                      onChange={(e) => set("slug", toSlug(e.target.value))}
                      placeholder="how-to-choose-cement"
                      className={inp(errors.slug) + " font-mono text-sm flex-1"}
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Excerpt (shown in blog list){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => set("excerpt", e.target.value)}
                    rows={3}
                    placeholder="A short description of the article (2-3 sentences)…"
                    className={inp(errors.excerpt)}
                  />
                  {errors.excerpt && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.excerpt}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className={inp(false)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Read Time
                    </label>
                    <input
                      value={form.readTime}
                      onChange={(e) => set("readTime", e.target.value)}
                      placeholder="5 min read"
                      className={inp(false)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Author
                    </label>
                    <input
                      value={form.author}
                      onChange={(e) => set("author", e.target.value)}
                      placeholder="BuildMart Team"
                      className={inp(false)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Publish Date
                    </label>
                    <input
                      type="date"
                      value={form.publishedAt}
                      onChange={(e) => set("publishedAt", e.target.value)}
                      className={inp(false)}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => set("featured", e.target.checked)}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Featured post
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => set("isActive", e.target.checked)}
                      className="w-4 h-4 accent-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Published (visible)
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* ── CONTENT TAB ── */}
            {tab === "content" && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Article Content (HTML) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Use HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;,
                  &lt;ul&gt;&lt;li&gt;, &lt;ol&gt;&lt;li&gt;, &lt;strong&gt;
                </p>
                <textarea
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  rows={18}
                  placeholder={`<h2>Introduction</h2>\n<p>Your article content here...</p>\n\n<h3>Section 1</h3>\n<p>More content...</p>`}
                  className={
                    inp(errors.content) + " font-mono text-xs leading-relaxed"
                  }
                />
                {errors.content && (
                  <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {form.content.length} characters
                </p>
              </div>
            )}

            {/* ── IMAGE TAB ── */}
            {tab === "image" && (
              <div className="space-y-4">
                <ImageUploadZone
                  currentImg={form.coverImage}
                  onUploaded={({ url, publicId }) => {
                    set("coverImage", url);
                    set("coverImagePublicId", publicId);
                  }}
                  disabled={saving}
                />
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Or paste image URL
                  </label>
                  <input
                    value={form.coverImage}
                    onChange={(e) => set("coverImage", e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className={inp(false)}
                  />
                </div>
                {form.coverImage && (
                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 font-mono break-all">
                    {form.coverImage}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 px-6 pb-6">
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
                "✓ Update Post"
              ) : (
                "+ Publish Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Toast ────────────────────────────────────────────────────────────────── */
const Toast = ({ msg }) =>
  msg ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
      ✓ {msg}
    </div>
  ) : null;

/* ════ MAIN PAGE ════════════════════════════════════════════════════════════ */
const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ── Fetch ── */
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "blogs"), orderBy("publishedAt", "desc"));
      const snap = await getDocs(q);
      setBlogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  /* ── Save ── */
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (formData.id) {
        const { id, ...data } = formData;
        await updateDoc(doc(db, "blogs", id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        notify("Post updated ✓");
      } else {
        await addDoc(collection(db, "blogs"), {
          ...formData,
          views: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        notify("Post published ✓");
      }
      await fetchBlogs();
      setModal(null);
    } catch (e) {
      notify("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Toggle active ── */
  const handleToggle = async (b) => {
    try {
      await updateDoc(doc(db, "blogs", b.id), {
        isActive: !b.isActive,
        updatedAt: serverTimestamp(),
      });
      setBlogs((bs) =>
        bs.map((x) => (x.id === b.id ? { ...x, isActive: !x.isActive } : x)),
      );
      notify(`Post ${b.isActive ? "unpublished" : "published"} ✓`);
    } catch (e) {
      notify("Error: " + e.message);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (b) => {
    try {
      await deleteDoc(doc(db, "blogs", b.id));
      setBlogs((bs) => bs.filter((x) => x.id !== b.id));
      setConfirmDel(null);
      notify("Deleted ✓");
    } catch (e) {
      notify("Error: " + e.message);
    }
  };

  const filtered = blogs.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.isActive !== false).length,
    draft: blogs.filter((b) => b.isActive === false).length,
    featured: blogs.filter((b) => b.featured).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Admin
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="font-black text-base sm:text-lg">✍️ Blog Manager</h1>
        </div>
        <button
          onClick={() => setModal("new")}
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
          New Post
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "bg-blue-50  text-blue-800  border-blue-200",
            },
            {
              label: "Published",
              value: stats.published,
              color: "bg-green-50 text-green-800 border-green-200",
            },
            {
              label: "Draft",
              value: stats.draft,
              color: "bg-gray-50  text-gray-700  border-gray-200",
            },
            {
              label: "Featured",
              value: stats.featured,
              color: "bg-amber-50 text-amber-800 border-amber-200",
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

        {/* Search */}
        <div className="relative">
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
            placeholder="Search posts…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Blog list */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Loading posts from Firestore…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">✍️</p>
            <p className="font-bold text-gray-900 mb-1">
              {blogs.length === 0 ? "No posts yet" : "No results"}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {blogs.length === 0
                ? "Write your first blog post"
                : "Try different search terms"}
            </p>
            {blogs.length === 0 && (
              <button
                onClick={() => setModal("new")}
                className="bg-orange-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-400"
              >
                + Write First Post
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {filtered.map((b, idx) => (
              <div
                key={b.id}
                className={`flex gap-4 items-center px-5 py-4 ${idx < filtered.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/50 transition-colors`}
              >
                {/* Cover image */}
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  {b.coverImage ? (
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📝
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {b.title}
                    </p>
                    {b.featured && (
                      <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        ★ Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-orange-600 font-semibold">
                      {b.category}
                    </span>
                    <span className="text-xs text-gray-400">{b.readTime}</span>
                    <span className="text-xs text-gray-400">
                      {b.publishedAt}
                    </span>
                    <span className="text-xs text-gray-400">
                      👁 {b.views || 0}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <button
                  onClick={() => handleToggle(b)}
                  className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    b.isActive !== false
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${b.isActive !== false ? "bg-green-500" : "bg-gray-400"}`}
                  />
                  {b.isActive !== false ? "Published" : "Draft"}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/blog/${b.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Preview"
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <button
                    onClick={() => setModal(b)}
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
                    onClick={() => setConfirmDel(b)}
                    className="w-8 h-8 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center"
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
            ))}
          </div>
        )}

        {blogs.length > 0 && (
          <p className="text-center text-gray-400 text-xs">
            {blogs.length} posts in Firestore · Blog page reads live from this
            data
          </p>
        )}
      </div>

      {/* Blog modal */}
      {modal && (
        <BlogModal
          blog={modal === "new" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <p className="text-4xl mb-3 text-center">🗑️</p>
            <h3 className="font-black text-gray-900 text-center mb-2">
              Delete Post?
            </h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              "<strong>{confirmDel.title?.slice(0, 40)}…</strong>" will be
              permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDel(null)}
                className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDel)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm"
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

export default AdminBlogs;

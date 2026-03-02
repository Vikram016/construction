/**
 * QuoteForm.jsx
 * Customer fills this → saves to Firestore `inquiries` collection
 * Firebase Function fires automatically:
 *   → WhatsApp auto-reply to customer
 *   → WhatsApp alert to YOU with full customer details
 *   → Google Sheets sync
 */

import { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CONTACT_CONFIG } from "../config/contactConfig";

/* ── Product categories for the form ─────────────────────────────────────── */
const PRODUCTS = [
  "🪨 Jelly / Chips (12mm, 20mm, 40mm)",
  "🏖 M-Sand",
  "🏖 River Sand",
  "🏖 P-Sand",
  "🧱 Red Bricks",
  "🏗 Concrete / Hollow Blocks",
  "⬜ Weightless / AAC Blocks",
  "🏢 Cement",
  "🚜 Tractor Load",
  "📦 Multiple Items",
  "❓ Not Sure — Need Guidance",
];

/* ── Generate inquiry number ──────────────────────────────────────────────── */
const genInquiryNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QT-${date}-${rand}`;
};

/* ── Main component ───────────────────────────────────────────────────────── */
const QuoteForm = ({ onSuccess, compact = false }) => {
  const [step, setStep] = useState(1); // 1=details, 2=success
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    product: "",
    quantity: "",
    deliveryArea: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setError("");
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid 10-digit number";
    if (!form.product) e.product = "Please select a product";
    if (!form.deliveryArea.trim()) e.deliveryArea = "Delivery area is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError("");

    try {
      const inquiryNumber = genInquiryNumber();
      const phoneClean = form.phone.replace(/\D/g, "");
      const phoneWithCode =
        phoneClean.length === 10 ? "91" + phoneClean : phoneClean;

      await addDoc(collection(db, "inquiries"), {
        inquiryNumber,
        type: "quote_request",
        source: "website_form",

        // Customer details
        name: form.name.trim(),
        phone: phoneWithCode,
        email: form.email.trim() || null,

        // Quote details
        product: form.product,
        quantity: form.quantity.trim() || null,
        deliveryArea: form.deliveryArea.trim(),
        message: form.message.trim() || null,

        // Nested customer object (matches whatsappNotifications.js format)
        customer: {
          name: form.name.trim(),
          phone: phoneWithCode,
          email: form.email.trim() || null,
          city: form.deliveryArea.trim(),
        },

        // Status
        status: "new",
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStep(2);
      if (onSuccess) onSuccess({ inquiryNumber, ...form });
    } catch (err) {
      console.error("Quote submission error:", err);
      setError("Something went wrong. Please try WhatsApp directly.");
    } finally {
      setSaving(false);
    }
  };

  const inp = (err) =>
    `w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all bg-white
     ${err ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-orange-400"}`;

  /* ── Success screen ── */
  if (step === 2) {
    return (
      <div className={`${compact ? "p-6" : "p-8"} text-center`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">
          Quote Request Sent!
        </h3>
        <p className="text-gray-500 text-sm mb-1">
          We've received your request,{" "}
          <strong>{form.name.split(" ")[0]}</strong>.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Our team will WhatsApp you at <strong>+91 {form.phone}</strong> within{" "}
          <strong>2 hours</strong>.
        </p>

        {/* WhatsApp fallback */}
        <a
          href={`https://wa.me/${CONTACT_CONFIG.whatsapp}?text=${encodeURIComponent(
            `Hi! I just submitted a quote request on your website.\n\nName: ${form.name}\nProduct: ${form.product}\nArea: ${form.deliveryArea}\n\nPlease send me the quote.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Chat on WhatsApp Now
        </a>

        <button
          onClick={() => {
            setStep(1);
            setForm({
              name: "",
              phone: "",
              email: "",
              product: "",
              quantity: "",
              deliveryArea: "",
              message: "",
            });
          }}
          className="block mx-auto mt-3 text-gray-400 hover:text-gray-600 text-xs underline transition-colors"
        >
          Submit another request
        </button>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "p-5 space-y-4" : "p-6 sm:p-8 space-y-5"}
    >
      {!compact && (
        <div className="mb-6">
          <h3 className="text-2xl font-black text-gray-900">
            Get a Free Quote
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            We'll WhatsApp you within 2 hours with pricing
          </p>
        </div>
      )}

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Rajesh Kumar"
            className={inp(errors.name)}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
              placeholder="98765 43210"
              className={inp(errors.phone) + " pl-12"}
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Email{" "}
          <span className="text-gray-400 font-normal">
            (optional — for invoice)
          </span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="rajesh@example.com"
          className={inp(false)}
        />
      </div>

      {/* Product */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          What do you need? <span className="text-red-500">*</span>
        </label>
        <select
          value={form.product}
          onChange={(e) => set("product", e.target.value)}
          className={inp(errors.product)}
        >
          <option value="">Select a product…</option>
          {PRODUCTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errors.product && (
          <p className="text-red-500 text-xs mt-1">{errors.product}</p>
        )}
      </div>

      {/* Quantity + Delivery area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Approximate Quantity{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            placeholder="e.g. 5 loads, 100 bags, 500 bricks"
            className={inp(false)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Delivery Area <span className="text-red-500">*</span>
          </label>
          <input
            value={form.deliveryArea}
            onChange={(e) => set("deliveryArea", e.target.value)}
            placeholder="e.g. Whitefield, Hoskote, KR Puram"
            className={inp(errors.deliveryArea)}
          />
          {errors.deliveryArea && (
            <p className="text-red-500 text-xs mt-1">{errors.deliveryArea}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Additional Details{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          rows={3}
          placeholder="Any specific requirements, delivery date, project type…"
          className={inp(false) + " resize-none"}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          ⚠ {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
      >
        {saving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Sending…</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Get Free Quote on WhatsApp
          </>
        )}
      </button>

      <p className="text-center text-gray-400 text-xs">
        🔒 Your details are safe · We never spam · Reply STOP to unsubscribe
      </p>
    </form>
  );
};

export default QuoteForm;

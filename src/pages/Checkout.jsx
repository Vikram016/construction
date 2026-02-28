/**
 * Checkout.jsx — 3-step checkout: Address → Review → Payment
 * Payment flow: Razorpay → on success → save to Firestore → Google Sheets + Invoice
 */
import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CONTACT_CONFIG } from "../config/contactConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import InvoicePreview from "../components/InvoicePreview";
import { db } from "../firebase/firebaseConfig";

/* ── Icons ── */
const WAIcon = () => (
  <svg
    className="w-5 h-5 flex-shrink-0"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);
const CheckIcon = () => (
  <svg
    className="w-5 h-5"
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
);
const SpinIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
    />
  </svg>
);

/* ── Constants ── */
/* Full Bengaluru areas with pincodes for autocomplete */
const AREAS_DATA = [
  { name: "Angondhalli", pincode: "562130" },
  { name: "Whitefield", pincode: "560066" },
  { name: "Hoskote", pincode: "562114" },
  { name: "KR Puram", pincode: "560036" },
  { name: "Marathahalli", pincode: "560037" },
  { name: "Koramangala", pincode: "560034" },
  { name: "HSR Layout", pincode: "560102" },
  { name: "Indiranagar", pincode: "560038" },
  { name: "Electronic City", pincode: "560100" },
  { name: "Hebbal", pincode: "560024" },
  { name: "Jayanagar", pincode: "560041" },
  { name: "JP Nagar", pincode: "560078" },
  { name: "Bannerghatta Road", pincode: "560076" },
  { name: "Banashankari", pincode: "560050" },
  { name: "BTM Layout", pincode: "560076" },
  { name: "Rajajinagar", pincode: "560010" },
  { name: "Malleshwaram", pincode: "560003" },
  { name: "Yeshwanthpur", pincode: "560022" },
  { name: "Peenya", pincode: "560058" },
  { name: "Tumkur Road", pincode: "560073" },
  { name: "Outer Ring Road", pincode: "560103" },
  { name: "Sarjapur Road", pincode: "560035" },
  { name: "Bellandur", pincode: "560103" },
  { name: "Varthur", pincode: "560087" },
  { name: "Yelahanka", pincode: "560064" },
  { name: "Devanahalli", pincode: "562110" },
  { name: "Domlur", pincode: "560071" },
  { name: "Nagarbhavi", pincode: "560072" },
  { name: "Vijayanagar", pincode: "560040" },
  { name: "Basavanagudi", pincode: "560004" },
  { name: "Shivajinagar", pincode: "560001" },
  { name: "MG Road", pincode: "560001" },
  { name: "Ulsoor", pincode: "560008" },
  { name: "RT Nagar", pincode: "560032" },
  { name: "Hennur", pincode: "560043" },
  { name: "Thanisandra", pincode: "560077" },
  { name: "Jakkur", pincode: "560064" },
  { name: "Kengeri", pincode: "560060" },
  { name: "Uttarahalli", pincode: "560061" },
  { name: "Bannerghatta", pincode: "560083" },
  { name: "Hosur Road", pincode: "560068" },
  { name: "Old Madras Road", pincode: "560049" },
  { name: "Kalyan Nagar", pincode: "560043" },
  { name: "CV Raman Nagar", pincode: "560093" },
  { name: "Other", pincode: "" },
];

/* Build pincode→area lookup */
const PINCODE_MAP = Object.fromEntries(
  AREAS_DATA.filter((a) => a.pincode).map((a) => [a.pincode, a.name]),
);

const AREAS = AREAS_DATA.map((a) => a.name);
const STEPS = ["Details", "Review", "Payment"];
const RAZORPAY_KEY =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_XXXXXXXXXXXXXXXX";
const RAZORPAY_LINK =
  import.meta.env.VITE_RAZORPAY_PAYMENT_LINK ||
  "https://rzp.io/l/buildmart-orders";

/* ── Step bar ── */
const StepBar = ({ current }) => (
  <div className="flex items-center mb-10">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={
                "w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all " +
                (done
                  ? "bg-green-500 border-green-500 text-white"
                  : active
                    ? "bg-construction-yellow border-neutral-900 text-neutral-900"
                    : "bg-white border-neutral-300 text-neutral-400")
              }
            >
              {done ? <CheckIcon /> : i + 1}
            </div>
            <span
              className={
                "text-xs font-bold mt-1 uppercase tracking-wider " +
                (active ? "text-neutral-900" : "text-neutral-400")
              }
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={
                "flex-1 h-1 mx-2 mb-5 rounded-full " +
                (done ? "bg-green-500" : "bg-neutral-200")
              }
            />
          )}
        </div>
      );
    })}
  </div>
);

/* ── Field wrapper ── */
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>
    )}
  </div>
);
const inputCls = (err) =>
  "w-full px-4 py-3 border-2 rounded-lg font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all text-sm " +
  (err
    ? "border-red-400 focus:border-red-500 bg-red-50"
    : "border-neutral-300 focus:border-construction-yellow bg-white");

/* ════ MAIN COMPONENT ════════════════════════════════════════════════════════ */
const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, deliveryCharge, grandTotal, clearCart } =
    useCart();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [payFailed, setPayFailed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [finalItems, setFinalItems] = useState([]);
  const [finalPricing, setFinalPricing] = useState({});

  /* Form state */
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    area: "",
    pincode: "",
    deliveryType: "Site Delivery",
    deliveryDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  /* Redirect if empty */
  if (!cartItems.length && !submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-black text-neutral-900 mb-3">
            Cart is empty
          </h2>
          <p className="text-neutral-500 mb-6">
            Add products before checking out
          </p>
          <Link
            to="/products"
            className="inline-block bg-construction-yellow text-neutral-900 font-bold px-8 py-3 border-3 border-neutral-900 uppercase hover:bg-construction-orange transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  /* Validation */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid 10-digit mobile number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.address.trim()) e.address = "Delivery address is required";
    if (!form.area) e.area = "Please select your area";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* Generate order ID */
  const generateOrderNumber = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const seq = Math.floor(1000 + Math.random() * 9000);
    return `BM-${yy}${mm}${dd}-${seq}`;
  };

  /* Save pending order to Firestore (before payment) */
  const savePendingOrder = async (orderNumber) => {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        orderNumber,
        customer: { ...form },
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          basePrice: item.basePrice,
          lineTotal: item.basePrice * item.quantity,
        })),
        pricing: { subtotal, deliveryCharge, grandTotal },
        payment: { status: "Pending", method: "Online" },
        status: "pending_payment",
        createdAt: serverTimestamp(),
        source: "website",
      });
      return docRef.id;
    } catch (err) {
      console.warn("[checkout] Firestore save failed:", err.message);
      return "local-" + Date.now();
    }
  };

  /* Update Firestore after successful payment */
  const confirmPayment = async (firestoreId, payId, orderNumber) => {
    if (firestoreId.startsWith("local-")) return;
    try {
      await updateDoc(doc(db, "orders", firestoreId), {
        "payment.status": "Paid",
        "payment.paymentId": payId,
        "payment.paidAt": serverTimestamp(),
        status: "confirmed",
      });
    } catch (err) {
      console.warn("[checkout] Payment confirm update failed:", err.message);
    }
  };

  /* Razorpay inline SDK */
  const openRazorpay = (firestoreId, orderNumber) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY,
        amount: grandTotal * 100,
        currency: "INR",
        name: "BuildMart",
        description: "Building Materials — " + orderNumber,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        notes: { order_id: firestoreId, order_number: orderNumber },
        theme: { color: "#FDB913" },
        handler: (response) => resolve(response.razorpay_payment_id),
        modal: { ondismiss: () => reject(new Error("dismissed")) },
      };

      if (typeof window.Razorpay !== "undefined") {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => reject(new Error("failed")));
        rzp.open();
      } else {
        /* Razorpay SDK not loaded — fallback to payment link */
        const params = new URLSearchParams({
          amount: grandTotal * 100,
          description: "BuildMart Order " + orderNumber,
          name: form.name,
          contact: form.phone,
          email: form.email,
        });
        window.open(RAZORPAY_LINK + "?" + params.toString(), "_blank");
        /* Optimistically resolve after redirect */
        setTimeout(() => resolve("link-" + Date.now()), 1500);
      }
    });
  };

  /* Handle Pay Now */
  const handlePayNow = async () => {
    setSubmitting(true);
    setPayFailed(false);
    const orderNumber = generateOrderNumber();

    try {
      /* 1. Save pending order */
      const firestoreId = await savePendingOrder(orderNumber);
      setOrderId(orderNumber);

      /* 2. Open Razorpay */
      const payId = await openRazorpay(firestoreId, orderNumber);
      setPaymentId(payId);

      /* 3. Payment SUCCESS — update Firestore */
      await confirmPayment(firestoreId, payId, orderNumber);

      /* 4. Store for invoice preview, clear cart, show success */
      setFinalItems([...cartItems]);
      setFinalPricing({ subtotal, deliveryCharge, grandTotal });
      clearCart();
      setSubmitted(true);
    } catch (err) {
      if (err.message !== "dismissed") {
        setPayFailed(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* WhatsApp fallback order */
  const handleWhatsAppOrder = useCallback(() => {
    const orderNumber = generateOrderNumber();
    const lines = [
      "🏗️ *New Order — BuildMart*",
      "",
      "👤 *Customer Details:*",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : null,
      "",
      "📍 *Delivery Address:*",
      form.address,
      form.area ? `Area: ${form.area}` : null,
      `Delivery Type: ${form.deliveryType}`,
      form.deliveryDate ? `Preferred Date: ${form.deliveryDate}` : null,
      "",
      "🛒 *Order Items:*",
      ...cartItems.map(
        (item, i) =>
          `${i + 1}. ${item.name} ×${item.quantity} ${item.unit} = ₹${(item.basePrice * item.quantity).toLocaleString()}`,
      ),
      "",
      "💰 *Pricing:*",
      `Subtotal: ₹${subtotal.toLocaleString()}`,
      deliveryCharge
        ? `Delivery: ₹${deliveryCharge.toLocaleString()}`
        : "Delivery: TBD",
      `*Grand Total: ₹${grandTotal.toLocaleString()}*`,
      form.notes ? `\n📝 Notes: ${form.notes}` : null,
      "",
      `Order Ref: ${orderNumber}`,
      "Please confirm and arrange delivery. Thank you!",
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.open(
      "https://wa.me/" +
        CONTACT_CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(lines),
      "_blank",
    );
    clearCart();
    setOrderId(orderNumber);
    setSubmitted(true);
  }, [form, cartItems, subtotal, deliveryCharge, grandTotal, clearCart]);

  /* ── SUCCESS SCREEN ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          <div className="bg-white border-3 border-neutral-900 p-10 text-center construction-shadow">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-3 border-neutral-900">
              <svg
                className="w-10 h-10 text-white"
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
            <h1 className="text-3xl font-black text-neutral-900 uppercase mb-2">
              Order Placed!
            </h1>
            <p className="text-neutral-600 mb-4">
              {paymentId
                ? "Payment confirmed! Your order is being processed. Invoice will be sent to your email shortly."
                : "Your order has been sent via WhatsApp. Our team will call you to confirm within 2 hours."}
            </p>
            <div className="bg-neutral-100 border-2 border-neutral-300 rounded-lg px-4 py-3 mb-2 inline-block">
              <p className="text-xs font-bold text-neutral-500 uppercase">
                Order Number
              </p>
              <p className="font-black text-neutral-900 font-mono">{orderId}</p>
            </div>
            {paymentId && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg px-4 py-3 mb-6 inline-block ml-2">
                <p className="text-xs font-bold text-green-600 uppercase">
                  Payment ID
                </p>
                <p className="font-black text-green-800 font-mono text-sm">
                  {paymentId.slice(0, 16)}
                </p>
              </div>
            )}
            <div className="space-y-3 mt-6">
              {paymentId && (
                <button
                  onClick={() => setShowInvoice(true)}
                  className="flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-black py-3 px-6 border-3 border-neutral-900 uppercase tracking-wider transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View &amp; Print Invoice
                </button>
              )}
              <Link
                to="/products"
                className="block w-full bg-construction-yellow text-neutral-900 font-bold py-3 px-6 border-3 border-neutral-900 uppercase tracking-wider hover:bg-construction-orange transition-all text-center"
              >
                Continue Shopping
              </Link>
              <a
                href={"https://wa.me/" + CONTACT_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 px-6 border-3 border-neutral-900 uppercase tracking-wider hover:bg-[#20BA5A] transition-all"
              >
                <WAIcon /> Chat with Us
              </a>
            </div>
            {showInvoice && (
              <InvoicePreview
                orderId={orderId}
                paymentId={paymentId}
                customer={form}
                items={finalItems}
                pricing={finalPricing}
                onClose={() => setShowInvoice(false)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN RENDER ── */
  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      {/* Load Razorpay SDK */}
      {typeof window !== "undefined" && !window.Razorpay && (
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-4 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-4xl font-black text-neutral-900 uppercase tracking-wider">
            Checkout
          </h1>
        </div>

        <StepBar current={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {/* ══ STEP 0: CUSTOMER DETAILS ══ */}
            {step === 0 && (
              <div className="bg-white border-3 border-neutral-900 p-6 md:p-8 construction-shadow">
                <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900 mb-6 flex items-center gap-2">
                  <span className="bg-construction-yellow w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-neutral-900">
                    1
                  </span>
                  Your Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name" required error={errors.name}>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Rajesh Kumar"
                      className={inputCls(errors.name)}
                    />
                  </Field>

                  <Field label="Phone Number" required error={errors.phone}>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border-2 border-r-0 border-neutral-300 bg-neutral-100 text-neutral-600 font-bold rounded-l-lg text-sm">
                        +91
                      </span>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="98765 43210"
                        maxLength={10}
                        inputMode="numeric"
                        className={inputCls(errors.phone) + " rounded-l-none"}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">
                        {errors.phone}
                      </p>
                    )}
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Email Address" required error={errors.email}>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="rajesh@example.com"
                        className={inputCls(errors.email)}
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Full Delivery Address"
                      required
                      error={errors.address}
                    >
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Flat/House No, Building Name, Street, Area, Landmark"
                        rows={3}
                        className={inputCls(errors.address) + " resize-none"}
                      />
                    </Field>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">
                      Area / Locality
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <select
                          name="area"
                          value={form.area}
                          onChange={(e) => {
                            handleChange(e);
                            const found = AREAS_DATA.find(
                              (a) => a.name === e.target.value,
                            );
                            if (found?.pincode)
                              setForm((p) => ({
                                ...p,
                                pincode: found.pincode,
                              }));
                          }}
                          className={inputCls(errors.area)}
                        >
                          <option value="">Select area...</option>
                          {AREAS_DATA.map((a) => (
                            <option key={a.name} value={a.name}>
                              {a.name}
                              {a.pincode ? " — " + a.pincode : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          name="pincode"
                          value={form.pincode || ""}
                          onChange={(e) => {
                            const pin = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setForm((p) => ({ ...p, pincode: pin }));
                            if (pin.length === 6 && PINCODE_MAP[pin]) {
                              setForm((p) => ({
                                ...p,
                                pincode: pin,
                                area: PINCODE_MAP[pin],
                              }));
                            }
                          }}
                          placeholder="Pincode"
                          maxLength={6}
                          inputMode="numeric"
                          className={
                            inputCls(false) + " text-center tracking-widest"
                          }
                          title="Enter 6-digit pincode to auto-detect area"
                        />
                      </div>
                    </div>
                    {form.pincode &&
                      form.pincode.length === 6 &&
                      !PINCODE_MAP[form.pincode] && (
                        <p className="text-amber-600 text-xs mt-1 font-semibold">
                          ⚠ Pincode not in our delivery zones — please select
                          area manually
                        </p>
                      )}
                    {form.pincode &&
                      form.pincode.length === 6 &&
                      PINCODE_MAP[form.pincode] && (
                        <p className="text-green-600 text-xs mt-1 font-semibold">
                          ✓ Area detected: {PINCODE_MAP[form.pincode]}
                        </p>
                      )}
                    {errors.area && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">
                        {errors.area}
                      </p>
                    )}
                  </div>

                  <Field label="Delivery Type" required>
                    <div className="flex gap-3">
                      {["Site Delivery", "Self Pickup"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, deliveryType: t }))
                          }
                          className={
                            "flex-1 py-3 px-3 border-2 rounded-lg text-sm font-bold transition-all " +
                            (form.deliveryType === t
                              ? "border-construction-yellow bg-yellow-50 text-neutral-900"
                              : "border-neutral-300 text-neutral-600 bg-white hover:border-neutral-400")
                          }
                        >
                          {t === "Site Delivery" ? "🚚 " : "🏢 "}
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Preferred Delivery Date (optional)">
                    <input
                      name="deliveryDate"
                      type="date"
                      value={form.deliveryDate}
                      onChange={handleChange}
                      min={
                        new Date(Date.now() + 86400000)
                          .toISOString()
                          .split("T")[0]
                      }
                      className={inputCls(false)}
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Order Notes (optional)">
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Delivery time preference, site access, material placement instructions..."
                        rows={2}
                        className={inputCls(false) + " resize-none"}
                      />
                    </Field>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (validate()) setStep(1);
                  }}
                  className="mt-8 w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-black py-4 border-3 border-neutral-900 uppercase tracking-widest transition-all construction-shadow"
                >
                  Review Order →
                </button>
              </div>
            )}

            {/* ══ STEP 1: REVIEW ══ */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <span className="text-xl">📍</span> Delivering To
                    </h2>
                    <button
                      onClick={() => setStep(0)}
                      className="text-sm font-bold text-construction-yellow hover:text-construction-orange underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm text-neutral-700">
                    <p className="font-bold text-neutral-900 text-base">
                      {form.name}
                    </p>
                    <p>
                      {form.phone} · {form.email}
                    </p>
                    <p>{form.address}</p>
                    <p className="font-semibold">
                      {form.area} · {form.deliveryType}
                    </p>
                    {form.deliveryDate && (
                      <p>
                        📅 Preferred:{" "}
                        {new Date(form.deliveryDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </p>
                    )}
                    {form.notes && (
                      <p className="mt-2 bg-yellow-50 border-l-4 border-construction-yellow p-2 text-xs">
                        {form.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
                  <h2 className="text-lg font-black uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">🛒</span> Items (
                    {cartItems.length})
                  </h2>
                  <div className="divide-y-2 divide-neutral-100">
                    {cartItems.map((item) => {
                      const img =
                        item.images?.[0]?.url || item.imageUrl || item.image;
                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="w-14 h-14 flex-shrink-0 bg-neutral-100 border-2 border-neutral-200 rounded-lg overflow-hidden">
                            {img ? (
                              <img
                                src={img}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                📦
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-neutral-900 text-sm">
                              {item.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              ₹{item.basePrice.toLocaleString()} ×{" "}
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                          <div className="text-right font-black text-neutral-900">
                            ₹{(item.basePrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 py-3 border-3 border-neutral-300 text-neutral-600 font-bold uppercase text-sm hover:border-neutral-500 transition-all"
                  >
                    ← Edit Details
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-black py-3 border-3 border-neutral-900 uppercase tracking-wide transition-all construction-shadow"
                  >
                    Choose Payment →
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 2: PAYMENT ══ */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-white border-3 border-neutral-900 p-6 md:p-8 construction-shadow">
                  <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900 mb-2 flex items-center gap-2">
                    <span className="bg-construction-yellow w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-neutral-900">
                      3
                    </span>
                    Payment
                  </h2>
                  <p className="text-neutral-500 text-sm mb-6">
                    Pay securely online. Invoice will be emailed after payment.
                  </p>

                  {/* Payment summary box */}
                  <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-5 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-neutral-900">
                        Order Total
                      </span>
                      <span className="text-2xl font-black text-construction-yellow">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm text-neutral-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      {deliveryCharge > 0 && (
                        <div className="flex justify-between">
                          <span>Delivery</span>
                          <span>₹{deliveryCharge.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-neutral-500">
                      <span className="flex items-center gap-1">
                        🔒 Razorpay Secured
                      </span>
                      <span className="flex items-center gap-1">
                        📋 Invoice Included
                      </span>
                      <span className="flex items-center gap-1">
                        🔄 Refund if Undeliverable
                      </span>
                    </div>
                  </div>

                  {payFailed && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4 text-center">
                      <p className="text-red-700 font-bold text-sm">
                        ❌ Payment failed or was cancelled.
                      </p>
                      <p className="text-red-600 text-xs mt-1">
                        Please try again or use WhatsApp below.
                      </p>
                    </div>
                  )}

                  {/* Pay Now */}
                  <button
                    onClick={handlePayNow}
                    disabled={submitting}
                    className={
                      "w-full font-black py-5 border-3 border-neutral-900 uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3 " +
                      (submitting
                        ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                        : "bg-construction-yellow hover:bg-construction-orange text-neutral-900 construction-shadow")
                    }
                  >
                    {submitting ? (
                      <>
                        <SpinIcon /> Processing...
                      </>
                    ) : (
                      <>💳 Pay ₹{grandTotal.toLocaleString("en-IN")} Now</>
                    )}
                  </button>

                  <div className="mt-4 relative flex items-center">
                    <div className="flex-1 border-t border-neutral-200" />
                    <span className="px-3 text-xs text-neutral-400 font-semibold">
                      or
                    </span>
                    <div className="flex-1 border-t border-neutral-200" />
                  </div>

                  {/* WhatsApp fallback */}
                  <button
                    onClick={handleWhatsAppOrder}
                    disabled={submitting}
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3.5 border-3 border-neutral-900 uppercase tracking-wider transition-all construction-shadow disabled:opacity-50"
                  >
                    <WAIcon /> Order via WhatsApp Instead
                  </button>

                  <p className="text-xs text-neutral-400 text-center mt-3">
                    WhatsApp orders: our team calls to confirm payment &amp;
                    delivery
                  </p>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="w-full text-sm font-bold text-neutral-500 hover:text-neutral-900 py-2 transition-colors"
                >
                  ← Back to Review
                </button>
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border-3 border-neutral-900 p-5 construction-shadow">
              <h3 className="text-base font-black uppercase tracking-wider text-neutral-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs gap-2"
                  >
                    <span className="text-neutral-700 truncate flex-1">
                      {item.name}{" "}
                      <span className="text-neutral-400">×{item.quantity}</span>
                    </span>
                    <span className="font-bold text-neutral-900 flex-shrink-0">
                      ₹{(item.basePrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-neutral-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery</span>
                  <span className="font-semibold">
                    {deliveryCharge > 0
                      ? "₹" + deliveryCharge.toLocaleString()
                      : "TBD"}
                  </span>
                </div>
                <div className="border-t-2 border-construction-yellow pt-2 flex justify-between items-center">
                  <span className="font-black text-neutral-900 uppercase text-sm">
                    Grand Total
                  </span>
                  <span className="text-xl font-black text-construction-yellow">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg text-xs">
                <p className="font-bold text-green-800">
                  🚚 Delivery in 24–48 hrs
                </p>
                <p className="text-green-700 mt-0.5">
                  After order confirmation
                </p>
              </div>
              <a
                href={
                  "https://wa.me/" +
                  CONTACT_CONFIG.whatsapp +
                  "?text=Hi, I need help with my order on BuildMart"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full text-xs font-bold text-green-700 hover:text-green-900 py-2 border-2 border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100 transition-all rounded-lg"
              >
                <WAIcon /> Need help? Chat with us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

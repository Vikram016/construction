import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { openWhatsApp } from '../utils/whatsapp';
import { CONTACT_CONFIG } from '../config/contactConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/* ── Icons ──────────────────────────────────────────────────────────────── */
const WAIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
  </svg>
);

/* ── Step indicator ──────────────────────────────────────────────────────── */
const steps = ['Address', 'Review', 'Payment'];

const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 mb-10">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={
              'w-9 h-9 rounded-full border-3 border-neutral-900 flex items-center justify-center font-black text-sm transition-all ' +
              (done ? 'bg-green-500 text-white' : active ? 'bg-construction-yellow text-neutral-900' : 'bg-white text-neutral-400')
            }>
              {done ? <CheckIcon /> : i + 1}
            </div>
            <span className={'text-xs font-bold mt-1 uppercase tracking-wider ' + (active ? 'text-neutral-900' : 'text-neutral-400')}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={'flex-1 h-1 mx-2 mb-5 ' + (done ? 'bg-green-500' : 'bg-neutral-300')} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── Field component ──────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
  </div>
);

const inputCls = (err) =>
  'w-full px-4 py-3 border-2 rounded-lg font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all ' +
  (err ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-neutral-300 focus:border-construction-yellow bg-white');

/* ── PAYMENT METHOD OPTIONS ──────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  {
    id: 'whatsapp',
    label: 'Order via WhatsApp',
    sublabel: 'Send order details, our team calls to confirm and collect payment',
    icon: '💬',
    badge: 'Most Popular',
    badgeColor: 'bg-green-500 text-white',
  },
  {
    id: 'cod',
    label: 'Cash / UPI on Delivery',
    sublabel: '10% advance now, balance paid on delivery by cash or UPI',
    icon: '💵',
    badge: null,
  },
  {
    id: 'online',
    label: 'Pay Full Amount Online',
    sublabel: 'Pay 100% now via Razorpay — fastest processing',
    icon: '💳',
    badge: 'Instant Confirm',
    badgeColor: 'bg-blue-600 text-white',
  },
];

const RAZORPAY_LINK = 'https://rzp.io/l/buildmart-orders';

/* ════════════════════════════════════════════════════════════════════════════
   CHECKOUT COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, gst, deliveryCharge, grandTotal, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');

  /* ── Address form state ── */
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    landmark: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');

  /* ── Redirect if cart empty ── */
  if (!cartItems.length && !submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-black text-neutral-900 mb-3">Cart is empty</h2>
          <p className="text-neutral-600 mb-6">Add some products before checking out</p>
          <Link to="/products" className="inline-block bg-construction-yellow text-neutral-900 font-bold px-8 py-3 border-3 border-neutral-900 uppercase">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  /* ── Computed totals ── */
  const advance = Math.ceil(grandTotal * 0.1);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.address.trim()) e.address = 'Delivery address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  /* ── Step navigation ── */
  const goToReview = () => {
    if (validate()) setStep(1);
  };

  const goToPayment = () => setStep(2);

  /* ── Build WhatsApp message ── */
  const buildWhatsAppMessage = useCallback(() => {
    const lines = [
      '🏗️ *New Order — BuildMart*',
      '',
      '👤 *Customer Details:*',
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : null,
      '',
      '📍 *Delivery Address:*',
      form.address,
      `${form.city} — ${form.pincode}`,
      form.landmark ? `Landmark: ${form.landmark}` : null,
      '',
      '🛒 *Order Items:*',
      ...cartItems.map((item, i) =>
        `${i + 1}. ${item.name} × ${item.quantity} ${item.unit} = ₹${(item.basePrice * item.quantity).toLocaleString()}`
      ),
      '',
      '💰 *Pricing:*',
      `Subtotal: ₹${subtotal.toLocaleString()}`,
      `GST (18%): ₹${gst.toLocaleString()}`,
      deliveryCharge ? `Delivery: ₹${deliveryCharge.toLocaleString()}` : 'Delivery: To be calculated',
      `*Grand Total: ₹${grandTotal.toLocaleString()}*`,
      '',
      `💳 Payment: ${PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}`,
      form.notes ? `\n📝 Notes: ${form.notes}` : null,
      '',
      'Please confirm my order and delivery slot. Thank you!',
    ].filter(l => l !== null);

    return lines.join('\n');
  }, [form, cartItems, subtotal, gst, deliveryCharge, grandTotal, paymentMethod]);

  /* ── Save order to Firestore ── */
  const saveOrder = async () => {
    try {
      const doc = await addDoc(collection(db, 'orders'), {
        customer: { ...form },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          basePrice: item.basePrice,
          lineTotal: item.basePrice * item.quantity,
        })),
        pricing: { subtotal, gst, deliveryCharge, grandTotal, advance },
        paymentMethod,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return doc.id;
    } catch (err) {
      console.warn('Firestore save failed:', err.message);
      return 'ORD-' + Date.now();
    }
  };

  /* ── Handle final place order ── */
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    const id = await saveOrder();
    setOrderId(id);

    if (paymentMethod === 'whatsapp') {
      openWhatsApp({ customMessage: buildWhatsAppMessage() });
      setSubmitting(false);
      setSubmitted(true);
      clearCart();

    } else if (paymentMethod === 'cod') {
      // Send WhatsApp confirmation + open advance payment
      openWhatsApp({ customMessage: buildWhatsAppMessage() });
      const params = new URLSearchParams({
        amount: advance * 100,
        description: `BuildMart Advance - Order ${id}`,
        name: form.name,
        contact: form.phone,
      });
      window.open(RAZORPAY_LINK + '?' + params.toString(), '_blank');
      setSubmitting(false);
      setSubmitted(true);
      clearCart();

    } else if (paymentMethod === 'online') {
      const params = new URLSearchParams({
        amount: grandTotal * 100,
        description: `BuildMart Full Payment - Order ${id}`,
        name: form.name,
        contact: form.phone,
      });
      window.open(RAZORPAY_LINK + '?' + params.toString(), '_blank');
      setSubmitting(false);
      setSubmitted(true);
      clearCart();
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          <div className="bg-white border-3 border-neutral-900 p-10 text-center construction-shadow">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-3 border-neutral-900">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 className="text-3xl font-black text-neutral-900 uppercase mb-2">Order Placed!</h1>
            <p className="text-neutral-600 mb-6">
              {paymentMethod === 'whatsapp'
                ? 'Your order has been sent via WhatsApp. Our team will call you to confirm within 2 hours.'
                : paymentMethod === 'cod'
                ? 'WhatsApp sent + advance payment window opened. Our team will confirm your slot.'
                : 'Payment window opened. Your order is confirmed once payment succeeds.'}
            </p>
            {orderId && (
              <div className="bg-neutral-100 border-2 border-neutral-300 rounded-lg px-4 py-3 mb-6 inline-block">
                <p className="text-xs font-bold text-neutral-500 uppercase">Order Reference</p>
                <p className="font-black text-neutral-900 text-sm font-mono">{orderId.slice(0, 12).toUpperCase()}</p>
              </div>
            )}
            <div className="space-y-3">
              <Link to="/products" className="block w-full bg-construction-yellow text-neutral-900 font-bold py-3 px-6 border-3 border-neutral-900 uppercase tracking-wider hover:bg-construction-orange transition-all">
                Continue Shopping
              </Link>
              <a
                href={'https://wa.me/' + CONTACT_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 px-6 border-3 border-neutral-900 uppercase tracking-wider hover:bg-[#20BA5A] transition-all"
              >
                <WAIcon /> Chat with us
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     MAIN RENDER
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-4xl font-black text-neutral-900 uppercase tracking-wider">Checkout</h1>
        </div>

        <StepBar current={step} />

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── LEFT: form steps ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ══ STEP 0: ADDRESS ══ */}
            {step === 0 && (
              <div className="bg-white border-3 border-neutral-900 p-6 md:p-8 construction-shadow">
                <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900 mb-6 flex items-center gap-2">
                  <span className="bg-construction-yellow w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-neutral-900">1</span>
                  Delivery Address
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name" required error={errors.name}>
                    <input name="name" value={form.name} onChange={handleChange}
                      placeholder="Rajesh Kumar"
                      className={inputCls(errors.name)} />
                  </Field>

                  <Field label="Mobile Number" required error={errors.phone}>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border-2 border-r-0 border-neutral-300 bg-neutral-100 text-neutral-600 font-bold rounded-l-lg text-sm">+91</span>
                      <input name="phone" value={form.phone} onChange={handleChange}
                        placeholder="98765 43210" maxLength={10} inputMode="numeric"
                        className={inputCls(errors.phone) + ' rounded-l-none'} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone}</p>}
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Email (optional)" error={errors.email}>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="rajesh@example.com"
                        className={inputCls(errors.email)} />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Delivery Address" required error={errors.address}>
                      <textarea name="address" value={form.address} onChange={handleChange}
                        placeholder="Flat/House No, Building Name, Street, Area"
                        rows={3}
                        className={inputCls(errors.address) + ' resize-none'} />
                    </Field>
                  </div>

                  <Field label="City" required error={errors.city}>
                    <input name="city" value={form.city} onChange={handleChange}
                      placeholder="Bangalore"
                      className={inputCls(errors.city)} />
                  </Field>

                  <Field label="Pincode" required error={errors.pincode}>
                    <input name="pincode" value={form.pincode} onChange={handleChange}
                      placeholder="560001" maxLength={6} inputMode="numeric"
                      className={inputCls(errors.pincode)} />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Landmark (optional)">
                      <input name="landmark" value={form.landmark} onChange={handleChange}
                        placeholder="Near Metro Station, opposite Big Bazaar…"
                        className={inputCls(false)} />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Special Instructions (optional)">
                      <textarea name="notes" value={form.notes} onChange={handleChange}
                        placeholder="Delivery time preference, site access instructions, material placement…"
                        rows={2}
                        className={inputCls(false) + ' resize-none'} />
                    </Field>
                  </div>
                </div>

                <button
                  onClick={goToReview}
                  className="mt-8 w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-black py-4 border-3 border-neutral-900 uppercase tracking-widest transition-all hover:translate-x-0.5 hover:translate-y-0.5 construction-shadow"
                >
                  Review Order →
                </button>
              </div>
            )}

            {/* ══ STEP 1: REVIEW ══ */}
            {step === 1 && (
              <div className="space-y-5">

                {/* Address summary */}
                <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <span className="text-xl">📍</span> Delivering To
                    </h2>
                    <button onClick={() => setStep(0)} className="text-sm font-bold text-construction-yellow hover:text-construction-orange underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-neutral-700 space-y-1">
                    <p className="font-bold text-neutral-900">{form.name}</p>
                    <p>{form.phone}</p>
                    <p>{form.address}</p>
                    <p>{form.city} — {form.pincode}</p>
                    {form.landmark && <p className="text-neutral-500">📌 {form.landmark}</p>}
                    {form.notes && <p className="mt-2 text-sm bg-yellow-50 border-l-4 border-construction-yellow p-2">{form.notes}</p>}
                  </div>
                </div>

                {/* Items review */}
                <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
                  <h2 className="text-lg font-black uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">🛒</span> Order Items ({cartItems.length})
                  </h2>
                  <div className="divide-y-2 divide-neutral-100">
                    {cartItems.map(item => {
                      const img = item.images?.[0]?.url || item.imageUrl || item.image;
                      return (
                        <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="w-16 h-16 flex-shrink-0 bg-neutral-100 border-2 border-neutral-200 overflow-hidden">
                            {img
                              ? <img src={img} alt={item.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                            <p className="text-sm text-neutral-500">₹{item.basePrice.toLocaleString()} × {item.quantity} {item.unit}</p>
                          </div>
                          <div className="text-right font-black text-neutral-900">
                            ₹{(item.basePrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={goToPayment}
                  className="w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-black py-4 border-3 border-neutral-900 uppercase tracking-widest transition-all construction-shadow"
                >
                  Choose Payment →
                </button>
              </div>
            )}

            {/* ══ STEP 2: PAYMENT ══ */}
            {step === 2 && (
              <div className="space-y-5">

                <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
                  <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900 mb-6 flex items-center gap-2">
                    <span className="bg-construction-yellow w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-neutral-900">3</span>
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={
                          'w-full text-left p-4 border-3 transition-all ' +
                          (paymentMethod === method.id
                            ? 'border-construction-yellow bg-yellow-50'
                            : 'border-neutral-300 bg-white hover:border-neutral-400')
                        }
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl leading-none">{method.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-neutral-900">{method.label}</span>
                              {method.badge && (
                                <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + method.badgeColor}>
                                  {method.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-600 mt-0.5">{method.sublabel}</p>
                            {method.id === 'cod' && paymentMethod === 'cod' && (
                              <p className="text-sm font-bold text-orange-600 mt-1">
                                Advance due now: ₹{advance.toLocaleString()} (10% of ₹{grandTotal.toLocaleString()})
                              </p>
                            )}
                            {method.id === 'online' && paymentMethod === 'online' && (
                              <p className="text-sm font-bold text-blue-600 mt-1">
                                Full amount: ₹{grandTotal.toLocaleString()} via Razorpay
                              </p>
                            )}
                          </div>
                          <div className={
                            'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ' +
                            (paymentMethod === method.id ? 'border-construction-yellow bg-construction-yellow' : 'border-neutral-400')
                          }>
                            {paymentMethod === method.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"/>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Trust signals */}
                  <div className="mt-6 flex flex-wrap gap-4 text-xs text-neutral-500 font-semibold border-t-2 border-neutral-100 pt-4">
                    <span>🔒 Razorpay Secured</span>
                    <span>📋 GST Invoice Included</span>
                    <span>🔄 Refund if Undeliverable</span>
                  </div>
                </div>

                {/* Place order button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className={
                    'w-full font-black py-5 border-3 border-neutral-900 uppercase tracking-widest text-lg transition-all ' +
                    (paymentMethod === 'whatsapp'
                      ? 'bg-[#25D366] hover:bg-[#20BA5A] text-white'
                      : 'bg-construction-yellow hover:bg-construction-orange text-neutral-900') +
                    (submitting ? ' opacity-60 cursor-not-allowed' : ' construction-shadow')
                  }
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
                      </svg>
                      Placing Order…
                    </span>
                  ) : paymentMethod === 'whatsapp' ? (
                    <span className="flex items-center justify-center gap-2"><WAIcon /> Send Order on WhatsApp</span>
                  ) : paymentMethod === 'cod' ? (
                    '✅ Confirm & Pay ₹' + advance.toLocaleString() + ' Advance'
                  ) : (
                    '💳 Pay ₹' + grandTotal.toLocaleString() + ' Now'
                  )}
                </button>

                <button onClick={() => setStep(1)} className="w-full text-sm font-bold text-neutral-500 hover:text-neutral-900 py-2 transition-colors">
                  ← Back to Review
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT: order summary sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border-3 border-neutral-900 p-6 construction-shadow">
              <h3 className="text-lg font-black uppercase tracking-wider text-neutral-900 mb-5">
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-700 truncate flex-1 mr-2">
                      {item.name} <span className="text-neutral-400">×{item.quantity}</span>
                    </span>
                    <span className="font-bold text-neutral-900 flex-shrink-0">
                      ₹{(item.basePrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t-2 border-neutral-200 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>GST (18%)</span>
                  <span className="font-semibold">₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery</span>
                  <span className="font-semibold">
                    {deliveryCharge > 0 ? '₹' + deliveryCharge.toLocaleString() : 'Calculated at delivery'}
                  </span>
                </div>
                <div className="border-t-2 border-construction-yellow pt-3 flex justify-between items-center">
                  <span className="font-black text-neutral-900 uppercase">Total</span>
                  <span className="text-2xl font-black text-construction-yellow">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Delivery ETA */}
              <div className="mt-5 bg-green-50 border-l-4 border-green-500 p-3 text-sm">
                <p className="font-bold text-green-800">🚚 Delivery in 24–48 hours</p>
                <p className="text-green-700 text-xs mt-0.5">After order confirmation call</p>
              </div>

              {/* Help */}
              <a
                href={'https://wa.me/' + CONTACT_CONFIG.whatsapp + '?text=Hi, I need help with my checkout on BuildMart'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full text-sm font-bold text-green-700 hover:text-green-900 py-2 border-2 border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100 transition-all"
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

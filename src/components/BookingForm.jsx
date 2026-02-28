/**
 * BookingForm.jsx — Reusable booking form for all 3 service pages
 *
 * Props:
 *   serviceType    — 'waste-sand' | 'debris-sand' | 'site-clean'
 *   serviceLabel   — Display name e.g. "Waste Sand Collection"
 *   pricePerTon    — Number (used for live price calc, null for site-clean)
 *   advancePct     — Advance percentage (default 10)
 *   firestoreCol   — Firestore collection name
 *   razorpayUrl    — Razorpay payment link
 *   accentColor    — Tailwind color key: 'orange' | 'emerald' | 'blue'
 *   serviceAreas   — string[]
 */

import { useState, useMemo, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { CONTACT_CONFIG } from '../config/contactConfig';

const WA = CONTACT_CONFIG.whatsapp;
const fmt = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const ACCENT = {
  orange: {
    btn:      'bg-orange-500 hover:bg-orange-600 text-neutral-900 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]',
    advance:  'bg-orange-500',
    pill:     'bg-orange-50 text-orange-800 border-orange-200',
    focus:    'focus:border-orange-400',
    tag:      'bg-orange-100 text-orange-700 border-orange-200',
    liveHi:   'bg-orange-500 border-neutral-900 text-white',
    liveText: 'text-orange-600',
  },
  emerald: {
    btn:      'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800 shadow-[3px_3px_0px_0px_#065f46]',
    advance:  'bg-emerald-500',
    pill:     'bg-emerald-50 text-emerald-800 border-emerald-200',
    focus:    'focus:border-emerald-500',
    tag:      'bg-emerald-100 text-emerald-700 border-emerald-200',
    liveHi:   'bg-emerald-600 border-emerald-700 text-white',
    liveText: 'text-emerald-600',
  },
  blue: {
    btn:      'bg-blue-600 hover:bg-blue-700 text-white border-blue-800 shadow-[3px_3px_0px_0px_#1e3a8a]',
    advance:  'bg-blue-500',
    pill:     'bg-blue-50 text-blue-800 border-blue-200',
    focus:    'focus:border-blue-500',
    tag:      'bg-blue-100 text-blue-700 border-blue-200',
    liveHi:   'bg-blue-600 border-blue-700 text-white',
    liveText: 'text-blue-600',
  },
};

const WAIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const FieldError = ({ msg }) =>
  msg ? <p className="mt-1 text-xs text-red-600 font-medium">{msg}</p> : null;

const INIT = { name: '', phone: '', area: '', quantity: '', preferredDate: '', notes: '' };

const BookingForm = ({
  serviceType,
  serviceLabel,
  pricePerTon   = null,
  advancePct    = 10,
  firestoreCol,
  razorpayUrl   = '',
  accentColor   = 'orange',
  serviceAreas  = [],
  showQuantity  = true,
  quantityLabel = 'Quantity (tons)',
  quantityUnit  = 'tons',
  minQuantity   = 1,
  pricingNote   = '',
  selectedPackage = '',       // passed from parent (e.g. SiteClean package cards)
  extraFields   = {},         // any extra fields to save to Firestore
}) => {
  const c = ACCENT[accentColor] || ACCENT.orange;

  const [form,       setForm]       = useState(INIT);
  const [errors,     setErrors]     = useState({});
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fsErr,      setFsErr]      = useState('');

  const qty     = parseFloat(form.quantity) || 0;
  const total   = pricePerTon ? qty * pricePerTon : 0;
  const advance = pricePerTon ? Math.ceil(total * advancePct / 100) : 0;

  const rzUrl = useMemo(() => {
    if (!razorpayUrl || !advance) return razorpayUrl;
    const p = new URLSearchParams({
      amount:      advance,
      description: `${serviceLabel} Advance — ${qty} ${quantityUnit}`,
      name:        form.name    || 'Customer',
      contact:     form.phone   || '',
    });
    return `${razorpayUrl}?${p}`;
  }, [razorpayUrl, advance, qty, form.name, form.phone, serviceLabel, quantityUnit]);

  const validate = useCallback(() => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required.';
    if (!form.phone.trim()) e.phone = 'Phone is required.';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!form.area.trim())  e.area  = 'Location is required.';
    if (showQuantity) {
      if (!form.quantity)  e.quantity = 'Quantity is required.';
      else if (parseFloat(form.quantity) < minQuantity)
        e.quantity = `Minimum ${minQuantity} ${quantityUnit}.`;
    }
    return e;
  }, [form, showQuantity, minQuantity, quantityUnit]);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setFsErr('');
  };

  const handleWhatsApp = useCallback(() => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const lines = [
      `🏗️ *${serviceLabel} Booking — BuildMart*`, '',
      `👤 *Name:* ${form.name}`,
      `📱 *Phone:* ${form.phone}`,
      `📍 *Location:* ${form.area}`,
      `🔧 *Service:* ${serviceLabel}`,
      selectedPackage ? `📦 *Package:* ${selectedPackage}` : null,
      showQuantity ? `⚖️ *Quantity:* ${qty} ${quantityUnit}` : null,
      pricePerTon  ? `💰 *Rate:* ₹${fmt(pricePerTon)}/${quantityUnit}` : null,
      pricePerTon && qty >= minQuantity ? `🧾 *Total:* ₹${fmt(total)}` : null,
      pricePerTon && qty >= minQuantity ? `💳 *Advance (${advancePct}%):* ₹${fmt(advance)}` : null,
      form.preferredDate ? `📅 *Preferred Date:* ${form.preferredDate}` : null,
      form.notes         ? `📝 *Notes:* ${form.notes}` : null,
      '',
      razorpayUrl ? `💳 Pay advance here: ${razorpayUrl}` : null,
      'Please confirm slot and availability. Thank you!',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener,noreferrer');
  }, [form, validate, serviceLabel, showQuantity, qty, quantityUnit, pricePerTon, total, advance, advancePct, minQuantity, selectedPackage, razorpayUrl]);

  const handlePay = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true); setFsErr('');
    const doc = {
      name:          form.name.trim(),
      phone:         form.phone.trim(),
      area:          form.area.trim(),
      notes:         form.notes.trim(),
      preferredDate: form.preferredDate || '',
      serviceType,
      source:        'website',
      createdAt:     serverTimestamp(),
      status:        'pending_payment',
    };
    if (showQuantity) {
      doc.quantity    = qty;
      doc.totalAmount = total;
      doc.advance     = advance;
    }
    if (pricePerTon) doc.pricePerTon = pricePerTon;
    if (selectedPackage) doc.package = selectedPackage;
    // Merge any extra fields from parent
    Object.assign(doc, extraFields);

    try {
      await addDoc(collection(db, firestoreCol), doc);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setForm(INIT); }, 4000);
      if (rzUrl) window.open(rzUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(`[${serviceType}]`, err);
      setFsErr('Could not save booking. Please use WhatsApp instead.');
      if (rzUrl) window.open(rzUrl, '_blank', 'noopener,noreferrer');
    } finally { setSubmitting(false); }
  };

  const inputCls = (name) =>
    `w-full px-4 py-3 rounded-xl border-2 bg-white font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors ${c.focus} ${errors[name] ? 'border-red-400' : 'border-neutral-200'}`;

  return (
    <div className="space-y-6">
      {/* Live price strip — only shown when pricePerTon is set */}
      {pricePerTon && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '💰', label: `Per ${quantityUnit}`, value: `₹${fmt(pricePerTon)}`, hi: false },
            { icon: '🧾', label: 'Est. Total',          value: qty >= minQuantity ? `₹${fmt(total)}`   : '—', hi: false },
            { icon: '💳', label: `Advance (${advancePct}%)`, value: qty >= minQuantity ? `₹${fmt(advance)}` : '—', hi: true  },
          ].map(({ icon, label, value, hi }) => (
            <div key={label} className={`flex items-center gap-2 p-3 md:p-4 rounded-xl border-2 ${hi ? c.liveHi : 'bg-white border-neutral-200'}`}>
              <span className="text-xl md:text-2xl">{icon}</span>
              <div className="min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wide truncate ${hi ? 'text-white/70' : 'text-neutral-500'}`}>{label}</p>
                <p className={`text-base md:text-xl font-black ${hi ? 'text-white' : 'text-neutral-900'}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toasts */}
      {submitted && (
        <div className="flex items-center gap-3 bg-green-50 border-2 border-green-500 text-green-700 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span className="font-semibold text-sm">✅ Booking saved! {rzUrl ? 'Redirecting to payment…' : 'We will call you shortly.'}</span>
        </div>
      )}
      {fsErr && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">{fsErr}</div>
      )}

      {/* Form card */}
      <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-xl md:text-2xl font-black text-neutral-900">📋 Booking Details</h2>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${c.tag}`}>Invoice Included</span>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={setField}
              placeholder="e.g. Rajesh Kumar" autoComplete="name" className={inputCls('name')}/>
            <FieldError msg={errors.name}/>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500">+91</span>
              <input type="tel" name="phone" value={form.phone} onChange={setField}
                placeholder="98765 43210" maxLength={10} inputMode="numeric" autoComplete="tel"
                className={`${inputCls('phone')} pl-12`}/>
            </div>
            <FieldError msg={errors.phone}/>
          </div>

          {/* Service type — auto-filled, disabled */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">Service Type</label>
            <input type="text" value={serviceLabel} disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 cursor-not-allowed"/>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">Delivery / Pickup Location <span className="text-red-500">*</span></label>
            <input type="text" name="area" value={form.area} onChange={setField}
              placeholder="e.g. Whitefield, Koramangala, Bangalore" list={`areas-${serviceType}`}
              className={inputCls('area')}/>
            {serviceAreas.length > 0 && (
              <datalist id={`areas-${serviceType}`}>
                {serviceAreas.map(a => <option key={a} value={a}/>)}
              </datalist>
            )}
            <FieldError msg={errors.area}/>
            {serviceAreas.length > 0 && (
              <p className="mt-1 text-xs text-neutral-400">Start typing to see serviceable areas</p>
            )}
          </div>

          {/* Quantity — only if showQuantity */}
          {showQuantity && (
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">{quantityLabel} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" name="quantity" value={form.quantity} onChange={setField}
                  placeholder={`e.g. 5`} min={minQuantity} step="0.5" inputMode="decimal"
                  className={`${inputCls('quantity')} pr-16`}/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">{quantityUnit}</span>
              </div>
              <FieldError msg={errors.quantity}/>
              {pricePerTon && qty >= minQuantity && (
                <p className={`mt-1.5 text-xs font-semibold ${c.liveText}`}>
                  ₹{fmt(total)} total · ₹{fmt(advance)} advance ({advancePct}%)
                </p>
              )}
              {pricingNote && <p className="mt-1 text-xs text-neutral-400">{pricingNote}</p>}
            </div>
          )}

          {/* Preferred date */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Preferred Date <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input type="date" name="preferredDate" value={form.preferredDate} onChange={setField}
              min={new Date().toISOString().split('T')[0]}
              className={inputCls('preferredDate')}/>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Site Notes <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea name="notes" value={form.notes} onChange={setField}
              placeholder="Floor, site access, preferred time, type of work…"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 bg-white font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors resize-none"/>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <button onClick={handlePay} disabled={submitting}
            className={`flex items-center justify-center gap-2.5 font-black uppercase tracking-wide py-3.5 px-6 rounded-xl border-2 hover:shadow-[1px_1px_0px_0px] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 ${c.btn}`}>
            {submitting
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            }
            {submitting ? 'Processing…' : (pricePerTon && qty >= minQuantity) ? `Pay ₹${fmt(advance)} Advance` : 'Book Now'}
          </button>

          <button onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white font-black uppercase tracking-wide py-3.5 px-6 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all">
            <WAIcon/> WhatsApp Order
          </button>
        </div>

        <p className="mt-4 text-xs text-neutral-400 text-center leading-relaxed">
          Invoice included · {razorpayUrl ? 'Balance payable on delivery · Advance secures your slot' : 'We will confirm your booking within 2 hours'}
        </p>
      </div>
    </div>
  );
};

export default BookingForm;

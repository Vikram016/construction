/**
 * WasteSandBooking.jsx — /services/waste-sand
 *
 * Waste sand we COLLECT from customer sites in Bangalore.
 * SEO pulls from PAGE_SEO.wasteSand in seoConfig.js (centralized).
 * LocalBusiness schema injected by ServiceLayout via PageSEO.
 * No in-app back button — browser / swipe-right / Alt+← only.
 */

import { useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import BookingForm   from '../components/BookingForm';
import { GEO, SITE, PAGE_SEO } from '../config/seoConfig';
import { CONTACT_CONFIG }       from '../config/contactConfig';

/* ── Pricing ──────────────────────────────────────────────────────────── */
const PRICE_PER_TON   = 1200;
const ADVANCE_PERCENT = 10;
const RAZORPAY_URL    = 'https://rzp.io/l/buildmart-waste-sand';

/* ── Service areas — use centralized GEO list ─────────────────────────── */
const SERVICE_AREAS = GEO.areaServed.map(a => (typeof a === 'string' ? a : a.name));

/* ── Service-specific JSON-LD schema ─────────────────────────────────── */
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'Service',
  '@id':      `${SITE.url}/services/waste-sand#service`,
  name:       'Waste Sand Collection Service',
  description:`We collect surplus waste sand from your construction site in ${GEO.city} at ₹${PRICE_PER_TON}/ton. 24-hr pickup. GST invoice.`,
  provider: {
    '@type': 'LocalBusiness',
    '@id':   `${SITE.url}/#business`,
    name:    'BuildMart',
    telephone: CONTACT_CONFIG.phone,
    address: {
      '@type':         'PostalAddress',
      addressLocality: GEO.city,
      addressRegion:   GEO.state,
      addressCountry:  GEO.countryCode,
    },
    geo: { '@type': 'GeoCoordinates', latitude: GEO.lat, longitude: GEO.lng },
    sameAs: [`https://wa.me/${CONTACT_CONFIG.whatsapp}`],
  },
  areaServed: GEO.areaServed.slice(0, 12).map(name => ({ '@type': 'City', name: typeof name === 'string' ? name : name.name })),
  offers: {
    '@type':         'Offer',
    priceCurrency:   'INR',
    price:           PRICE_PER_TON,
    unitText:        'TON',
    availability:    'https://schema.org/InStock',
    priceValidUntil: '2026-12-31',
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: [
    { '@type':'Question', name:`What is waste sand collection?`,
      acceptedAnswer:{ '@type':'Answer', text:`We visit your construction site in ${GEO.city} and collect surplus sand left over from concrete and masonry work. You get a clean site; we recycle the material.` } },
    { '@type':'Question', name:`How much do you pay for waste sand?`,
      acceptedAnswer:{ '@type':'Answer', text:`We pay ₹${PRICE_PER_TON}/ton for waste sand collected from your site, subject to quality check. Payment within 24 hours of pickup.` } },
    { '@type':'Question', name:`What is the minimum quantity for collection?`,
      acceptedAnswer:{ '@type':'Answer', text:`Minimum 1 ton. For sites above 50 tons, call us directly for a priority slot.` } },
    { '@type':'Question', name:`How quickly do you arrive after booking?`,
      acceptedAnswer:{ '@type':'Answer', text:`Within ${GEO.city}: 24 hours. Outer areas: 24–48 hours. We call 2 hours before arrival.` } },
    { '@type':'Question', name:`Do you provide a GST invoice?`,
      acceptedAnswer:{ '@type':'Answer', text:`Yes — a full GST invoice is sent on WhatsApp within 24 hours of collection.` } },
    { '@type':'Question', name:`Is the advance refundable?`,
      acceptedAnswer:{ '@type':'Answer', text:`Yes. If we cannot service your booking within the agreed window, the advance is fully refunded within 3–5 business days.` } },
  ],
};

/* ── Layout config ────────────────────────────────────────────────────── */
const LAYOUT_CONFIG = {
  seoKey:       'wasteSand',
  razorpayUrl:  RAZORPAY_URL,
  accentColor:  'orange',
  extraSchemas: [SERVICE_SCHEMA, FAQ_SCHEMA],

  heroBg:          'bg-neutral-900',
  heroAccentColor: 'text-orange-400',
  heroEmoji:       '🏗️',
  heroBadge:       `Waste Pickup · ${GEO.city}`,
  heroTitle:       'Waste Sand',
  heroAccent:      'Collection',
  heroDesc:        `We collect surplus waste sand from your construction site — fast, eco-responsible, and GST invoiced. You build; we clean up.`,
  stats: [[`₹${PRICE_PER_TON.toLocaleString('en-IN')}`, 'Per Ton'], ['10%', 'Advance'], ['24hr', 'Pickup']],

  crossLinks: [
    { to: '/services/debris-sand', label: '♻️ Debris Sand Delivery' },
    { to: '/services/site-clean',  label: '🧹 Site Cleaning' },
  ],

  sidebarTitle: 'Why builders choose us',
  benefits: [
    ['✅', 'GST invoice on every collection'],
    ['🚛', '10-ton tipper trucks — fast loading'],
    ['📱', 'WhatsApp confirmation in minutes'],
    ['💰', `We pay you ₹${PRICE_PER_TON}/ton`],
    ['♻️', 'Eco-responsible recycling'],
    ['🔒', 'Advance secured via Razorpay'],
  ],

  serviceAreas: SERVICE_AREAS,
  waMessage: `Hi! I need Waste Sand Collection from my site in ${GEO.city}. Please share pricing and availability.`,
};

const FAQS = [
  { q: 'What is waste sand collection?',
    a: `We visit your site in ${GEO.city} and collect surplus sand left over from concrete and masonry work. You get a clean site; we recycle responsibly.` },
  { q: `How much do you pay for waste sand?`,
    a: `We pay ₹${PRICE_PER_TON}/ton, subject to quality check. Payment within 24 hours of pickup.` },
  { q: 'What is the minimum quantity?',
    a: 'Minimum 1 ton. For large sites (50+ tons) call us for a priority slot.' },
  { q: 'How quickly do you arrive after booking?',
    a: `Within ${GEO.city}: 24 hours. We call 2 hours before arrival.` },
  { q: 'Do I need to be on-site during pickup?',
    a: 'Yes — someone must be available to confirm quantity and provide site access. Pickup takes 1–3 hours.' },
  { q: 'Do you provide a GST invoice?',
    a: 'Yes. Full GST invoice sent on WhatsApp within 24 hours of collection.' },
  { q: 'Is the advance refundable?',
    a: 'Yes — fully refunded within 3–5 business days if we cannot fulfil the booking.' },
];

/* ── Page ─────────────────────────────────────────────────────────────── */
const WasteSandBooking = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <ServiceLayout config={LAYOUT_CONFIG}>

      <BookingForm
        serviceType="waste-sand"
        serviceLabel="Waste Sand Collection"
        pricePerTon={PRICE_PER_TON}
        advancePct={ADVANCE_PERCENT}
        firestoreCol="waste_sand_bookings"
        razorpayUrl={RAZORPAY_URL}
        accentColor="orange"
        serviceAreas={SERVICE_AREAS}
        showQuantity
        quantityLabel="Estimated Quantity (tons)"
        quantityUnit="tons"
        minQuantity={1}
        pricingNote="Exact weight confirmed on-site. Payment adjusted accordingly."
      />

      {/* FAQ */}
      <div className="mt-10">
        <h2 className="text-2xl font-black text-neutral-900 mb-1">Frequently Asked Questions</h2>
        <p className="text-sm text-neutral-500 mb-6">About waste sand collection in {GEO.city}.</p>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="bg-white border-2 border-neutral-200 rounded-xl overflow-hidden">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                aria-expanded={faqOpen === i} aria-controls={`faq-ws-${i}`}>
                <span className="font-bold text-neutral-900 text-sm leading-snug">{q}</span>
                <svg className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {faqOpen === i && (
                <div id={`faq-ws-${i}`} className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Area pills */}
      <div className="mt-10 bg-white border-2 border-neutral-200 rounded-2xl p-6">
        <h2 className="text-xl font-black text-neutral-900 mb-2">📍 Collection Areas — {GEO.city}</h2>
        <p className="text-sm text-neutral-500 mb-4">We collect waste sand across {GEO.city} and surrounding areas:</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_AREAS.map(city => (
            <span key={city} className="text-sm bg-orange-50 text-orange-800 font-semibold px-3 py-1.5 rounded-full border border-orange-200">
              📍 {city}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-400">Don't see your area? WhatsApp us.</p>
      </div>

    </ServiceLayout>
  );
};

export default WasteSandBooking;

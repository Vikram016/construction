/**
 * DebrisSandBooking.jsx — /services/debris-sand
 *
 * Debris sand we DELIVER to customer sites in Bangalore.
 * SEO from PAGE_SEO.debrisSand (centralized seoConfig.js).
 * No in-app back button — browser / swipe / Alt+← only.
 */

import { useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import BookingForm   from '../components/BookingForm';
import { GEO, SITE, PAGE_SEO } from '../config/seoConfig';
import { CONTACT_CONFIG }       from '../config/contactConfig';

const PRICE_PER_TON   = 900;
const ADVANCE_PERCENT = 10;
const RAZORPAY_URL    = 'https://rzp.io/l/buildmart-debris-sand';
const SERVICE_AREAS   = GEO.areaServed.map(a => (typeof a === 'string' ? a : a.name));

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'Service',
  '@id':      `${SITE.url}/services/debris-sand#service`,
  name:       'Debris Sand Bulk Delivery',
  description:`Order recycled debris sand at ₹${PRICE_PER_TON}/ton delivered to your construction site in ${GEO.city}. 10% advance, balance on delivery.`,
  provider: {
    '@type': 'LocalBusiness', '@id': `${SITE.url}/#business`, name: 'BuildMart',
    telephone: CONTACT_CONFIG.phone,
    address: { '@type':'PostalAddress', addressLocality:GEO.city, addressRegion:GEO.state, addressCountry:GEO.countryCode },
    geo: { '@type':'GeoCoordinates', latitude:GEO.lat, longitude:GEO.lng },
    sameAs: [`https://wa.me/${CONTACT_CONFIG.whatsapp}`],
  },
  areaServed: GEO.areaServed.slice(0, 12).map(name => ({ '@type':'City', name: typeof name==='string'?name:name.name })),
  offers: {
    '@type':'Offer', priceCurrency:'INR', price:PRICE_PER_TON, unitText:'TON',
    availability:'https://schema.org/InStock', priceValidUntil:'2026-12-31',
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: [
    { '@type':'Question', name:'What is debris sand?',
      acceptedAnswer:{ '@type':'Answer', text:`Debris sand is fine material recovered from demolition waste. Cleaned, sieved, and tested. Suitable for filling, sub-base, and backfill in ${GEO.city} construction sites.` } },
    { '@type':'Question', name:`What is the minimum order quantity?`,
      acceptedAnswer:{ '@type':'Answer', text:`Minimum 2 tons. Delivered in 10-ton tippers. Bulk discounts above 20 tons.` } },
    { '@type':'Question', name:`Is debris sand cheaper than waste sand?`,
      acceptedAnswer:{ '@type':'Answer', text:`Yes — debris sand is ₹${PRICE_PER_TON}/ton vs waste sand at ₹1,200/ton. Both are recycled; debris sand comes from demolition while waste sand comes from active construction.` } },
    { '@type':'Question', name:`Do you provide a GST invoice?`,
      acceptedAnswer:{ '@type':'Answer', text:`Yes. GST invoice shared on WhatsApp within 24 hours of delivery.` } },
    { '@type':'Question', name:`How fast do you deliver?`,
      acceptedAnswer:{ '@type':'Answer', text:`Within ${GEO.city}: 24 hours of advance confirmation. Outer areas: 24–48 hours.` } },
    { '@type':'Question', name:`Is the advance refundable?`,
      acceptedAnswer:{ '@type':'Answer', text:`Yes — fully refunded within 3–5 business days if delivery cannot be made.` } },
  ],
};

const LAYOUT_CONFIG = {
  seoKey:       'debrisSand',
  razorpayUrl:  RAZORPAY_URL,
  accentColor:  'emerald',
  extraSchemas: [SERVICE_SCHEMA, FAQ_SCHEMA],

  heroBg:          'bg-emerald-950',
  heroAccentColor: 'text-emerald-400',
  heroEmoji:       '♻️',
  heroBadge:       `Recycled Sand · ${GEO.city}`,
  heroTitle:       'Debris',
  heroAccent:      'Sand',
  heroDesc:        `Recycled demolition sand — cleaned, sieved and ready to use. Perfect for filling, levelling and sub-base work. ${GEO.city}'s most competitive price.`,
  stats: [[`₹${PRICE_PER_TON}`, 'Per Ton'], ['10%', 'Advance Only'], ['24hr', 'Delivery']],

  crossLinks: [
    { to: '/services/waste-sand', label: '🏗️ Waste Sand Collection' },
    { to: '/services/site-clean', label: '🧹 Site Cleaning' },
  ],

  sidebarTitle: 'Why builders choose us',
  benefits: [
    ['✅', 'GST invoice on every order'],
    ['🚛', '10-ton tipper truck delivery'],
    ['📱', 'WhatsApp confirmation in minutes'],
    ['💰', `Cheapest recycled sand in ${GEO.city}`],
    ['♻️', 'Eco-certified reclaimed material'],
    ['🔒', 'Advance secured via Razorpay'],
  ],

  serviceAreas: SERVICE_AREAS,
  waMessage: `Hi! I need Debris Sand delivery in ${GEO.city}. Please share pricing and availability.`,
};

const FAQS = [
  { q:'What is debris sand?',
    a:`Debris sand is fine material from demolition waste — cleaned and sieved. Suitable for filling, sub-base, and backfill. Great for ${GEO.city} construction sites at low cost.` },
  { q:'Minimum order quantity?',
    a:'Minimum 2 tons. We deliver in 10-ton tippers. Bulk discounts available above 20 tons.' },
  { q:`Is debris sand cheaper than waste sand?`,
    a:`Yes — ₹${PRICE_PER_TON}/ton vs waste sand at ₹1,200/ton.` },
  { q:'Do you provide a GST invoice?',
    a:'Yes — full GST invoice sent on WhatsApp within 24 hours of delivery.' },
  { q:`How fast do you deliver?`,
    a:`Within ${GEO.city}: 24 hours of advance confirmation. We call before arrival.` },
  { q:'Is the advance refundable?',
    a:'Yes — fully refunded within 3–5 business days if we cannot deliver.' },
];

const DebrisSandBooking = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <ServiceLayout config={LAYOUT_CONFIG}>

      <BookingForm
        serviceType="debris-sand"
        serviceLabel="Debris Sand Delivery"
        pricePerTon={PRICE_PER_TON}
        advancePct={ADVANCE_PERCENT}
        firestoreCol="debris_sand_bookings"
        razorpayUrl={RAZORPAY_URL}
        accentColor="emerald"
        serviceAreas={SERVICE_AREAS}
        showQuantity
        quantityLabel="Quantity (tons)"
        quantityUnit="tons"
        minQuantity={2}
        pricingNote="Minimum 2 tons. Delivered in 10-ton tippers."
      />

      <div className="mt-10">
        <h2 className="text-2xl font-black text-neutral-900 mb-1">Frequently Asked Questions</h2>
        <p className="text-sm text-neutral-500 mb-6">About debris sand delivery in {GEO.city}.</p>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="bg-white border-2 border-neutral-200 rounded-xl overflow-hidden">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                aria-expanded={faqOpen === i} aria-controls={`faq-ds-${i}`}>
                <span className="font-bold text-neutral-900 text-sm leading-snug">{q}</span>
                <svg className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {faqOpen === i && (
                <div id={`faq-ds-${i}`} className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 bg-white border-2 border-neutral-200 rounded-2xl p-6">
        <h2 className="text-xl font-black text-neutral-900 mb-2">📍 Delivery Areas — {GEO.city}</h2>
        <p className="text-sm text-neutral-500 mb-4">We deliver debris sand across {GEO.city} and surrounding areas:</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_AREAS.map(city => (
            <span key={city} className="text-sm bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
              📍 {city}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-400">Don't see your area? WhatsApp us.</p>
      </div>

    </ServiceLayout>
  );
};

export default DebrisSandBooking;

/**
 * SiteClean.jsx — /services/site-clean
 *
 * Full construction site cleanup in Bangalore.
 * SEO from PAGE_SEO.siteClean (centralized seoConfig.js).
 * No in-app back button — browser / swipe / Alt+← only.
 */

import { useState } from 'react';
import ServiceLayout from '../components/ServiceLayout';
import BookingForm   from '../components/BookingForm';
import { GEO, SITE, PAGE_SEO } from '../config/seoConfig';
import { CONTACT_CONFIG }       from '../config/contactConfig';

const SERVICE_AREAS  = GEO.areaServed.map(a => (typeof a === 'string' ? a : a.name));
const RAZORPAY_URL   = 'https://rzp.io/l/buildmart-site-clean';

const PACKAGES = [
  { name:'Basic Clean',    price:'₹2,999',  desc:`Debris sweep + waste sand removal. Up to 500 sq ft. ${GEO.city}.`,    icon:'🧹' },
  { name:'Standard Clean', price:'₹6,999',  desc:'Full debris removal + dust wash + waste sand pickup. Up to 1,500 sq ft.', icon:'✨' },
  { name:'Site Reset',     price:'₹14,999', desc:'Complete site clearance, levelling, waste removal. Up to 5,000 sq ft.',   icon:'🏗️' },
  { name:'Custom Project', price:'Call us',  desc:'Large sites, commercial projects, ongoing contracts.',                     icon:'📞' },
];

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'Service',
  '@id':      `${SITE.url}/services/site-clean#service`,
  name:       'Construction Site Cleaning Service',
  description:`Professional construction site cleanup in ${GEO.city}. Debris removal, waste sand collection, full site reset. From ₹2,999.`,
  provider: {
    '@type':'LocalBusiness', '@id':`${SITE.url}/#business`, name:'BuildMart',
    telephone: CONTACT_CONFIG.phone,
    address:{ '@type':'PostalAddress', addressLocality:GEO.city, addressRegion:GEO.state, addressCountry:GEO.countryCode },
    geo:{ '@type':'GeoCoordinates', latitude:GEO.lat, longitude:GEO.lng },
    sameAs:[`https://wa.me/${CONTACT_CONFIG.whatsapp}`],
  },
  areaServed: GEO.areaServed.slice(0,12).map(name => ({ '@type':'City', name: typeof name==='string'?name:name.name })),
  offers: [
    { '@type':'Offer', name:'Basic Clean',    priceCurrency:'INR', price:2999  },
    { '@type':'Offer', name:'Standard Clean', priceCurrency:'INR', price:6999  },
    { '@type':'Offer', name:'Site Reset',     priceCurrency:'INR', price:14999 },
  ],
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: [
    { '@type':'Question', name:'What does the site clean service include?',
      acceptedAnswer:{ '@type':'Answer', text:`Our team removes debris, excess sand, concrete chunks, tile offcuts, packaging waste, and dust. The site is broom-clean and ready for the next phase.` } },
    { '@type':'Question', name:'How is pricing calculated?',
      acceptedAnswer:{ '@type':'Answer', text:`Base pricing is by site area (sq ft) and waste volume. Fixed packages for standard sizes. Large sites get a free assessment.` } },
    { '@type':'Question', name:'Do you take away all the waste?',
      acceptedAnswer:{ '@type':'Answer', text:`Yes — all material is transported to our recycling facility. Disposal certificate provided on request.` } },
    { '@type':'Question', name:'Do you work on active construction sites?',
      acceptedAnswer:{ '@type':'Answer', text:`Yes — we coordinate with your supervisor and work in sections. Weekend and after-hours slots available.` } },
    { '@type':'Question', name:'Do you provide a GST invoice?',
      acceptedAnswer:{ '@type':'Answer', text:`Yes. GST invoice shared on WhatsApp within 24 hours of service completion.` } },
    { '@type':'Question', name:`Can I combine site clean with debris sand delivery?`,
      acceptedAnswer:{ '@type':'Answer', text:`Yes — we collect waste then deliver fresh debris sand in the same visit. WhatsApp us to bundle.` } },
  ],
};

const LAYOUT_CONFIG = {
  seoKey:       'siteClean',
  razorpayUrl:  RAZORPAY_URL,
  accentColor:  'blue',
  extraSchemas: [SERVICE_SCHEMA, FAQ_SCHEMA],

  heroBg:          'bg-slate-900',
  heroAccentColor: 'text-blue-400',
  heroEmoji:       '🧹',
  heroBadge:       `Site Cleanup · ${GEO.city}`,
  heroTitle:       'Site',
  heroAccent:      'Clean',
  heroDesc:        `End-to-end construction site cleanup — debris removal, waste sand collection, dust wash, and full site reset. Your site in ${GEO.city}, spotless and ready for the next phase.`,
  stats: [['3–4', 'Workers'], ['Same Day', 'Available'], ['GST', 'Invoice']],

  crossLinks: [
    { to: '/services/waste-sand',  label: '🏗️ Sell your waste sand' },
    { to: '/services/debris-sand', label: '♻️ Buy debris sand' },
  ],

  sidebarTitle: "What's included",
  benefits: [
    ['🧹', 'Full debris sweep and removal'],
    ['🏗️', 'Waste sand collection from site'],
    ['💧', 'Dust wash (Standard & above)'],
    ['🚛', 'Tipper truck for waste transport'],
    ['📄', 'GST invoice + disposal certificate'],
    ['📞', 'Dedicated site supervisor'],
  ],

  serviceAreas: SERVICE_AREAS,
  waMessage: `Hi! I need Construction Site Cleaning in ${GEO.city}. Please share pricing and availability.`,
};

const FAQS = [
  { q:'What does the site clean service include?',
    a:'Our team removes debris, excess sand, concrete chunks, tile offcuts, packaging waste, and dust. Site is left broom-clean ready for the next phase.' },
  { q:'How is pricing calculated?',
    a:'By site area (sq ft) and waste volume. Fixed packages for standard sizes; large sites get a free assessment.' },
  { q:'Do you take away all the waste?',
    a:'Yes — everything goes to our recycling facility. Disposal certificate available on request.' },
  { q:'How many workers come?',
    a:'Standard team: 3–4 workers + supervisor. Large sites get a proportionally larger team, plus all equipment.' },
  { q:'Do you work on active sites?',
    a:'Yes — we coordinate with your supervisor and work in sections without disrupting ongoing work. Weekend/after-hours available.' },
  { q:'Do you provide a GST invoice?',
    a:'Yes — full GST invoice sent on WhatsApp within 24 hours of completion.' },
  { q:`Can I combine site clean with debris sand delivery?`,
    a:'Yes — we collect waste and deliver fresh debris sand in the same visit. Bundle and save.' },
];

const SiteClean = () => {
  const [faqOpen,       setFaqOpen]       = useState(null);
  const [selectedPkg,   setSelectedPkg]   = useState('');

  return (
    <ServiceLayout config={LAYOUT_CONFIG}>

      {/* Packages */}
      <section aria-label="Pricing packages">
        <h2 className="text-2xl font-black text-neutral-900 mb-1">Cleaning Packages</h2>
        <p className="text-sm text-neutral-500 mb-5">Fixed prices for standard site sizes. Large sites quoted individually.</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {PACKAGES.map(({ name, price, desc, icon, razorpay }) => {
            const isSelected = selectedPkg === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedPkg(isSelected ? '' : name)}
                aria-pressed={isSelected}
                className={`text-left w-full rounded-2xl p-5 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-300'
                    : 'border-neutral-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">{icon}</span>
                    <span className={`font-black ${isSelected ? 'text-blue-700' : 'text-neutral-900'}`}>{name}</span>
                  </div>
                  <span className={`text-lg font-black whitespace-nowrap ${isSelected ? 'text-blue-700' : 'text-blue-600'}`}>{price}</span>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
                {isSelected && (
                  <p className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Selected — tap again to deselect
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <BookingForm
        serviceType="site-clean"
        serviceLabel="Site Cleaning Service"
        pricePerTon={null}
        firestoreCol="site_clean_bookings"
        razorpayUrl={RAZORPAY_URL}
        accentColor="blue"
        serviceAreas={SERVICE_AREAS}
        showQuantity
        quantityLabel="Site Area (sq ft)"
        quantityUnit="sq ft"
        minQuantity={100}
        pricingNote="We will call you within 2 hours with a final quote based on site size and waste volume."
        selectedPackage={selectedPkg}
      />

      <div className="mt-10">
        <h2 className="text-2xl font-black text-neutral-900 mb-1">Frequently Asked Questions</h2>
        <p className="text-sm text-neutral-500 mb-6">About site cleaning services in {GEO.city}.</p>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="bg-white border-2 border-neutral-200 rounded-xl overflow-hidden">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                aria-expanded={faqOpen === i} aria-controls={`faq-sc-${i}`}>
                <span className="font-bold text-neutral-900 text-sm leading-snug">{q}</span>
                <svg className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {faqOpen === i && (
                <div id={`faq-sc-${i}`} className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 bg-white border-2 border-neutral-200 rounded-2xl p-6">
        <h2 className="text-xl font-black text-neutral-900 mb-2">📍 Service Areas — {GEO.city}</h2>
        <p className="text-sm text-neutral-500 mb-4">We clean construction sites across {GEO.city} and surrounding areas:</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_AREAS.map(city => (
            <span key={city} className="text-sm bg-blue-50 text-blue-800 font-semibold px-3 py-1.5 rounded-full border border-blue-200">
              📍 {city}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-400">Don't see your area? WhatsApp us.</p>
      </div>

    </ServiceLayout>
  );
};

export default SiteClean;

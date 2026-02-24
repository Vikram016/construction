/**
 * WasteSand.jsx
 * Selling waste sand TO customers.
 * Thin page — all layout handled by ServiceLayout.
 */
import ServiceLayout from '../components/ServiceLayout';
import { CONTACT_CONFIG } from '../config/contactConfig';

const SERVICE_AREAS = [
  'Whitefield','Koramangala','Indiranagar','HSR Layout','Jayanagar','JP Nagar',
  'Kharghar','Vashi','Belapur','Airoli','Nerul','Ulwe',
  'Ghansoli','Kopar Khairane','Taloja','Rabale',
];

const PRICE = 1200;

const config = {
  serviceType:         'Waste Sand Delivery',
  slug:                'waste-sand',
  firestoreCollection: 'waste_sand_bookings',

  seo: {
    title:       `Waste Sand Collection ₹${PRICE}/ton | BuildMart Bangalore`,
    description: `Order reclaimed construction waste sand at ₹${PRICE}/ton. Bulk delivery across Bangalore, Whitefield, Koramangala, Indiranagar. GST invoice. 10% advance, balance on delivery.`,
    keywords:    'waste sand delivery Bangalore, bulk sand Bengaluru, construction waste sand, reclaimed sand, waste sand booking, sand collection Bengaluru',
    canonical:   'https://buildmart.in/services/waste-sand',
  },

  hero: {
    badge:    '⚡ Limited Supply — Book Now',
    headline: <>Waste<br/><span className="text-orange-400">Sand</span></>,
    tagline:  'Reclaimed construction sand — ideal for filling, levelling and sub-base work. Bulk delivery across Mumbai Metropolitan Region. GST invoice included.',
  },

  stats: [
    { value: `₹${Number(PRICE).toLocaleString('en-IN')}/ton`, label: 'Per Ton' },
    { value: '10%',  label: 'Advance Only' },
    { value: '24hr', label: 'Delivery' },
  ],

  pricing: {
    display: `₹${Number(PRICE).toLocaleString('en-IN')}`,
    unit:    'per ton',
    note:    '10% advance secures your slot. Balance payable on delivery. GST invoice included.',
  },

  heroColor:   'bg-neutral-900',
  accentColor: 'bg-orange-500',
  accentPill:  'bg-orange-500 text-neutral-900',

  benefits: [
    { icon: '🌿', text: 'Legal & eco-compliant — no river mining' },
    { icon: '🏗️', text: 'Filling, levelling, sub-base, backfill' },
    { icon: '🚛', text: '10-ton tipper trucks — fast delivery' },
    { icon: '📄', text: 'GST invoice — claim input credit' },
    { icon: '✅', text: 'Quality checked before dispatch' },
    { icon: '📞', text: '24×7 dedicated site support' },
  ],

  crossLinks: [
    { emoji: '♻️', label: 'Need Debris Sand? ₹900/ton',     to: '/services/debris-sand' },
    { emoji: '🧹', label: 'Site Cleaning Service available', to: '/services/site-clean'  },
  ],

  faqs: [
    {
      q: 'What is waste sand and where does it come from?',
      a: 'Waste sand is surplus fine aggregate from active construction sites — leftover from concrete batching, masonry and plaster work. It is cleaned, sieved and tested before delivery. Unlike river sand, it is 100% legal and eco-compliant.',
    },
    {
      q: 'What is the minimum order?',
      a: 'Minimum order is 1 ton. We typically deliver in 10-ton tipper trucks. Orders below 10 tons may be combined with nearby deliveries. Above 50 tons — call for bulk pricing.',
    },
    {
      q: 'Is it suitable for plastering and concreting?',
      a: 'Best for filling, levelling, sub-base and backfill. For structural concreting or fine plastering, M-sand is recommended. Call us if unsure — we guide you to the right product.',
    },
    {
      q: 'Do you provide a GST invoice?',
      a: 'Yes. A GST tax invoice is shared on WhatsApp within 24 hours of delivery. You can claim input tax credit on it.',
    },
    {
      q: 'How quickly do you deliver?',
      a: 'Whitefield, Koramangala, HSR Layout orders within 24 hours. Jayanagar, JP Nagar take 24–48 hours. We call 2 hours before arrival.',
    },
    {
      q: 'Is the advance refundable?',
      a: 'Yes — 100% refundable if we cannot fulfill within the agreed timeframe. Returned in 3–5 business days to original payment method.',
    },
  ],

  serviceAreas: SERVICE_AREAS,

  schemas: [
    {
      '@context': 'https://schema.org',
      '@type':    'LocalBusiness',
      name:        'BuildMart',
      url:         'https://buildmart.com',
      telephone:   CONTACT_CONFIG.phone,
      address: {
        '@type':         'PostalAddress',
        addressLocality: CONTACT_CONFIG.address?.city,
        addressRegion:   CONTACT_CONFIG.address?.state,
        postalCode:      CONTACT_CONFIG.address?.pincode,
        addressCountry:  'IN',
      },
      geo: {
        '@type':    'GeoCoordinates',
        latitude:   CONTACT_CONFIG.location?.lat,
        longitude:  CONTACT_CONFIG.location?.lng,
      },
      areaServed:    SERVICE_AREAS.map(name => ({ '@type': 'City', name })),
      openingHours:  'Mo-Sa 09:00-19:00',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name:    'Sand Products',
        itemListElement: [{
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Waste Sand Bulk Delivery' },
          priceCurrency: 'INR',
          price:  PRICE,
          unitText: 'TON',
          availability: 'https://schema.org/InStock',
        }],
      },
    },
    {
      '@context':   'https://schema.org',
      '@type':      'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is waste sand?', acceptedAnswer: { '@type': 'Answer', text: 'Surplus fine aggregate from active construction sites. Legal and eco-compliant.' } },
        { '@type': 'Question', name: 'Minimum order?', acceptedAnswer: { '@type': 'Answer', text: 'Minimum 1 ton.' } },
      ],
    },
  ],
};

const WasteSand = () => <ServiceLayout config={config}/>;
export default WasteSand;

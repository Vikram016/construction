/**
 * DebrisSand.jsx
 * Selling debris sand TO customers — recycled demolition material.
 */
import ServiceLayout from '../components/ServiceLayout';
import { CONTACT_CONFIG } from '../config/contactConfig';

const SERVICE_AREAS = [
  'Whitefield','Koramangala','Indiranagar','HSR Layout','Jayanagar','JP Nagar',
  'Kharghar','Vashi','Belapur','Airoli','Nerul','Ulwe',
  'Ghansoli','Kopar Khairane','Taloja','Dronagiri',
];

const PRICE = 900;

const config = {
  serviceType:         'Debris Sand Delivery',
  slug:                'debris-sand',
  firestoreCollection: 'debris_sand_bookings',

  seo: {
    title:       `Debris Sand ₹${PRICE}/ton | BuildMart — Cheapest Recycled Sand Bangalore`,
    description: `Order recycled debris sand at ₹${PRICE}/ton. Bulk delivery across Bangalore, Whitefield, Koramangala. GST invoice. 10% advance. Eco-certified demolition sand for filling & sub-base work.`,
    keywords:    'debris sand Bangalore, recycled sand Bengaluru, demolition sand, cheap sand, debris sand delivery, construction debris sand, filling sand',
    canonical:   'https://buildmart.in/services/debris-sand',
  },

  hero: {
    badge:    '♻️ Eco-Friendly · Recycled Material',
    headline: <>Debris<br/><span className="text-emerald-400">Sand</span></>,
    tagline:  'Recycled demolition sand — cleaned, sieved and ready to use. Perfect for filling, levelling and sub-base work at Mumbai\'s lowest price.',
  },

  stats: [
    { value: `₹${Number(PRICE).toLocaleString('en-IN')}/ton`, label: 'Per Ton' },
    { value: '10%',  label: 'Advance Only' },
    { value: '24hr', label: 'Delivery' },
  ],

  pricing: {
    display: `₹${Number(PRICE).toLocaleString('en-IN')}`,
    unit:    'per ton',
    note:    '25% cheaper than waste sand. 10% advance, balance on delivery. GST invoice included.',
  },

  heroColor:   'bg-emerald-950',
  accentColor: 'bg-emerald-600',
  accentPill:  'bg-emerald-400/20 border border-emerald-400/30 text-emerald-300',

  benefits: [
    { icon: '💸', text: '25% cheaper than waste sand' },
    { icon: '🌿', text: 'Reduces landfill — eco-responsible' },
    { icon: '🏗️', text: 'Filling, levelling, sub-base, backfill' },
    { icon: '🚛', text: '10-ton tipper trucks — fast loading' },
    { icon: '📄', text: 'GST invoice — claim input credit' },
    { icon: '✅', text: 'Quality tested before dispatch' },
  ],

  crossLinks: [
    { emoji: '🏗️', label: 'Need Waste Sand? ₹1,200/ton',    to: '/services/waste-sand' },
    { emoji: '🧹', label: 'Site Cleaning Service available', to: '/services/site-clean'  },
  ],

  faqs: [
    {
      q: 'What is debris sand?',
      a: 'Debris sand is fine material recovered from construction demolition. It is processed through industrial sieves to remove large particles and tested for quality before dispatch. Suitable for filling, sub-base and backfill work.',
    },
    {
      q: 'What is the minimum order quantity?',
      a: 'Minimum order is 2 tons. We deliver in standard 10-ton tipper trucks. Orders above 20 tons qualify for bulk discounts — call us for a quote.',
    },
    {
      q: 'Is debris sand cheaper than waste sand?',
      a: `Yes. Debris sand is ₹${PRICE}/ton vs waste sand at ₹1,200/ton. Both are reclaimed materials. Debris sand comes from demolition sites; waste sand from construction processes. Both work well for filling and sub-base.`,
    },
    {
      q: 'Do you provide a GST invoice?',
      a: 'Yes. A GST tax invoice is shared on WhatsApp within 24 hours of delivery.',
    },
    {
      q: 'How quickly do you deliver?',
      a: 'Whitefield, Koramangala within 24 hours. Jayanagar, JP Nagar 24–48 hours. We call you 2 hours before arrival.',
    },
    {
      q: 'Is the advance refundable?',
      a: 'Yes. If we cannot deliver within the agreed timeframe, the advance is fully refunded in 3–5 business days.',
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
        '@type':   'GeoCoordinates',
        latitude:  CONTACT_CONFIG.location?.lat,
        longitude: CONTACT_CONFIG.location?.lng,
      },
      areaServed: SERVICE_AREAS.map(name => ({ '@type': 'City', name })),
      openingHours: 'Mo-Sa 09:00-19:00',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name:    'Sand Products',
        itemListElement: [{
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Debris Sand Bulk Delivery' },
          priceCurrency: 'INR',
          price:  PRICE,
          unitText: 'TON',
          availability: 'https://schema.org/InStock',
        }],
      },
    },
  ],
};

const DebrisSand = () => <ServiceLayout config={config}/>;
export default DebrisSand;

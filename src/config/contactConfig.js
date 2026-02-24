/**
 * contactConfig.js
 * Single source of truth for ALL contact details across BuildMart.
 * Referenced by: ServiceLayout, BookingForm, Footer, WhatsAppFloat,
 *               WasteSandBooking, DebrisSandBooking, SiteClean, schema JSON-LD.
 *
 * ⚠️  CHANGE DETAILS HERE — nowhere else.
 */

export const CONTACT_CONFIG = {
  // ── WhatsApp ─────────────────────────────────────────────────────────────
  whatsapp:    import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',

  // ── Voice call ────────────────────────────────────────────────────────────
  phone:       import.meta.env.VITE_PHONE_DISPLAY   || '+91 98765 43210',
  phoneRaw:    import.meta.env.VITE_WHATSAPP_NUMBER  || '919876543210',

  // ── Email ─────────────────────────────────────────────────────────────────
  email: {
    sales:   'sales@buildmart.in',
    support: 'support@buildmart.in',
    info:    'info@buildmart.in',
  },

  // ── Address — Bangalore (matches seoConfig GEO) ───────────────────────────
  address: {
    street:  '12 Industrial Layout, Peenya Industrial Area',
    city:    'Bangalore',
    state:   'Karnataka',
    pincode: '560058',
    country: 'India',
    full:    '12 Industrial Layout, Peenya Industrial Area, Bangalore, Karnataka 560058',
  },

  // ── Hours ─────────────────────────────────────────────────────────────────
  hours: {
    weekdays:  'Mon–Sat: 8 AM – 7 PM',
    weekend:   'Sunday: Closed',
    emergency: '24/7 WhatsApp Support',
  },

  // ── Geo coordinates ───────────────────────────────────────────────────────
  location: {
    lat: 12.9716,
    lng: 77.5946,
  },

  // ── Social ────────────────────────────────────────────────────────────────
  social: {
    facebook:  '',
    instagram: '',
    twitter:   '',
    linkedin:  '',
  },
};

export default CONTACT_CONFIG;

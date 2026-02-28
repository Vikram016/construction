/**
 * seoConfig.js — Centralized SEO + GEO config for all BuildMart pages.
 *
 * Import PAGE_SEO, GEO, SITE, LOCAL_BUSINESS_SCHEMA into PageSEO or pages.
 * All canonical URLs use /services/ prefix for service pages.
 */

export const SITE = {
  name:         'BuildMart',
  tagline:      'Premium Construction Materials Delivered',
  url:          'https://buildmart.in',
  logo:         'https://buildmart.in/logo.png',
  phone:        import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',
  phoneDisplay: '+91 98765 43210',
  email:        'sales@buildmart.in',
  whatsapp:     import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',
};

export const GEO = {
  city:        'Bangalore',
  cityAlt:     'Bengaluru',        // alternate spelling used in keywords
  state:       'Karnataka',
  country:     'India',
  countryCode: 'IN',
  stateCode:   'IN-KA',
  pincode:     '560058',
  street:      '12 Industrial Layout, Peenya Industrial Area',
  lat:         12.9716,
  lng:         77.5946,
  areaServed: [
    'Bangalore', 'Bengaluru', 'Whitefield', 'Electronic City',
    'Marathahalli', 'Koramangala', 'HSR Layout', 'Indiranagar',
    'Jayanagar', 'JP Nagar', 'Bannerghatta Road', 'Yelahanka',
    'Hebbal', 'Rajajinagar', 'Vijayanagar', 'Kengeri',
    'Sarjapur Road', 'Bellary Road', 'Tumkur Road', 'Hosur Road',
    'Devanahalli', 'Nelamangala', 'Anekal', 'Hoskote',
  ],
};

/* ── LocalBusiness schema — included on every page ─────────────────────── */
export const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'LocalBusiness',
  '@id':      `${SITE.url}/#business`,
  name:       SITE.name,
  url:        SITE.url,
  logo:       SITE.logo,
  telephone:  SITE.phoneDisplay,
  email:      SITE.email,
  description:`Premium construction material supplier in ${GEO.city}. Cement, steel, bricks, sand and site services.`,
  address: {
    '@type':         'PostalAddress',
    streetAddress:   GEO.street,
    addressLocality: GEO.city,
    addressRegion:   GEO.state,
    postalCode:      GEO.pincode,
    addressCountry:  GEO.countryCode,
  },
  geo: {
    '@type':    'GeoCoordinates',
    latitude:   GEO.lat,
    longitude:  GEO.lng,
  },
  areaServed:     GEO.areaServed.map(name => ({ '@type': 'City', name })),
  openingHours:   'Mo-Sa 08:00-19:00',
  priceRange:     '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Bank Transfer, UPI, Razorpay',
  contactPoint: {
    '@type':             'ContactPoint',
    telephone:           SITE.phoneDisplay,
    contactType:         'customer service',
    areaServed:          GEO.countryCode,
    availableLanguage:   ['English', 'Hindi', 'Kannada'],
    contactOption:       'TollFree',
  },
  sameAs: [ `https://wa.me/${SITE.whatsapp}` ],
};

/* ── WebSite schema — homepage only ────────────────────────────────────── */
export const WEBSITE_SCHEMA = {
  '@context':       'https://schema.org',
  '@type':          'WebSite',
  '@id':            `${SITE.url}/#website`,
  name:             SITE.name,
  url:              SITE.url,
  potentialAction:  {
    '@type':       'SearchAction',
    target:        { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/products?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

/* ── Per-page SEO — every route ─────────────────────────────────────────── */
export const PAGE_SEO = {

  home: {
    title:       `BuildMart — Construction Materials in ${GEO.city} | Cement, Steel, Sand Delivered`,
    description: `BuildMart delivers cement, steel, bricks, and sand to construction sites in ${GEO.city}. GST invoiced. 24–48 hr delivery. Trusted by 5,000+ builders in ${GEO.state}. Call or WhatsApp now.`,
    keywords:    `construction materials ${GEO.city}, cement supplier Bangalore, steel TMT bars Bangalore, building materials Bengaluru, sand delivery Bangalore, construction site delivery Karnataka`,
    canonical:   SITE.url,
    og: {
      title:       `BuildMart — Construction Materials Delivered in ${GEO.city}`,
      description: `Cement, steel, bricks & sand delivered 24–48 hrs. GST invoiced. 5,000+ builders trust us in ${GEO.city}.`,
      image:       `${SITE.url}/og-home.jpg`,
    },
  },

  products: {
    title:       `Building Materials Supplier in ${GEO.city} — M-Sand, River Sand, Bricks, Blocks, Cement | BuildMart`,
    description: `BuildMart — trusted building materials supplier in ${GEO.city}. M-Sand, River Sand, P-Sand, Red Bricks, Concrete Blocks, Weightless Blocks, Tractor Loads, Cement. Fast delivery to Angondhalli, Whitefield, Hoskote, KR Puram, Marathahalli.`,
    keywords:    `building materials supplier Bangalore, M-Sand supplier Angondhalli, river sand delivery Whitefield, bricks supplier Hoskote, concrete blocks KR Puram, cement dealer Bangalore, tractor load sand Marathahalli`,
    canonical:   `${SITE.url}/products`,
    og: {
      title:       `Building Materials Supplier — BuildMart ${GEO.city}`,
      description: `M-Sand, River Sand, Bricks, Blocks, Cement. Tractor load delivery across ${GEO.city}. Competitive prices.`,
      image:       `${SITE.url}/og-products.jpg`,
    },
  },

  wasteSand: {
    title:       `Waste Sand Collection in ${GEO.city} | ₹1,200/ton Pickup — BuildMart`,
    description: `We collect waste sand from your construction site in ${GEO.city}. ₹1,200/ton. 24-hr pickup. GST invoice. Serving Whitefield, Electronic City, Koramangala, Marathahalli & all of ${GEO.city}.`,
    keywords:    `waste sand collection Bangalore, collect waste sand Bengaluru, construction site sand removal Bangalore, waste sand pickup Karnataka, waste sand recycling Bangalore, surplus sand collection`,
    canonical:   `${SITE.url}/services/waste-sand`,
    og: {
      title:       `Waste Sand Collection ₹1,200/ton | BuildMart ${GEO.city}`,
      description: `We pick up surplus waste sand from your construction site. Fast. Eco-responsible. GST invoiced. ${GEO.city}.`,
      image:       `${SITE.url}/og-waste-sand.jpg`,
    },
  },

  debrisSand: {
    title:       `Debris Sand Delivery in ${GEO.city} | ₹900/ton Bulk Supply — BuildMart`,
    description: `Order debris sand in bulk at ₹900/ton delivered to your site in ${GEO.city}. 10% advance, balance on delivery. GST invoice. 24-hr delivery across Bangalore, Whitefield, Electronic City & nearby.`,
    keywords:    `debris sand Bangalore, debris sand delivery Bengaluru, recycled sand supplier Karnataka, bulk sand Bangalore, demolition sand Bengaluru, construction filling sand Bangalore`,
    canonical:   `${SITE.url}/services/debris-sand`,
    og: {
      title:       `Debris Sand ₹900/ton | Bulk Delivery ${GEO.city} — BuildMart`,
      description: `Recycled demolition sand. Bulk delivery. 10% advance. GST invoice. ${GEO.city}.`,
      image:       `${SITE.url}/og-debris-sand.jpg`,
    },
  },

  siteClean: {
    title:       `Construction Site Cleaning in ${GEO.city} | From ₹2,999 — BuildMart`,
    description: `Professional construction site cleanup in ${GEO.city}. Debris removal, waste sand collection, full site reset. Packages from ₹2,999. GST invoice. Serving all areas of Bangalore.`,
    keywords:    `construction site cleaning Bangalore, site cleanup Bengaluru, debris removal Bangalore, post construction cleaning Karnataka, site clean Whitefield, building site clearance Bangalore`,
    canonical:   `${SITE.url}/services/site-clean`,
    og: {
      title:       `Site Cleaning Service | BuildMart ${GEO.city}`,
      description: `End-to-end construction site cleanup. Debris removal, waste sand, dust wash. GST invoice. ${GEO.city}.`,
      image:       `${SITE.url}/og-site-clean.jpg`,
    },
  },

  calculator: {
    title:       `Free Construction Cost Calculator ${GEO.city} | Estimate Materials & Budget`,
    description: `Free construction cost calculator for ${GEO.city}. Instantly estimate cement, steel, brick and sand quantities for your project. Get a WhatsApp quote from BuildMart in seconds.`,
    keywords:    `construction cost calculator Bangalore, material estimate Bengaluru, building cost calculator Karnataka, cement quantity calculator, steel quantity calculator Bangalore`,
    canonical:   `${SITE.url}/calculator`,
    og: {
      title:       `Free Construction Calculator — BuildMart ${GEO.city}`,
      description: `Estimate your material needs instantly. Free. No signup. Get WhatsApp quote in seconds.`,
      image:       `${SITE.url}/og-calculator.jpg`,
    },
  },

  blog: {
    title:       `Construction Tips & Material Guides | BuildMart ${GEO.city} Blog`,
    description: `Expert construction tips, material buying guides, and cost-saving advice for builders in ${GEO.city}. Cement ratios, TMT grades, brickwork guides — updated weekly.`,
    keywords:    `construction tips Bangalore, building material guide Karnataka, cement quality Bangalore, steel buying guide Bengaluru, construction blog India, builder tips Karnataka`,
    canonical:   `${SITE.url}/blog`,
    og: {
      title:       `BuildMart Blog — Construction Tips for ${GEO.city} Builders`,
      description: `Expert guides on materials, costs and construction best practices for ${GEO.city}.`,
      image:       `${SITE.url}/og-blog.jpg`,
    },
  },

  about: {
    title:       `About BuildMart — Trusted Construction Supplier in ${GEO.city} Since 2014`,
    description: `BuildMart has supplied premium construction materials to 5,000+ builders across ${GEO.city} since 2014. Learn about our mission, team, and commitment to quality and transparency.`,
    keywords:    `about BuildMart, construction material supplier Bangalore, trusted builder supplier Bengaluru, Karnataka construction company, BuildMart history`,
    canonical:   `${SITE.url}/about`,
    og: {
      title:       `About BuildMart | Trusted Construction Materials — ${GEO.city}`,
      description: `Trusted by 5,000+ builders in ${GEO.city}. 10+ years. Premium materials. GST invoiced.`,
      image:       `${SITE.url}/og-about.jpg`,
    },
  },

  contact: {
    title:       `Contact BuildMart | Construction Materials ${GEO.city} — Call or WhatsApp`,
    description: `Contact BuildMart for construction material orders, quotes, and delivery in ${GEO.city}. Call or WhatsApp +91 98765 43210. Located at Peenya Industrial Area, Bangalore.`,
    keywords:    `contact BuildMart Bangalore, construction materials order Bengaluru, WhatsApp builder Bangalore, building materials phone number Karnataka, Peenya supplier`,
    canonical:   `${SITE.url}/contact`,
    og: {
      title:       `Contact BuildMart | ${GEO.city} Construction Materials`,
      description: `Call or WhatsApp us for orders and quotes. Mon–Sat 8AM–7PM. ${GEO.city}.`,
      image:       `${SITE.url}/og-contact.jpg`,
    },
  },
};

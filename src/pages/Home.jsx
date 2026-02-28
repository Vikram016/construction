import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageSEO from "../components/PageSEO";
import GoogleReviews from "../components/GoogleReviews";
import {
  PAGE_SEO,
  LOCAL_BUSINESS_SCHEMA,
  WEBSITE_SCHEMA,
  SITE,
  GEO,
} from "../config/seoConfig";
import { CONTACT_CONFIG } from "../config/contactConfig";

/* ─── helpers ───────────────────────────────────────────────────────────── */
const waOpen = (msg) => {
  const n = CONTACT_CONFIG.whatsapp || SITE.whatsapp;
  window.open(
    "https://wa.me/" + n + "?text=" + encodeURIComponent(msg),
    "_blank",
  );
};
const callNow = () => {
  window.location.href =
    "tel:" + (CONTACT_CONFIG.phoneRaw || CONTACT_CONFIG.whatsapp);
};

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const WAIcon = ({ cls }) => (
  <svg className={cls || "w-5 h-5"} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);
const CallIcon = ({ cls }) => (
  <svg
    className={cls || "w-5 h-5"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);
const CartIcon = ({ cls }) => (
  <svg
    className={cls || "w-4 h-4"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
const PayIcon = ({ cls }) => (
  <svg
    className={cls || "w-4 h-4"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

/* ─── Category data — matches Products page exactly ─────────────────────── */
const CATEGORIES = [
  {
    id: "jelly",
    emoji: "🪨",
    name: "Jelly / Chips",
    desc: "Crushed stone aggregates for concrete & foundations",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    alt: "Jelly chips stone aggregate supplier Bangalore",
    href: "/products#jelly",
  },
  {
    id: "sand",
    emoji: "🏖",
    name: "Sand",
    desc: "M-Sand, River Sand, P-Sand & Cinder varieties",
    img: "https://images.unsplash.com/photo-1544714042-2a1caefc77ce?w=400&h=300&fit=crop",
    alt: "M-Sand River Sand supplier Angondhalli Bangalore",
    href: "/products#sand",
  },
  {
    id: "bricks",
    emoji: "🧱",
    name: "Red Bricks",
    desc: "Normal MTB and premium Wirecut bricks",
    img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    alt: "Red bricks supplier Hoskote KR Puram Bangalore",
    href: "/products#bricks",
  },
  {
    id: "blocks",
    emoji: "🏗",
    name: "Concrete Blocks",
    desc: 'Hollow and solid blocks — 4", 6", 8"',
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
    alt: "Concrete hollow blocks dealer Marathahalli Bangalore",
    href: "/products#blocks",
  },
  {
    id: "weightless",
    emoji: "⬜",
    name: "Weightless Blocks",
    desc: "Lightweight AAC blocks for faster walls",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    alt: "AAC weightless blocks supplier Whitefield Bangalore",
    href: "/products#weightless",
  },
  {
    id: "tractor",
    emoji: "🚜",
    name: "Tractor Loads",
    desc: "Full, body level, half & quarter loads",
    img: "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?w=400&h=300&fit=crop",
    alt: "Tractor load sand delivery Bangalore",
    href: "/products#tractor",
  },
  {
    id: "cement",
    emoji: "🏢",
    name: "Cement",
    desc: "UltraTech, Birla, Ramco, Karthika, ACC",
    img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    alt: "Cement dealer all brands Bangalore",
    href: "/products#cement",
  },
];

/* ─── Featured products — real prices aligned with Products page ─────────── */
const FEATURED = [
  {
    id: "fp-msand",
    name: "M-Sand",
    category: "Sand",
    price: 100,
    unit: "per load",
    href: "/products#sand",
    img: "https://images.unsplash.com/photo-1544714042-2a1caefc77ce?w=500&h=500&fit=crop",
    alt: "M-Sand manufactured sand supplier Angondhalli Bangalore — ₹100 per load",
    badge: "Best Seller",
    badgeColor: "bg-green-500",
  },
  {
    id: "fp-river",
    name: "River Sand",
    category: "Sand",
    price: 150,
    unit: "per load",
    href: "/products#sand",
    img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=500&h=500&fit=crop",
    alt: "River sand delivery Whitefield KR Puram Bangalore — ₹150 per load",
    badge: "Popular",
    badgeColor: "bg-blue-500",
  },
  {
    id: "fp-wirecut",
    name: "Wirecut Brick",
    category: "Red Bricks",
    price: 13,
    unit: "per brick",
    href: "/products#bricks",
    img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop",
    alt: "Wirecut red bricks supplier Hoskote Bangalore — ₹13 per brick",
    badge: "Premium",
    badgeColor: "bg-purple-500",
  },
  {
    id: "fp-block6",
    name: '6" Concrete Block',
    category: "Concrete Blocks",
    price: 42,
    unit: "per block",
    href: "/products#blocks",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&h=500&fit=crop",
    alt: "Concrete hollow blocks 6 inch Marathahalli Bangalore — ₹42 per block",
    badge: "Top Pick",
    badgeColor: "bg-orange-500",
  },
  {
    id: "fp-ultratech",
    name: "UltraTech Cement",
    category: "Cement",
    price: 380,
    unit: "per 50 kg bag",
    href: "/products#cement",
    img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop",
    alt: "UltraTech cement dealer Bangalore — ₹380 per 50kg bag",
    badge: null,
    badgeColor: "",
  },
  {
    id: "fp-jelly20",
    name: "20mm Baby Jelly",
    category: "Jelly / Chips",
    price: 100,
    unit: "per load",
    href: "/products#jelly",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
    alt: "Jelly chips 20mm aggregate supplier Bangalore — ₹100 per load",
    badge: null,
    badgeColor: "",
  },
  {
    id: "fp-psand",
    name: "P-Sand",
    category: "Sand",
    price: 180,
    unit: "per load",
    href: "/products#sand",
    img: "https://images.unsplash.com/photo-1544714042-2a1caefc77ce?w=500&h=500&fit=crop&q=80",
    alt: "P-Sand plastering sand supplier Bangalore — ₹180 per load",
    badge: null,
    badgeColor: "",
  },
  {
    id: "fp-aac6",
    name: '6" Weightless Block',
    category: "Weightless Blocks",
    price: 80,
    unit: "per block",
    href: "/products#weightless",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=500&fit=crop",
    alt: "AAC weightless blocks supplier Whitefield Bangalore — ₹80 per block",
    badge: "Eco",
    badgeColor: "bg-teal-500",
  },
];

const ALL_CATS = ["All", ...new Set(FEATURED.map((p) => p.category))];

/* ─── Featured product card — image only + link ─────────────────────── */
const FeaturedCard = ({ p }) => (
  <Link
    to={p.href || "/products"}
    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    title={p.alt}
  >
    {/* Square product image */}
    <div className="relative aspect-square overflow-hidden bg-gray-50">
      <img
        src={p.img}
        alt={p.alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Badge */}
      {p.badge && (
        <span
          className={
            "absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm " +
            p.badgeColor
          }
        >
          {p.badge}
        </span>
      )}
      {/* Hover overlay with arrow */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-end justify-end p-2.5">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow">
          View
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </div>
    {/* Name + price strip */}
    <div className="px-3 pt-2.5 pb-3">
      <p className="text-orange-500 text-xs font-bold uppercase tracking-wide leading-none mb-1">
        {p.category}
      </p>
      <p className="font-bold text-gray-900 text-sm leading-snug">{p.name}</p>
      <p className="text-sm font-black text-gray-900 mt-1">
        ₹{p.price.toLocaleString("en-IN")}
        <span className="text-gray-400 text-xs font-normal ml-1">{p.unit}</span>
      </p>
    </div>
  </Link>
);

/* ─── Main componentnent ────────────────────────────────────────────────────── */
const Home = () => {
  const [nameQ, setNameQ] = useState("");
  const [catQ, setCatQ] = useState("All");

  const filtered = useMemo(
    () =>
      FEATURED.filter((p) => {
        const q = nameQ.toLowerCase();
        return (
          (catQ === "All" || p.category === catQ) &&
          (p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q))
        );
      }),
    [nameQ, catQ],
  );

  return (
    <>
      <PageSEO
        config={PAGE_SEO.home}
        schemas={[LOCAL_BUSINESS_SCHEMA, WEBSITE_SCHEMA]}
        breadcrumbs={[{ name: "Home", url: SITE.url }]}
      />
      <div className="bg-white">
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative bg-neutral-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=800&fit=crop"
              alt="Building materials supplier Bangalore — M-Sand, Bricks, Cement, Blocks"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative container-custom py-20 md:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                Reliable Building Materials
                <span className="block text-primary-500">
                  Supplier in {GEO.city}
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-2 text-neutral-300 font-medium">
                M-Sand &nbsp;·&nbsp; River Sand &nbsp;·&nbsp; Red Bricks
                &nbsp;·&nbsp; Concrete Blocks &nbsp;·&nbsp; Cement
              </p>
              <p className="text-sm md:text-base text-neutral-400 mb-8">
                Serving Angondhalli · Whitefield · Hoskote · KR Puram ·
                Marathahalli
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="btn-primary text-base md:text-lg px-7 py-3.5"
                >
                  View Price List →
                </Link>
                <button
                  onClick={() =>
                    waOpen(
                      "Hi! I want to place a building materials order. Please help.",
                    )
                  }
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-lg transition-all text-base md:text-lg"
                >
                  <WAIcon cls="w-5 h-5" /> WhatsApp Order
                </button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 0L60 8C120 16 240 30 360 35C480 40 600 35 720 32C840 30 960 30 1080 35C1200 40 1320 50 1380 55L1440 60V80H0V0Z"
                fill="white"
              />
            </svg>
          </div>
        </section>

        {/* ── TRUST BADGES ──────────────────────────────────────────────── */}
        <section className="py-14 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {[
                {
                  icon: "🚚",
                  title: "Fast Delivery",
                  sub: "24–48 hours to site",
                },
                {
                  icon: "✅",
                  title: "Quality Checked",
                  sub: "Every batch verified",
                },
                {
                  icon: "⚖️",
                  title: "Accurate Weight",
                  sub: "Honest load measure",
                },
                {
                  icon: "💰",
                  title: "Best Market Price",
                  sub: "Competitive rates",
                },
              ].map((b, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <h3 className="text-base font-bold text-neutral-900 mb-1">
                    {b.title}
                  </h3>
                  <p className="text-sm text-neutral-500">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            BROWSE BY CATEGORY — 7 categories matching Products page
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-neutral-50">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-3">
                Browse by Category
              </h2>
              <p className="text-base md:text-lg text-neutral-500 max-w-2xl mx-auto">
                Building materials supplier in {GEO.city} — sand, bricks,
                blocks, cement and aggregates delivered to your site
              </p>
            </div>

            {/* 7-column grid on large screens, 2 cols mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.href}
                  title={cat.alt}
                  className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-xl transition-all duration-300 block"
                >
                  <img
                    src={cat.img}
                    alt={cat.alt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Emoji badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm">
                    {cat.emoji}
                  </div>

                  {/* Arrow on hover */}
                  <div className="absolute top-2 right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                    <p className="font-bold text-xs md:text-sm leading-tight">
                      {cat.name}
                    </p>
                    <p className="text-neutral-300 text-xs mt-0.5 leading-tight hidden md:block line-clamp-1">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold text-sm md:text-base transition-colors"
              >
                View All Products &amp; Prices
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FEATURED PRODUCTS — filter + WA + Call + Add to Cart + Pay
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            {/* Section header */}
            <div className="flex flex-wrap gap-4 justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-2">
                  Featured Products
                </h2>
                <p className="text-neutral-500 text-sm md:text-base">
                  Best-selling building materials in {GEO.city} — order via
                  WhatsApp, Call or pay online
                </p>
              </div>
              <Link
                to="/products"
                className="btn-outline hidden md:inline-flex text-sm shrink-0"
              >
                View All Products →
              </Link>
            </div>

            {/* ── FILTER BAR ──────────────────────────────────────────── */}
            {/* ── FILTER TABS ── */}
            <div className="mb-6">
              {/* Category selection tabs */}
              <div className="flex flex-wrap gap-2 mb-3">
                {ALL_CATS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCatQ(cat);
                      setNameQ("");
                    }}
                    className={
                      "px-4 py-2 rounded-full text-sm font-bold transition-all " +
                      (catQ === cat
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900")
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative max-w-xs">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products…"
                  value={nameQ}
                  onChange={(e) => setNameQ(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                />
                {nameQ && (
                  <button
                    onClick={() => setNameQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* ── PRODUCT GRID ────────────────────────────────────────── */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {filtered.map((p) => (
                  <FeaturedCard key={p.id} p={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <p className="text-gray-400 text-lg mb-3">
                  No products match "{nameQ}"
                </p>
                <button
                  onClick={() => {
                    setNameQ("");
                    setCatQ("All");
                  }}
                  className="text-orange-600 font-bold hover:underline text-sm"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* View all — mobile */}
            <div className="text-center mb-10 md:hidden">
              <Link to="/products" className="btn-outline">
                View All Products →
              </Link>
            </div>

            {/* SEO + Geo text block */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-700 text-sm mb-2">
                Building Materials Supplier in {GEO.city} — M-Sand, River Sand,
                Bricks, Blocks, Cement
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                BuildMart is a trusted building materials supplier in {GEO.city}
                , {GEO.state}. We supply M-Sand, River Sand, P-Sand, Red Bricks,
                Concrete Blocks, Weightless AAC Blocks, Tractor Loads and Cement
                (UltraTech, Birla, Ramco, Karthika, ACC) to construction sites
                across Angondhalli, Whitefield, Hoskote, KR Puram, Marathahalli
                and all of {GEO.city}. Fast delivery, accurate measurement,
                competitive market prices. Call or WhatsApp us to place your
                order today.
              </p>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────── */}
        <section className="py-20 bg-neutral-900 text-white">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Why Choose BuildMart?
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      title: "Transparent Pricing",
                      body: "Clear price list with no hidden charges. What you see is what you pay.",
                    },
                    {
                      title: "Quality Materials",
                      body: "Every batch quality-checked before dispatch. Honest load measurements.",
                    },
                    {
                      title: "Fast Reliable Delivery",
                      body: "Tractor and truck delivery across Bangalore in 24–48 hours.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                        <p className="text-neutral-300">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=600&fit=crop"
                  alt="Building materials delivery Bangalore"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── GOOGLE REVIEWS ────────────────────────────────────────────── */}
        <GoogleReviews />

        {/* ── CTA BANNER ────────────────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Need Bulk Orders?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Special pricing for contractors and builders. Call or WhatsApp for
              a custom quote.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() =>
                  waOpen(
                    "Hi! I need bulk pricing for construction materials for my project in Bangalore.",
                  )
                }
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-lg text-base md:text-lg transition-all shadow-lg"
              >
                <WAIcon cls="w-5 h-5" /> WhatsApp Quote
              </button>
              <button
                onClick={callNow}
                className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-neutral-100 font-bold px-8 py-4 rounded-lg text-base md:text-lg transition-all shadow-lg"
              >
                <CallIcon cls="w-5 h-5" /> Call Sales Team
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;

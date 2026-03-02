/**
 * Header.jsx — Services dropdown navbar
 *
 * Desktop: hover-open "Services ▼" dropdown
 * Mobile:  hamburger → tap "Services" to expand sub-items
 * ARIA:    role="navigation", aria-haspopup, aria-expanded on all toggles
 * Routes:  /services/waste-sand  /services/debris-sand  /services/site-clean
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartDrawer from "./cart/CartDrawer";

/* ── Config ─────────────────────────────────────────────────────────────── */
const WA = import.meta.env.VITE_WHATSAPP_NUMBER || "918122107464";

const SERVICES = [
  {
    name: "Waste Sand",
    path: "/services/waste-sand",
    icon: "🏗️",
    desc: "We collect from your site · ₹1,200/ton",
  },
  {
    name: "Debris Sand",
    path: "/services/debris-sand",
    icon: "♻️",
    desc: "Bulk delivery to site · ₹900/ton",
  },
  {
    name: "Site Cleaning",
    path: "/services/site-clean",
    icon: "🧹",
    desc: "Full cleanup service · from ₹2,999",
  },
];

const NAV_LEFT = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
];
const NAV_RIGHT = [
  { name: "Calculator", path: "/calculator" },
  { name: "Blog", path: "/blog" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

/* ── Tiny icons ─────────────────────────────────────────────────────────── */
const WAIcon = () => (
  <svg
    className="w-4 h-4 shrink-0"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const Chevron = ({ open, className = "" }) => (
  <svg
    className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

/* ── Shared nav link classes ─────────────────────────────────────────────── */
const linkCls = (active) =>
  `text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
    active
      ? "text-orange-500 border-b-2 border-orange-500 pb-px"
      : "text-neutral-700 hover:text-orange-500"
  }`;

/* ── Component ───────────────────────────────────────────────────────────── */
const Header = () => {
  const location = useLocation();
  const { cartCount } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false); // mobile accordion
  const [dropOpen, setDropOpen] = useState(false); // desktop dropdown
  const [cartOpen, setCartOpen] = useState(false);

  const dropRef = useRef(null);
  const leaveRef = useRef(null); // hover-leave debounce timer

  /* Close mobile menu + accordion on route change */
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  /* Close desktop dropdown on outside click / focus-out */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("focusin", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("focusin", handler);
    };
  }, []);

  /* Keyboard: Escape closes dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setDropOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* Helpers */
  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const isServiceActive = SERVICES.some((s) =>
    location.pathname.startsWith(s.path),
  );

  /* Desktop hover handlers with debounce so cursor can move into the panel */
  const onEnter = useCallback(() => {
    clearTimeout(leaveRef.current);
    setDropOpen(true);
  }, []);
  const onLeave = useCallback(() => {
    leaveRef.current = setTimeout(() => setDropOpen(false), 120);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50">
      {/* ── Announcement strip ─────────────────────────────────────────────── */}
      <div className="bg-neutral-900 text-white text-xs">
        <div className="container-custom flex items-center justify-between py-1.5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">
                Fast delivery across bangalore
              </span>
              <span className="sm:hidden">Fast delivery across bangalore </span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Invoice Included
            </span>
          </div>
          <a
            href={`tel:${WA}`}
            className="flex items-center gap-1.5 hover:text-orange-400 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="hidden md:inline">+91 81221 07464</span>
            <span className="md:hidden">Call</span>
          </a>
        </div>
      </div>

      {/* ── Main bar ───────────────────────────────────────────────────────── */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            aria-label="BuildMart — Home"
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-base leading-none select-none">
                BM
              </span>
            </div>
            <div className="hidden sm:block leading-none">
              <p className="font-display font-black text-lg text-neutral-900 leading-tight">
                BuildMart
              </p>
              <p className="text-[10px] text-neutral-400 font-medium tracking-wide">
                Premium Materials · Bangalore
              </p>
            </div>
          </Link>

          {/* ── Desktop nav ─────────────────────────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            role="navigation"
            aria-label="Primary navigation"
          >
            {/* Left plain links */}
            {NAV_LEFT.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 py-1 ${linkCls(isActive(item.path))}`}
              >
                {item.name}
              </Link>
            ))}

            {/* Services dropdown */}
            <div
              ref={dropRef}
              className="relative"
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              <button
                aria-haspopup="true"
                aria-expanded={dropOpen}
                aria-controls="services-dropdown"
                onClick={() => setDropOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${linkCls(isServiceActive)}`}
              >
                Services
                <Chevron open={dropOpen} />
              </button>

              {/* Dropdown panel */}
              <div
                id="services-dropdown"
                role="menu"
                aria-label="Services"
                className={`absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden transition-all duration-200 origin-top ${
                  dropOpen
                    ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
                    : "opacity-0 scale-95 pointer-events-none -translate-y-1"
                }`}
              >
                {/* Arrow tip */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-neutral-100 rotate-45"
                  aria-hidden="true"
                />

                <div className="p-2 pt-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-3 pb-2">
                    Our Services
                  </p>
                  {SERVICES.map((svc) => {
                    const active = location.pathname === svc.path;
                    return (
                      <Link
                        key={svc.path}
                        to={svc.path}
                        role="menuitem"
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${
                          active
                            ? "bg-orange-50 text-orange-600"
                            : "hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900"
                        }`}
                      >
                        <span
                          className="text-xl mt-0.5 shrink-0"
                          aria-hidden="true"
                        >
                          {svc.icon}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`font-bold text-sm leading-tight ${active ? "text-orange-600" : "text-neutral-900"}`}
                          >
                            {svc.name}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5 truncate">
                            {svc.desc}
                          </p>
                        </div>
                        {active && (
                          <div
                            className="ml-auto mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="bg-neutral-50 border-t border-neutral-100 px-4 py-2.5">
                  <p className="text-[11px] text-neutral-400">
                    Serving Bangalore & surrounding areas
                  </p>
                </div>
              </div>
            </div>

            {/* Right plain links */}
            {NAV_RIGHT.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 py-1 ${linkCls(isActive(item.path))}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* ── Right actions ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label={`Open cart — ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
            >
              <svg
                className="w-6 h-6 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-orange-400 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5 border-2 border-white"
                  aria-hidden="true"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Get Quote — desktop */}
            <Link
              to="/quote"
              aria-label="Get a free quote"
              className="hidden lg:inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>Get Free Quote</span>
            </Link>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────────────────── */}
        <div
          id="mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
            mobileOpen
              ? "max-h-[600px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col gap-0.5 py-3 border-t border-neutral-100">
            {/* Left plain links */}
            {NAV_LEFT.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  isActive(item.path)
                    ? "bg-orange-50 text-orange-600"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Services accordion */}
            <div>
              <button
                onClick={() => setServicesOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={servicesOpen}
                aria-controls="mobile-services"
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  isServiceActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span>Services</span>
                <Chevron open={servicesOpen} />
              </button>

              <div
                id="mobile-services"
                className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out ${
                  servicesOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l-2 border-neutral-100 pl-3">
                  {SERVICES.map((svc) => {
                    const active = location.pathname === svc.path;
                    return (
                      <Link
                        key={svc.path}
                        to={svc.path}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          active
                            ? "bg-orange-50 text-orange-600"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                        }`}
                      >
                        <span
                          className="text-base mt-0.5 shrink-0"
                          aria-hidden="true"
                        >
                          {svc.icon}
                        </span>
                        <div>
                          <p className="font-bold text-sm leading-tight">
                            {svc.name}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {svc.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right plain links */}
            {NAV_RIGHT.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  isActive(item.path)
                    ? "bg-orange-50 text-orange-600"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Get Quote CTA */}
            <Link
              to="/quote"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 rounded-xl"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Get Free Quote
            </Link>
          </nav>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Header;

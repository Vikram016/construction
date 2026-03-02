/**
 * Footer.jsx
 * Full site footer — all 3 service pages linked, WhatsApp CTA, call link,
 * quick nav, legal. Uses CONTACT_CONFIG as single source of truth.
 */

import { Link } from "react-router-dom";
import { CONTACT_CONFIG } from "../config/contactConfig";

/* ── Icons ──────────────────────────────────────────────────────────────── */
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

const PhoneIcon = () => (
  <svg
    className="w-4 h-4 shrink-0"
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
);

const MailIcon = () => (
  <svg
    className="w-4 h-4 shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const LocationIcon = () => (
  <svg
    className="w-4 h-4 shrink-0 mt-0.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

/* ── Nav link helper ─────────────────────────────────────────────────────── */
const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-neutral-400 hover:text-orange-400 text-sm transition-colors duration-200 inline-flex items-center gap-1.5"
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  const year = new Date().getFullYear();
  const { whatsapp, phone, phoneRaw, email, address, hours } = CONTACT_CONFIG;

  return (
    <footer className="bg-neutral-950 text-white" role="contentinfo">
      {/* ── CTA strip ─────────────────────────────────────────────────── */}
      <div className="bg-orange-500 py-5">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-black text-neutral-900 text-lg leading-tight">
              Ready to book a service?
            </p>
            <p className="text-neutral-800 text-sm">
              WhatsApp us now — we reply in under 5 minutes.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href={`https://wa.me/${whatsapp}?text=Hi! I'd like to book a BuildMart service in Bangalore.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-neutral-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-neutral-800 transition-colors"
            >
              <WAIcon /> WhatsApp
            </a>
            <a
              href={`tel:${phoneRaw}`}
              className="flex items-center gap-2 bg-white text-neutral-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-neutral-100 transition-colors"
            >
              <PhoneIcon /> Call Now
            </a>
          </div>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white font-black text-base">BM</span>
              </div>
              <div>
                <p className="font-black text-white text-xl leading-tight">
                  BuildMart
                </p>
                <p className="text-neutral-500 text-xs">
                  Premium Construction Materials
                </p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-5">
              Bangalore's trusted supplier for premium construction materials
              and site services. Trusted supplier. Fast delivery across
              bengaluru . Trusted by 5,000+ builders.
            </p>
            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${whatsapp}?text=Hi! I need construction materials in Bangalore.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
              <WAIcon /> Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black text-white text-base mb-5 uppercase tracking-widest text-xs text-neutral-500">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <FooterLink to="/">🏠 Home</FooterLink>
              <FooterLink to="/products">🛒 Products</FooterLink>
              <FooterLink to="/calculator">🧮 Cost Calculator</FooterLink>
              <FooterLink to="/blog">📰 Blog</FooterLink>
              <FooterLink to="/about">ℹ️ About Us</FooterLink>
              <FooterLink to="/contact">📞 Contact</FooterLink>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-xs text-neutral-500 mb-5">
              Services
            </h3>
            <ul className="space-y-2.5">
              <FooterLink to="/services/waste-sand">
                🏗️ Waste Sand Collection
              </FooterLink>
              <FooterLink to="/services/debris-sand">
                ♻️ Debris Sand Delivery
              </FooterLink>
              <FooterLink to="/services/site-clean">
                🧹 Site Cleaning
              </FooterLink>
            </ul>
            <div className="mt-6 pt-5 border-t border-neutral-800">
              <h3 className="font-black text-white uppercase tracking-widest text-xs text-neutral-500 mb-3">
                Materials
              </h3>
              <ul className="space-y-2.5">
                <FooterLink to="/products">🏗️ Cement</FooterLink>
                <FooterLink to="/products">🔩 Steel & TMT</FooterLink>
                <FooterLink to="/products">🧱 Bricks & Blocks</FooterLink>
                <FooterLink to="/products">⛏️ Sand & Aggregates</FooterLink>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-xs text-neutral-500 mb-5">
              Contact Us
            </h3>
            <ul className="space-y-3.5">
              <li>
                <a
                  href={`tel:${phoneRaw}`}
                  className="flex items-center gap-2.5 text-neutral-400 hover:text-orange-400 text-sm transition-colors"
                >
                  <PhoneIcon /> {phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-neutral-400 hover:text-[#25D366] text-sm transition-colors"
                >
                  <WAIcon /> WhatsApp Us
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email.sales}`}
                  className="flex items-center gap-2.5 text-neutral-400 hover:text-orange-400 text-sm transition-colors"
                >
                  <MailIcon /> {email.sales}
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2.5 text-neutral-400 text-sm">
                  <LocationIcon /> {address.full}
                </span>
              </li>
            </ul>

            {/* Hours */}
            <div className="mt-5 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">
                Business Hours
              </p>
              <p className="text-sm text-neutral-300">{hours.weekdays}</p>
              <p className="text-sm text-neutral-500">{hours.weekend}</p>
              <p className="text-xs text-orange-400 mt-1 font-semibold">
                {hours.emergency}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────── */}
      <div className="border-t border-neutral-800 py-5">
        <div className="container-custom flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-neutral-600">
          <p>
            © {year} BuildMart · {address.city}, {address.state},{" "}
            {address.country}. All rights reserved.
          </p>
          <p>
            Prices are estimates. Final pricing confirmed on WhatsApp or call.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

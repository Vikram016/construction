/**
 * ServiceLayout.jsx — Shared shell for all /services/* pages.
 *
 * Provides:
 *  • Full SEO head via PageSEO (title, description, OG, Twitter, JSON-LD schemas, geo)
 *  • Hero section — dark gradient, stat pills, breadcrumb, cross-links
 *  • 2-col body grid: main content slot | sticky sidebar (Quick Contact + Service Areas)
 *  • Mobile sticky action bar — WhatsApp + Call buttons pinned to viewport bottom
 *  • Desktop sidebar Quick Contact with WhatsApp (pre-filled) + Call buttons
 *  • Touch swipe-right + Alt+← keyboard back navigation
 *
 * Config object shape (all fields):
 *   seoKey          — key into PAGE_SEO (e.g. 'wasteSand')
 *   extraSchemas    — additional JSON-LD schemas to inject
 *   heroBg          — Tailwind bg class (e.g. 'bg-neutral-900')
 *   heroAccentColor — Tailwind text class for the accented word (e.g. 'text-orange-400')
 *   heroEmoji       — single emoji shown in badge
 *   heroBadge       — badge text inside hero pill
 *   heroTitle       — first line of H1 (plain)
 *   heroAccent      — second line of H1 (colored)
 *   heroDesc        — paragraph below H1
 *   stats           — [[value, label], …] — stat pills
 *   crossLinks      — [{to, label}, …] — subtle footer links
 *   sidebarTitle    — heading above benefits list
 *   benefits        — [[icon, text], …]
 *   serviceAreas    — string[]
 *   waMessage       — pre-filled WhatsApp text (service-specific)
 *   razorpayUrl     — payment link shown as CTA button in sidebar (optional)
 *   accentColor     — 'orange' | 'emerald' | 'blue' — sidebar CTA accent
 */

import { Link }            from 'react-router-dom';
import PageSEO             from './PageSEO';
import { PAGE_SEO, SITE, LOCAL_BUSINESS_SCHEMA } from '../config/seoConfig';
import { useNavigateBack } from '../hooks/useNavigateBack';
import { CONTACT_CONFIG }  from '../config/contactConfig';

/* ── Icons ──────────────────────────────────────────────────────────────── */
const WAIcon = ({ cls = 'w-5 h-5' }) => (
  <svg className={cls} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const PhoneIcon = ({ cls = 'w-5 h-5' }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);

const PayIcon = ({ cls = 'w-5 h-5' }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);

/* ── Accent colour map ───────────────────────────────────────────────────── */
const ACCENT_PAY = {
  orange:  'bg-orange-500 hover:bg-orange-600 text-neutral-900 border-neutral-900 shadow-[3px_3px_0_rgba(0,0,0,0.9)]',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-900 shadow-[3px_3px_0_#065f46]',
  blue:    'bg-blue-600 hover:bg-blue-700 text-white border-blue-900 shadow-[3px_3px_0_#1e3a8a]',
};

/* ── Component ───────────────────────────────────────────────────────────── */
const ServiceLayout = ({ config, children }) => {
  const {
    seoKey, extraSchemas,
    heroBg, heroAccentColor, heroEmoji, heroBadge,
    heroTitle, heroAccent, heroDesc, stats,
    sidebarTitle, benefits,
    crossLinks,
    serviceAreas,
    waMessage,
    razorpayUrl  = '',
    accentColor  = 'orange',
  } = config;

  const seoConfig   = PAGE_SEO[seoKey] || {};
  const schemas     = [LOCAL_BUSINESS_SCHEMA, ...(extraSchemas || [])];
  const breadcrumbs = [
    { name: 'Home',     url: `${SITE.url}/` },
    { name: 'Services', url: `${SITE.url}/services/` },
    { name: `${heroTitle} ${heroAccent}`, url: seoConfig.canonical || SITE.url },
  ];

  const { swipeHandlers } = useNavigateBack({ fallback: '/' });

  const waHref  = `https://wa.me/${CONTACT_CONFIG.whatsapp}?text=${encodeURIComponent(waMessage || 'Hi! I need help with a service booking.')}`;
  const telHref = `tel:${CONTACT_CONFIG.phoneRaw}`;
  const payCls  = ACCENT_PAY[accentColor] || ACCENT_PAY.orange;

  return (
    <>
      <PageSEO config={seoConfig} schemas={schemas} breadcrumbs={breadcrumbs}/>

      {/* ════════════════════════════════ HERO ════════════════════════════════ */}
      <section
        className={`relative ${heroBg} text-white overflow-hidden`}
        {...swipeHandlers}
        aria-label={`${heroTitle} ${heroAccent} service hero`}
      >
        {/* Dot texture */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize:'28px 28px' }}
          aria-hidden="true"/>
        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/50 pointer-events-none" aria-hidden="true"/>

        <div className="relative container-custom pt-10 pb-20 md:pt-14 md:pb-24">

          {/* Breadcrumb nav */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-white/40 font-medium flex-wrap">
              <li><Link to="/" className="hover:text-white/70 transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-white/20">›</li>
              <li><Link to="/services/waste-sand" className="hover:text-white/70 transition-colors text-white/60">Services</Link></li>
              <li aria-hidden="true" className="text-white/20">›</li>
              <li><span className="text-white/90" aria-current="page">{heroTitle} {heroAccent}</span></li>
            </ol>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              {/* Badge pill */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                <span aria-hidden="true">{heroEmoji}</span>
                {heroBadge || 'BuildMart Service'}
              </div>

              {/* H1 — one per page, provided by this layout */}
              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-5">
                {heroTitle}<br/>
                <span className={heroAccentColor}>{heroAccent}</span>
              </h1>

              <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-md">{heroDesc}</p>

              {/* Stat pills */}
              {stats?.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-8" role="list" aria-label="Service highlights">
                  {stats.map(([val, lbl]) => (
                    <div key={lbl} role="listitem"
                      className="bg-white/10 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                      <p className={`text-lg md:text-xl font-black ${heroAccentColor}`}>{val}</p>
                      <p className="text-xs text-white/50 font-semibold uppercase tracking-wide mt-0.5">{lbl}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hero CTA buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <a href={waHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg">
                  <WAIcon cls="w-4 h-4"/> Book on WhatsApp
                </a>
                <a href={telHref}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  <PhoneIcon cls="w-4 h-4"/> {CONTACT_CONFIG.phone}
                </a>
              </div>

              {/* Cross-links */}
              {crossLinks?.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {crossLinks.map(({ to, label }) => (
                    <Link key={to} to={to}
                      className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
                      {label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop hero panel */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hidden md:block">
              <h2 className="text-white font-black text-lg mb-4">{sidebarTitle || 'Why choose BuildMart'}</h2>
              {benefits?.length > 0 && (
                <ul className="space-y-3 mb-5">
                  {benefits.map(([icon, text]) => (
                    <li key={text} className="flex items-center gap-3 text-sm text-white/80">
                      <span aria-hidden="true">{icon}</span><span>{text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {serviceAreas?.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Serving</p>
                  <div className="flex flex-wrap gap-1.5">
                    {serviceAreas.slice(0, 8).map(city => (
                      <span key={city}
                        className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/10">
                        {city}
                      </span>
                    ))}
                    {serviceAreas.length > 8 && (
                      <span className="text-xs text-white/30 px-2 py-0.5">+{serviceAreas.length - 8} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1440 70" fill="none" preserveAspectRatio="none" className="w-full">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,20 L1440,70 L0,70 Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════ BODY ════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">

            {/* Main content slot */}
            <div>{children}</div>

            {/* Sticky sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-24" aria-label="Quick contact and service areas">

              {/* Quick Contact card */}
              <div className="bg-neutral-900 text-white rounded-2xl overflow-hidden border border-neutral-700">
                <div className="p-5 pb-4">
                  <h2 className="text-base font-black mb-1">📞 Quick Contact</h2>
                  <p className="text-xs text-neutral-400 mb-4">We reply in under 5 minutes</p>

                  {/* WhatsApp button */}
                  <a href={waHref} target="_blank" rel="noopener noreferrer"
                    aria-label="Book via WhatsApp"
                    className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-4 py-3 rounded-xl transition-colors mb-2.5 text-sm">
                    <WAIcon/> WhatsApp Booking
                  </a>

                  {/* Call button */}
                  <a href={telHref} aria-label={`Call us at ${CONTACT_CONFIG.phone}`}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl transition-colors mb-2.5 text-sm">
                    <PhoneIcon/> {CONTACT_CONFIG.phone}
                  </a>

                  {/* Payment link — only if razorpayUrl provided */}
                  {razorpayUrl && (
                    <a href={razorpayUrl} target="_blank" rel="noopener noreferrer"
                      aria-label="Pay advance online"
                      className={`flex items-center gap-3 font-bold px-4 py-3 rounded-xl border-2 transition-all text-sm ${payCls}`}>
                      <PayIcon cls="w-4 h-4"/> Pay Advance Online
                    </a>
                  )}
                </div>

                {/* Hours strip */}
                <div className="bg-neutral-800 px-5 py-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 font-semibold">
                    🕗 Mon–Sat 8 AM–7 PM &nbsp;·&nbsp; 24/7 WhatsApp
                  </p>
                </div>
              </div>

              {/* Service areas card */}
              {serviceAreas?.length > 0 && (
                <div className="bg-white border-2 border-neutral-200 rounded-2xl p-5">
                  <h2 className="text-sm font-black text-neutral-900 mb-3">📍 Service Areas</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {serviceAreas.map(city => (
                      <span key={city}
                        className="text-xs bg-neutral-100 text-neutral-700 font-semibold px-2.5 py-1 rounded-full border border-neutral-200">
                        {city}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-neutral-400">
                    Don't see your area?{' '}
                    <a href={waHref} target="_blank" rel="noopener noreferrer"
                      className="underline hover:text-neutral-600 font-medium">WhatsApp us.</a>
                  </p>
                </div>
              )}

              {/* Trust signals */}
              <div className="bg-white border-2 border-neutral-200 rounded-2xl p-5">
                <h2 className="text-sm font-black text-neutral-900 mb-3">🔒 Why trust BuildMart?</h2>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center gap-2"><span className="text-green-500 font-black">✓</span> GST invoice on every order</li>
                  <li className="flex items-center gap-2"><span className="text-green-500 font-black">✓</span> Advance via Razorpay (secured)</li>
                  <li className="flex items-center gap-2"><span className="text-green-500 font-black">✓</span> 5,000+ builders served</li>
                  <li className="flex items-center gap-2"><span className="text-green-500 font-black">✓</span> Refund if we can't fulfil</li>
                </ul>
              </div>

            </aside>
          </div>
        </div>
      </section>

      {/* ════════════════ MOBILE STICKY ACTION BAR ════════════════════════════ */}
      {/* Pinned to bottom of screen on mobile/tablet — hidden on lg+ (sidebar handles it) */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t-2 border-neutral-200 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        role="complementary"
        aria-label="Quick contact actions"
      >
        <div className="px-3 pt-2.5 pb-2 grid grid-cols-2 gap-2">
          {/* WhatsApp */}
          <a href={waHref} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform">
            <WAIcon cls="w-4 h-4"/> WhatsApp
          </a>

          {/* Call — or Pay if razorpayUrl exists */}
          {razorpayUrl ? (
            <a href={razorpayUrl} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform border-2 ${payCls}`}>
              <PayIcon cls="w-4 h-4"/> Pay Advance
            </a>
          ) : (
            <a href={telHref}
              className="flex items-center justify-center gap-2 bg-neutral-900 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform">
              <PhoneIcon cls="w-4 h-4"/> Call Now
            </a>
          )}
        </div>
        {/* iOS safe area spacer */}
        <div className="pb-safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}/>
      </div>

      {/* Spacer so page content isn't hidden under the sticky bar */}
      <div className="lg:hidden" style={{ height: '72px' }} aria-hidden="true"/>
    </>
  );
};

export default ServiceLayout;

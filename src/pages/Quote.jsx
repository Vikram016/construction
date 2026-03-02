/**
 * Quote.jsx — /quote
 * Dedicated quotation request page
 */

import { Helmet } from "react-helmet-async";
import { SITE, GEO } from "../config/seoConfig";
import QuoteForm from "../components/QuoteForm";
import { CONTACT_CONFIG } from "../config/contactConfig";

const Quote = () => {
  return (
    <>
      <Helmet>
        <title>Get Free Quote — BuildMart Bangalore</title>
        <meta
          name="description"
          content="Get a free building materials quote in Bangalore. M-Sand, Bricks, Cement, Blocks delivered to your site. WhatsApp quote within 2 hours."
        />
        <link rel="canonical" href={SITE.url + "/quote"} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gray-900 text-white py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
              Free · No Commitment · Reply in 2 Hours
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
              Get Your Free
              <br />
              <span className="text-orange-400">Building Materials Quote</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Tell us what you need — we'll WhatsApp you the best price with
              delivery details
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Form — takes 3 cols */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <QuoteForm />
            </div>

            {/* Info panel — takes 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              {/* How it works */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-black text-gray-900 mb-4">How it works</h3>
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      icon: "📝",
                      title: "Fill the form",
                      sub: "Tell us what you need and where to deliver",
                    },
                    {
                      step: "2",
                      icon: "⚡",
                      title: "Instant confirmation",
                      sub: "You get a WhatsApp confirmation immediately",
                    },
                    {
                      step: "3",
                      icon: "📞",
                      title: "We call you",
                      sub: "Our team calls within 2 hours with exact pricing",
                    },
                    {
                      step: "4",
                      icon: "🚚",
                      title: "Materials delivered",
                      sub: "Order confirmed, delivered within 24–48 hours",
                    },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-3">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                        {s.step}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {s.icon} {s.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why BuildMart */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                <h3 className="font-black text-gray-900 mb-3">
                  Why BuildMart?
                </h3>
                <ul className="space-y-2">
                  {[
                    "✅ Best market prices in Bangalore",
                    "✅ Quality checked every batch",
                    "✅ Accurate load weights",
                    "✅ Delivery within 24–48 hours",
                    "✅ Trusted by 500+ builders",
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-sm text-gray-700 font-medium"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct contact */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Or contact directly
                </p>
                <a
                  href={`https://wa.me/${CONTACT_CONFIG.whatsapp}?text=Hi! I need a quote for building materials.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm mb-2"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp Us Now
                </a>
                <a
                  href={`tel:${CONTACT_CONFIG.phoneRaw}`}
                  className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-3 rounded-xl transition-colors text-sm"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
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
                  {CONTACT_CONFIG.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Quote;

import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';

  return (
    <footer className="bg-construction-darkGray text-white mt-12 sm:mt-20">
      <div className="diagonal-pattern py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl sm:text-2xl font-display text-construction-yellow mb-3 sm:mb-4">
                BUILDMART
              </h3>
              <p className="text-xs sm:text-sm text-construction-lightGray leading-relaxed">
                Your trusted partner for quality construction materials.
                Fast delivery, competitive prices, GST billing available.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-base sm:text-lg mb-3 sm:mb-4 text-construction-yellow">
                QUICK LINKS
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-xs sm:text-sm hover:text-construction-yellow transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-xs sm:text-sm hover:text-construction-yellow transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-xs sm:text-sm hover:text-construction-yellow transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-xs sm:text-sm hover:text-construction-yellow transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-display text-base sm:text-lg mb-3 sm:mb-4 text-construction-yellow">
                CATEGORIES
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-construction-lightGray">
                <li>Cement</li>
                <li>Steel & TMT Bars</li>
                <li>Bricks</li>
                <li>Sand & Aggregates</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-display text-base sm:text-lg mb-3 sm:mb-4 text-construction-yellow">
                CONTACT US
              </h4>
              <div className="space-y-3">
                <a
                  href={`tel:${whatsappNumber}`}
                  className="flex items-center space-x-2 text-xs sm:text-sm hover:text-construction-yellow transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call Now</span>
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-xs sm:text-sm hover:text-construction-yellow transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-construction-mediumGray py-4 sm:py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] sm:text-xs md:text-sm text-construction-lightGray">
            © {currentYear} BuildMart. All rights reserved. | Prices are estimates. Final pricing confirmed on WhatsApp.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from "react-router-dom";

const Header = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210";

  return (
    <header className="bg-construction-darkGray text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-construction-yellow flex items-center justify-center transform -skew-x-12">
              <span className="text-construction-darkGray font-display text-base sm:text-xl skew-x-12">
                BM
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display text-construction-yellow leading-none">
                BUILDMART
              </h1>
              <p className="text-[8px] sm:text-xs tracking-widest text-construction-lightGray hidden xs:block">
                CONSTRUCTION MATERIALS
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link
              to="/"
              className="hover:text-construction-yellow focus:outline-none focus:ring-2 focus:ring-construction-yellow transition-colors font-bold uppercase tracking-wide text-sm lg:text-base cursor-pointer"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="hover:text-construction-yellow focus:outline-none focus:ring-2 focus:ring-construction-yellow transition-colors font-bold uppercase tracking-wide text-sm lg:text-base cursor-pointer"
            >
              Products
            </Link>
            <Link
              to="/contact"
              className="hover:text-construction-yellow focus:outline-none focus:ring-2 focus:ring-construction-yellow transition-colors font-bold uppercase tracking-wide text-sm lg:text-base cursor-pointer"
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 lg:px-4 py-2 rounded transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="font-bold text-xs lg:text-sm">WhatsApp</span>
            </a>
            <a
              href={`tel:${whatsappNumber}`}
              className="bg-construction-yellow text-construction-darkGray px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold rounded hover:bg-construction-orange hover:text-white transition-colors text-xs sm:text-sm"
            >
              CALL
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-construction-mediumGray">
        <nav className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex justify-around">
          <Link
            to="/"
            className="text-xs sm:text-sm font-bold uppercase hover:text-construction-yellow focus:outline-none focus:ring-2 focus:ring-construction-yellow transition-colors cursor-pointer py-2 px-2"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold uppercase hover:text-construction-yellow focus:outline-none focus:ring-2 focus:ring-construction-yellow transition-colors cursor-pointer py-2 px-2"
          >
            Products
          </Link>
          <Link
            to="/contact"
            className="text-xs sm:text-sm font-bold uppercase hover:text-construction-yellow focus:outline-none focus:ring-2 focus:ring-construction-yellow transition-colors cursor-pointer py-2 px-2"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

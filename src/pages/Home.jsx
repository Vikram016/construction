import { Link } from 'react-router-dom';
import { productsData } from '../data/products';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const featuredProducts = productsData.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-construction-darkGray text-white overflow-hidden">
        <div className="diagonal-pattern absolute inset-0 opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in">
              <div className="inline-block bg-construction-yellow text-construction-darkGray px-4 py-1 font-bold text-sm uppercase mb-4">
                Premium Quality Materials
              </div>
              <h1 className="font-display text-5xl md:text-7xl mb-6 leading-tight">
                BUILD YOUR
                <br />
                <span className="text-construction-yellow">DREAMS</span>
              </h1>
              <p className="text-xl mb-8 text-construction-lightGray max-w-lg">
                Cement, Steel, Bricks, Sand & Aggregates delivered to your doorstep. 
                Transparent pricing with GST billing. Distance-based transport calculated instantly.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary">
                  Browse Products
                </Link>
                <a 
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>Quick Order</span>
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-8 -right-8 w-64 h-64 bg-construction-yellow opacity-20 transform rotate-12"></div>
                <div className="relative bg-construction-mediumGray p-8 transform -rotate-2 shadow-2xl">
                  <div className="bg-white p-6 transform rotate-2">
                    <div className="text-construction-darkGray">
                      <div className="text-sm font-bold uppercase mb-2">Why Choose Us?</div>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <span className="text-construction-yellow text-xl">✓</span>
                          <span className="text-sm">Transparent distance-based pricing</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-construction-yellow text-xl">✓</span>
                          <span className="text-sm">GST billing available</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-construction-yellow text-xl">✓</span>
                          <span className="text-sm">Quick WhatsApp ordering</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-construction-yellow text-xl">✓</span>
                          <span className="text-sm">Premium quality materials</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-construction-yellow mx-auto mb-4 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <svg className="w-10 h-10 text-construction-darkGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl mb-2">INSTANT QUOTES</h3>
              <p className="text-construction-mediumGray">
                Enter your location, get transport cost calculated automatically
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-construction-yellow mx-auto mb-4 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <svg className="w-10 h-10 text-construction-darkGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl mb-2">GST BILLING</h3>
              <p className="text-construction-mediumGray">
                Proper tax invoices for all your business needs
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-construction-yellow mx-auto mb-4 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <svg className="w-10 h-10 text-construction-darkGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl mb-2">FAST DELIVERY</h3>
              <p className="text-construction-mediumGray">
                Quick dispatch with reliable transport partners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 industrial-grid">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl mb-4">
              FEATURED <span className="text-construction-yellow">PRODUCTS</span>
            </h2>
            <p className="text-construction-mediumGray max-w-2xl mx-auto">
              Browse our selection of premium construction materials with transparent pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/products" className="btn-primary inline-block">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-construction-darkGray text-white">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-12">
            HOW IT <span className="text-construction-yellow">WORKS</span>
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-construction-yellow text-construction-darkGray rounded-full flex items-center justify-center text-3xl font-display mx-auto mb-4">
                1
              </div>
              <h3 className="font-display text-xl mb-2">SELECT PRODUCT</h3>
              <p className="text-sm text-construction-lightGray">
                Choose from cement, steel, bricks, or aggregates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-construction-yellow text-construction-darkGray rounded-full flex items-center justify-center text-3xl font-display mx-auto mb-4">
                2
              </div>
              <h3 className="font-display text-xl mb-2">ENTER LOCATION</h3>
              <p className="text-sm text-construction-lightGray">
                Add delivery address, we calculate distance automatically
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-construction-yellow text-construction-darkGray rounded-full flex items-center justify-center text-3xl font-display mx-auto mb-4">
                3
              </div>
              <h3 className="font-display text-xl mb-2">GET QUOTE</h3>
              <p className="text-sm text-construction-lightGray">
                See material cost, GST, and transport charges instantly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-construction-yellow text-construction-darkGray rounded-full flex items-center justify-center text-3xl font-display mx-auto mb-4">
                4
              </div>
              <h3 className="font-display text-xl mb-2">ORDER ON WHATSAPP</h3>
              <p className="text-sm text-construction-lightGray">
                Confirm order via WhatsApp, pay after price confirmation
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

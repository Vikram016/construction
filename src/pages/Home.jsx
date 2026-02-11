import { Link } from 'react-router-dom';
import { productsData } from '../data/products';

const Home = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const categories = [
    { name: 'Cement', icon: '🏗️', count: 2, path: '/products?category=Cement' },
    { name: 'Steel & TMT', icon: '⚒️', count: 3, path: '/products?category=Steel' },
    { name: 'Bricks', icon: '🧱', count: 2, path: '/products?category=Bricks' },
    { name: 'Sand & Aggregates', icon: '⛰️', count: 3, path: '/products?category=Sand & Aggregates' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - Clean & Simple */}
      <section className="bg-gradient-to-br from-neutral-50 to-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Premium Construction Materials
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Quality cement, steel, bricks & aggregates delivered to your doorstep. 
              GST invoiced. Transparent pricing. Fast delivery.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/products" className="btn-primary text-lg">
                Browse Products
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi! I need construction materials. Please share pricing.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Get Quote on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-neutral-200 py-6 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-1">500+</div>
              <div className="text-sm text-neutral-600">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-1">24-48h</div>
              <div className="text-sm text-neutral-600">Fast Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-1">100%</div>
              <div className="text-sm text-neutral-600">GST Invoiced</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-1">10+</div>
              <div className="text-sm text-neutral-600">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Browse our wide range of premium construction materials
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="group bg-white border border-neutral-200 rounded-lg p-6 hover:border-primary-500 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-500 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-neutral-500">{category.count} Products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Popular Products
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Best selling construction materials with competitive pricing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsData.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="aspect-square bg-neutral-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs text-primary-500 font-medium mb-1 uppercase">
                    {product.category}
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-primary-500 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-neutral-500">Starting from</div>
                      <div className="text-xl font-bold text-neutral-900">
                        ₹{product.basePrice}
                        <span className="text-sm font-normal text-neutral-500">/{product.unit}</span>
                      </div>
                    </div>
                    <div className="badge-success text-xs">In Stock</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products" className="btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Enquiry Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Need a Custom Quote?
              </h2>
              <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
                Contact us on WhatsApp for bulk orders, custom requirements, or any queries. 
                Our team will respond within minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hi! I need a quote for construction materials.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp text-lg justify-center"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${whatsappNumber}`}
                  className="btn-outline text-lg justify-center inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-12 border-t border-neutral-200">
        <div className="container-custom">
          <h3 className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-8">
            Authorized Dealer Of
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {['ACC', 'ULTRATECH', 'AMBUJA', 'JSW', 'TATA', 'BIRLA'].map((brand) => (
              <div key={brand} className="text-center">
                <div className="text-2xl font-bold text-neutral-400 hover:text-neutral-600 transition-colors">
                  {brand}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

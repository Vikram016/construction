import { useState } from 'react';
import { productsData } from '../data/products';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Cement', 'Steel', 'Bricks', 'Sand & Aggregates'];

  const filteredProducts = selectedCategory === 'All' 
    ? productsData 
    : productsData.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-neutral-50 to-white py-12 border-b border-neutral-200">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Our Products
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Premium construction materials with transparent pricing and instant quotes
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-neutral-200 sticky top-16 z-40">
        <div className="container-custom py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container-custom">
          <div className="mb-6">
            <p className="text-neutral-600">
              Showing <span className="font-semibold text-neutral-900">{filteredProducts.length}</span> products
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-neutral-500">No products found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-neutral-50 border-t border-neutral-200">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Can't Find What You Need?
          </h2>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
            Contact us directly on WhatsApp for custom requirements, bulk orders, or any queries
          </p>
          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}?text=Hi! I need construction materials. Please share pricing.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp inline-flex text-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Contact on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default Products;

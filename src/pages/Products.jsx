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
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-construction-darkGray text-white py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">
            OUR <span className="text-construction-yellow">PRODUCTS</span>
          </h1>
          <p className="text-sm sm:text-base text-construction-lightGray max-w-2xl">
            Premium construction materials with transparent pricing and instant quotes
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b-4 border-construction-yellow sticky top-16 sm:top-20 z-40 shadow-md">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 font-bold uppercase tracking-wider transition-all text-xs sm:text-sm ${selectedCategory === category
                  ? 'bg-construction-yellow text-construction-darkGray'
                  : 'bg-construction-lightGray text-construction-mediumGray hover:bg-construction-mediumGray hover:text-white'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 sm:py-10 md:py-12 industrial-grid">
        <div className="container mx-auto px-4">
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-construction-mediumGray">
              Showing <span className="font-bold text-construction-darkGray">{filteredProducts.length}</span> products
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <p className="text-lg sm:text-xl md:text-2xl text-construction-mediumGray">No products found in this category</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-construction-yellow py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-construction-darkGray mb-3 sm:mb-4">
            CAN'T FIND WHAT YOU NEED?
          </h2>
          <p className="text-sm sm:text-base text-construction-darkGray mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
            Contact us directly on WhatsApp for custom requirements, bulk orders, or any queries
          </p>
          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>Contact on WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Products;

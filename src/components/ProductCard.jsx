/**
 * ProductCard.jsx
 *
 * Bug fixes:
 * 1. Image resolution: checks images[0].url (Cloudinary/Firestore) → imageUrl → image
 *    Prevents broken <img> when product comes from Firestore vs static data.
 * 2. Added Add-to-Cart button with brief "Added!" confirmation so users
 *    don't have to enter the detail page just to add items.
 * 3. Uses basePrice (not price) consistently.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/** Resolve the best available image URL from any product shape */
const resolveImage = (product) => {
  if (product.images?.length > 0 && product.images[0].url) return product.images[0].url;
  if (product.imageUrl) return product.imageUrl;
  if (product.image)    return product.image;
  return null;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const imageSrc = resolveImage(product);

  const handleAddToCart = (e) => {
    e.preventDefault();   // don't follow the Link
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary-300 transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="aspect-square bg-neutral-100 overflow-hidden relative">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* GST badge */}
        {product.gstPercentage && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
            GST {product.gstPercentage}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-primary-500 font-semibold mb-1 uppercase tracking-wide">
          {product.category}
        </div>
        <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1 text-base">
          {product.name}
        </h3>
        <p className="text-sm text-neutral-500 mb-3 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs text-neutral-400">Starting from</div>
            <div className="text-xl font-black text-neutral-900">
              ₹{(product.basePrice || product.price || 0).toLocaleString()}
              <span className="text-sm font-normal text-neutral-500"> /{product.unit}</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-success-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            In Stock
          </span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`
            w-full py-2.5 rounded-lg font-bold text-sm transition-all duration-200 border-2
            flex items-center justify-center gap-2
            ${added
              ? 'bg-green-500 border-green-500 text-white scale-95'
              : 'bg-white border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
            }
          `}
        >
          {added ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;

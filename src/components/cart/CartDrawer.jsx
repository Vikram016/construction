import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { openWhatsAppCheckout } from '../../utils/whatsapp';
import { CartThumbnail } from '../CloudinaryImage';

const resolveImageSrc = (item) => {
  if (item.images && item.images.length > 0 && item.images[0].url) return item.images[0].url;
  if (item.imageUrl) return item.imageUrl;
  return item.image || null;
};

/**
 * Cart Drawer Component
 * Slide-in cart sidebar accessible from navbar
 * Shows cart items, quantities, and checkout options
 */
const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    subtotal,
    gst,
    grandTotal,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  // Close drawer on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  /**
   * Handle WhatsApp Checkout
   * Opens WhatsApp with full cart details
   */
  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    openWhatsAppCheckout(cartItems, grandTotal);
    onClose();
  };

  /**
   * Navigate to cart page
   */
  const goToCartPage = () => {
    navigate('/cart');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-neutral-900 bg-construction-yellow">
          <h2 className="text-xl font-black uppercase">
            Cart ({cartCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-900 hover:text-white rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-neutral-600 mb-6">Your cart is empty</p>
              <button
                onClick={() => {
                  navigate('/products');
                  onClose();
                }}
                className="btn-primary"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-neutral-50 border-2 border-neutral-200 p-3 rounded-lg">
                  <div className="flex gap-3 mb-3">
                    {/* Product thumbnail */}
                    <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-200 border border-neutral-200">
                      <CartThumbnail
                        src={resolveImageSrc(item)}
                        alt={item.name}
                        fallback=""
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-1">
                          <h3 className="font-bold text-neutral-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                          <p className="text-xs text-neutral-500 mt-0.5">{item.category}</p>
                          <p className="text-xs font-semibold text-primary-600 mt-0.5">
                            ₹{item.basePrice?.toLocaleString()} / {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-neutral-200 hover:bg-neutral-300 rounded font-bold transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-neutral-200 hover:bg-neutral-300 rounded font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600">Total</p>
                      <p className="font-bold text-neutral-900">
                        ₹{(item.basePrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              {cartItems.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear all items from cart?')) {
                      clearCart();
                    }
                  }}
                  className="w-full text-sm text-red-600 hover:text-red-800 py-2"
                >
                  Clear Cart
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer - Totals & Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t-3 border-neutral-900 p-4 bg-neutral-50">
            {/* Price Breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">GST (18%)</span>
                <span className="font-semibold">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 border-neutral-300 pt-2">
                <span>Total</span>
                <span className="text-primary-600">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3 px-4 rounded-lg border-2 border-neutral-900 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Checkout on WhatsApp
              </button>
              
              <button
                onClick={goToCartPage}
                className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-bold py-3 px-4 rounded-lg border-2 border-neutral-900 transition-all"
              >
                View Full Cart
              </button>
            </div>

            <p className="text-xs text-neutral-500 text-center mt-3">
              Delivery charges calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

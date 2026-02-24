import { useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { openWhatsApp } from '../utils/whatsapp';
import { useNavigateBack } from '../hooks/useNavigateBack';
import QuantitySelector from '../components/QuantitySelector';
import OrderSummary from '../components/OrderSummary';
import DeliveryCalculator from '../components/DeliveryCalculator';

/* shared WhatsApp icon */
const WAIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

/* reusable back button */
const BackBtn = ({ goBack, hasHistory }) => (
  <button
    onClick={goBack}
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-500 px-3 py-2 rounded-lg transition-all active:scale-95"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
    </svg>
    {hasHistory ? 'Back' : 'Shop More'}
  </button>
);

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount, subtotal, gst, grandTotal } = useCart();
  const navigate  = useNavigate();
  const { goBack, hasHistory } = useNavigateBack({ fallback: '/products' });

  const cartTotals = useMemo(() => ({ subtotal, gst, grandTotal }), [subtotal, gst, grandTotal]);

  const handleGetQuotation = useCallback(() => {
    if (!cartItems.length) return;
    let message = `Hello! I want to get a quotation for the following items:\n\n🛒 *Order Details:*\n\n`;
    cartItems.forEach((item, i) => {
      message += `${i + 1}️⃣ *${item.name}*\n`;
      message += `   📦 Quantity: ${item.quantity} ${item.unit}\n`;
      message += `   💰 Price: ₹${item.basePrice.toLocaleString()} per ${item.unit}\n`;
      message += `   💵 Subtotal: ₹${(item.basePrice * item.quantity).toLocaleString()}\n\n`;
    });
    message += `───────────────────\n📊 *Summary:*\n`;
    message += `Subtotal: ₹${cartTotals.subtotal.toLocaleString()}\n`;
    message += `GST (18%): ₹${cartTotals.gst.toLocaleString()}\n`;
    message += `*Total: ₹${cartTotals.grandTotal.toLocaleString()}*\n\n`;
    message += `Please confirm availability and delivery details.`;
    openWhatsApp({ customMessage: message });
  }, [cartItems, cartTotals]);

  const handleProceedToPayment = useCallback(() => navigate('/checkout'), [navigate]);

  /* ── Empty state ── */
  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-neutral-50 py-20">
        <div className="container-custom max-w-2xl mx-auto">
          <div className="mb-6">
            <BackBtn goBack={goBack} hasHistory={hasHistory} />
          </div>
          <div className="bg-white border-3 border-neutral-900 p-12 construction-shadow text-center">
            <svg className="w-24 h-24 mx-auto text-neutral-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h2 className="text-3xl font-black text-neutral-900 mb-4 uppercase tracking-wider">
              Your Cart is Empty
            </h2>
            <p className="text-neutral-600 mb-8">Add construction materials to get started</p>
            <Link to="/products" className="inline-block bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-bold py-3 px-8 border-3 border-neutral-900 uppercase tracking-wider transition-all">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-12">
      <div className="container-custom">

        {/* ── Header row with Back ── */}
        <div className="mb-6 md:mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-900 uppercase tracking-wider mb-1">
              Shopping Cart
            </h1>
            <p className="text-neutral-600">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <BackBtn goBack={goBack} hasHistory={hasHistory} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ── Cart items ── */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const img = item.images?.[0]?.url || item.imageUrl || item.image;
              return (
                <div key={item.id} className="bg-white border-3 border-neutral-900 p-6 construction-shadow animate-fade-in">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 h-32 flex-shrink-0 bg-neutral-100 border-3 border-neutral-900">
                      {img
                        ? <img src={img} alt={item.name} className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center text-4xl text-neutral-300">📦</div>
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="inline-block bg-construction-yellow text-neutral-900 text-xs font-bold px-3 py-1 border-2 border-neutral-900 uppercase mb-2">
                            {item.category}
                          </span>
                          <h3 className="text-xl font-bold text-neutral-900">{item.name}</h3>
                          <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 border-2 border-transparent hover:border-red-600 transition-all"
                          aria-label="Remove item"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-neutral-600 mb-1">Price per {item.unit}</p>
                          <p className="text-2xl font-black text-construction-yellow">
                            ₹{item.basePrice.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 mb-2">Quantity</p>
                          <QuantitySelector
                            quantity={item.quantity}
                            onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                            onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                            min={1}
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-neutral-600 mb-1">Item Total</p>
                          <p className="text-2xl font-black text-neutral-900">
                            ₹{(item.basePrice * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link to="/products" className="inline-flex items-center gap-2 text-construction-yellow hover:text-construction-orange font-bold uppercase tracking-wider transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-1">
            {/* Mobile: flat, Desktop: sticky */}
            <div className="lg:sticky lg:top-24 space-y-4">
              <DeliveryCalculator />
              <OrderSummary />
              <div className="space-y-3">
                <button
                  onClick={handleProceedToPayment}
                  className="block w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-black py-4 px-6 text-center border-3 border-neutral-900 uppercase tracking-wider transition-all hover:translate-x-0.5 hover:translate-y-0.5 construction-shadow text-lg"
                >
                  Proceed to Checkout →
                </button>
                <button
                  onClick={handleGetQuotation}
                  disabled={!cartItems.length}
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3 px-6 border-3 border-neutral-900 uppercase tracking-wider transition-all construction-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <WAIcon />
                  WhatsApp Quote Instead
                </button>
                <p className="text-xs text-neutral-500 text-center">
                  🔒 Razorpay secured · GST invoice included
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;

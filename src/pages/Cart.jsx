/**
 * Cart.jsx — Full cart page with table layout, qty controls, order summary
 */
import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { openWhatsApp } from '../utils/whatsapp';
import { useNavigateBack } from '../hooks/useNavigateBack';

const WAIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>);

/* Inline qty control */
const InlineQty = ({ quantity, onIncrease, onDecrease }) => (
  <div className="inline-flex items-center border-2 border-neutral-900 bg-white overflow-hidden">
    <button onClick={onDecrease} disabled={quantity<=1}
      className="w-8 h-8 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 font-bold text-lg transition-colors border-r border-neutral-200">−</button>
    <span className="w-10 text-center font-black text-neutral-900 text-sm">{quantity}</span>
    <button onClick={onIncrease}
      className="w-8 h-8 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 font-bold text-lg transition-colors border-l border-neutral-200">+</button>
  </div>
);

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount, clearCart, subtotal, deliveryCharge, grandTotal } = useCart();
  const navigate = useNavigate();
  const { goBack, hasHistory } = useNavigateBack({ fallback: '/products' });

  const handleWhatsAppQuote = useCallback(() => {
    if (!cartItems.length) return;
    let msg = '🏗️ *Order Quote — BuildMart*\n\n🛒 *Items:*\n';
    cartItems.forEach((item, i) => {
      msg += `${i+1}. ${item.name} ×${item.quantity} ${item.unit} = ₹${(item.basePrice*item.quantity).toLocaleString()}\n`;
    });
    msg += `\n📊 Subtotal: ₹${subtotal.toLocaleString()}`;
    msg += `\n*Grand Total: ₹${grandTotal.toLocaleString()}*`;
    msg += '\n\nPlease confirm availability and delivery details. Thank you!';
    openWhatsApp({ customMessage: msg });
  }, [cartItems, subtotal, grandTotal]);

  /* Empty state */
  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-neutral-50 py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white border-3 border-neutral-900 p-12 construction-shadow">
            <svg className="w-20 h-20 mx-auto text-neutral-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h2 className="text-3xl font-black text-neutral-900 uppercase mb-3">Cart is Empty</h2>
            <p className="text-neutral-500 mb-8">Add products from the price list to get started</p>
            <Link to="/products" className="inline-block bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-black py-3 px-8 border-3 border-neutral-900 uppercase tracking-wider transition-all">
              Browse Products →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-12">
      <div className="container-custom">

        {/* Page title */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase tracking-wider mb-1">Shopping Cart</h1>
            <p className="text-neutral-500 text-sm">{cartCount} {cartCount===1?'item':'items'} · ₹{subtotal.toLocaleString()} subtotal</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => goBack()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-300 px-3 py-2 rounded-lg transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              {hasHistory ? 'Back' : 'Shop More'}
            </button>
            <button onClick={clearCart} className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-800 bg-white border border-red-200 hover:border-red-400 px-3 py-2 rounded-lg transition-all">
              <TrashIcon/> Clear Cart
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border-3 border-neutral-900 construction-shadow overflow-hidden">

              {/* Table header */}
              <div className="hidden md:grid grid-cols-[2fr_90px_130px_100px_40px] gap-4 px-6 py-3 bg-neutral-900 text-white text-xs font-black uppercase tracking-wider">
                <span>Product Name</span>
                <span className="text-right">Unit Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Subtotal</span>
                <span/>
              </div>

              {/* Rows */}
              <div className="divide-y-2 divide-neutral-100">
                {cartItems.map(item => {
                  const img = item.images?.[0]?.url || item.imageUrl || item.image;
                  const rowTotal = item.basePrice * item.quantity;
                  return (
                    <div key={item.id}>

                      {/* Mobile */}
                      <div className="flex gap-3 p-4 md:hidden">
                        <div className="w-14 h-14 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                          {img ? <img src={img} alt={item.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-orange-600 uppercase">{item.category}</p>
                              <p className="font-bold text-neutral-900 text-sm">{item.name}</p>
                              <p className="text-xs text-neutral-500">₹{item.basePrice.toLocaleString()} per {item.unit}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1 -mt-0.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <InlineQty quantity={item.quantity} onIncrease={() => updateQuantity(item.id, item.quantity+1)} onDecrease={() => updateQuantity(item.id, item.quantity-1)}/>
                            <p className="text-base font-black text-neutral-900">₹{rowTotal.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className="hidden md:grid grid-cols-[2fr_90px_130px_100px_40px] gap-4 items-center px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 flex-shrink-0 bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden">
                            {img ? <img src={img} alt={item.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-orange-600 uppercase leading-tight">{item.category}</p>
                            <p className="font-bold text-neutral-900 text-sm truncate">{item.name}</p>
                            <p className="text-xs text-neutral-400">per {item.unit}</p>
                          </div>
                        </div>
                        <p className="text-right font-black text-neutral-900">₹{item.basePrice.toLocaleString()}</p>
                        <div className="flex justify-center">
                          <InlineQty quantity={item.quantity} onIncrease={() => updateQuantity(item.id, item.quantity+1)} onDecrease={() => updateQuantity(item.id, item.quantity-1)}/>
                        </div>
                        <p className="text-right font-black text-neutral-900 text-lg">₹{rowTotal.toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 justify-self-center transition-colors">
                          <TrashIcon/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-neutral-50 border-t-2 border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
                <Link to="/products" className="inline-flex items-center gap-2 text-construction-yellow hover:text-construction-orange font-bold uppercase tracking-wider transition-colors text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                  Continue Shopping
                </Link>
                <button onClick={clearCart} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">
                  Remove All Items
                </button>
              </div>
            </div>
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">

              <div className="bg-white border-3 border-neutral-900 construction-shadow p-6">
                <h3 className="text-xl font-black text-neutral-900 uppercase tracking-wider mb-5">Order Summary</h3>

                {/* Item list */}
                <div className="space-y-2 mb-5 pb-4 border-b-2 border-neutral-100">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-sm gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-neutral-900 font-semibold truncate">{item.name}</p>
                        <p className="text-neutral-400 text-xs">{item.quantity} × ₹{item.basePrice.toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-neutral-900 flex-shrink-0">₹{(item.basePrice*item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Delivery Charge</span>
                    <span className="font-semibold">{deliveryCharge > 0 ? '₹'+deliveryCharge.toLocaleString() : 'Calculated at checkout'}</span>
                  </div>
                  <div className="pt-3 border-t-2 border-construction-yellow flex justify-between items-center">
                    <span className="font-black text-neutral-900 uppercase text-base">Total Amount</span>
                    <span className="text-2xl font-black text-construction-yellow">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg text-sm">
                  <p className="font-bold text-green-800">🚚 Delivery within 24–48 hours</p>
                  <p className="text-green-700 text-xs mt-0.5">After order confirmation call</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button onClick={() => navigate('/checkout')}
                  className="block w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-black py-4 text-center border-3 border-neutral-900 uppercase tracking-wider transition-all hover:translate-x-0.5 hover:translate-y-0.5 construction-shadow text-base">
                  Continue to Checkout →
                </button>
                <button onClick={handleWhatsAppQuote}
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3 border-3 border-neutral-900 uppercase tracking-wider transition-all construction-shadow">
                  <WAIcon/> WhatsApp Quote Instead
                </button>
                <p className="text-xs text-neutral-400 text-center">🔒 Secure checkout · Invoice on every order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

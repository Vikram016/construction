// src/pages/ProductDetail.jsx
// Optimized ProductDetail with:
// ✓ Loading skeleton
// ✓ Lazy image loading
// ✓ Advanced quantity input (desktop keyboard + mobile numeric)
// ✓ Live price calculation (memoized)
// ✓ Responsive UI (320px - 1440px+)
// ✓ Sticky card on desktop
// ✓ Touch-friendly buttons

import { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNavigateBack } from '../hooks/useNavigateBack';
import { Helmet } from 'react-helmet-async';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { openWhatsApp } from '../utils/whatsapp';
import { CONTACT_CONFIG } from '../config/contactConfig';
import { generatePaymentLink } from '../services/productService';

/* ─── WhatsApp Icon ──────────────────────────────────────────────────────── */
const WAIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

/* ─── Loading Skeleton ───────────────────────────────────────────────────── */
const LoadingSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div className="space-y-6">
        <div className="bg-neutral-200 rounded-2xl h-96 animate-pulse" />
        <div className="bg-neutral-200 rounded-2xl h-64 animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="bg-neutral-200 rounded-2xl h-80 animate-pulse" />
        <div className="bg-neutral-200 rounded-2xl h-48 animate-pulse" />
      </div>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading } = useProduct(id);
  const { addToCart } = useCart();

  /* ── Advanced Quantity State ── */
  const [qty, setQty] = useState(1);
  const [qtyInput, setQtyInput] = useState('1');
  const [qtyFocused, setQtyFocused] = useState(false);
  const maxStock = product?.stock ?? 9999;

  /* ── Quantity handlers with validation ── */
  const validateAndSetQty = useCallback((value) => {
    const num = parseInt(value) || 1;
    const validated = Math.max(1, Math.min(num, maxStock));
    setQty(validated);
    setQtyInput(String(validated));
    return validated;
  }, [maxStock]);

  const handleQtyChange = (e) => {
    const value = e.target.value;
    // Allow empty for typing experience
    if (value === '') {
      setQtyInput('');
      return;
    }
    // Only allow digits
    if (!/^\d+$/.test(value)) return;
    
    setQtyInput(value);
    const num = parseInt(value);
    if (num >= 1 && num <= maxStock) {
      setQty(num);
    }
  };

  const handleQtyBlur = () => {
    setQtyFocused(false);
    // Validate on blur
    if (qtyInput === '' || parseInt(qtyInput) < 1) {
      validateAndSetQty(1);
    } else if (parseInt(qtyInput) > maxStock) {
      validateAndSetQty(maxStock);
    }
  };

  const handleQtyKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      validateAndSetQty(qty + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      validateAndSetQty(qty - 1);
    } else if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const incQty = () => validateAndSetQty(qty + 1);
  const decQty = () => validateAndSetQty(qty - 1);

  /* ── Memoized live price calculation ── */
  const priceData = useMemo(() => {
    const basePrice = product?.basePrice || 0;
    const gstPct = product?.gstPercentage || 0;
    const subtotal = basePrice * qty;
    const gstAmt = subtotal * (gstPct / 100);
    const total = subtotal + gstAmt;
    return { basePrice, gstPct, subtotal, gstAmt, total };
  }, [product?.basePrice, product?.gstPercentage, qty]);

  /* ── Cart feedback ── */
  const [addedToCart, setAddedToCart] = useState(false);
  const handleAddToCart = useCallback(() => {
    addToCart(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }, [addToCart, product, qty]);

  /* ── Buy Now handler - Adds to cart and navigates to /cart page ── */
  const navigate = useNavigate();
  const { goBack, hasHistory, swipeHandlers } = useNavigateBack({ fallback: '/products' });
  const handleBuyNow = useCallback(() => {
    // Add product to cart
    addToCart(product, qty);
    // Navigate to cart page
    navigate('/cart');
  }, [addToCart, product, qty, navigate]);

  /* ── Get Quotation handler - Opens WhatsApp with product details ── */
  const handleGetQuotation = useCallback(() => {
    const message = `Hi! I'm interested in getting a quotation:\n\n🏗️ *Product:* ${product.name}\n📦 *Quantity:* ${qty} ${product.unit}\n💰 *Price:* ₹${priceData.basePrice.toLocaleString()} per ${product.unit}\n💵 *Estimated Total:* ₹${priceData.total.toLocaleString()}\n\n📱 *Website:* BuildMart\n\nPlease share more details and confirm pricing.`;
    
    openWhatsApp({ customMessage: message });
  }, [product, qty, priceData]);

  /* ── Shipping address ── */
  const [addr, setAddr] = useState({ name: '', phone: '', email: '', address: '', pincode: '' });
  const [locLabel, setLocLabel] = useState('');
  const setF = (k, v) => setAddr(a => ({ ...a, [k]: v }));

  const detectLocation = () => {
    setLocLabel('Detecting…');
    if (!navigator.geolocation) { setLocLabel('Not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();
          const city = d.address?.city || d.address?.town || d.address?.village || '';
          const state = d.address?.state || '';
          const pin = d.address?.postcode || '';
          setLocLabel(`📍 ${city}${city && state ? ', ' : ''}${state}`);
          if (pin) setF('pincode', pin);
          if (d.display_name) setF('address', d.display_name.split(',').slice(0, 3).join(', '));
        } catch { setLocLabel('Could not fetch address'); }
      },
      () => setLocLabel('Permission denied')
    );
  };



  /* ── Wishlist ── */
  const [wishlisted, setWishlisted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('buildmart_wishlist') || '[]').includes(id); }
    catch { return false; }
  });
  const toggleWish = () => {
    const list = JSON.parse(localStorage.getItem('buildmart_wishlist') || '[]');
    const next = wishlisted ? list.filter(x => x !== id) : [...list, id];
    localStorage.setItem('buildmart_wishlist', JSON.stringify(next));
    setWishlisted(!wishlisted);
  };

  /* ── Share ── */
  const handleShare = () => {
    if (navigator.share) { navigator.share({ title: product.name, url: window.location.href }); }
    else { navigator.clipboard?.writeText(window.location.href); alert('Link copied!'); }
  };

  /* ── WhatsApp quote ── */
  const handleWAQuote = () =>
    openWhatsApp({
      product: product.name,
      dimensions: `${qty} × ${product.unit}`,
      quantity: `${qty} ${product.unit}`,
      total: priceData.total.toFixed(0),
    });

  /* ── Payment link ── */
  const [payLink, setPayLink] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const handlePayLink = async () => {
    if (!addr.name || !addr.phone) { alert('Fill in your Name and Phone first.'); return; }
    setPayLoading(true);
    try {
      const link = await generatePaymentLink({
        productName: product.name,
        quantity: qty,
        totalAmount: priceData.total.toFixed(0),
        customerName: addr.name,
        customerPhone: addr.phone,
      });
      setPayLink(link);
    } catch { alert('Could not generate link. Try again.'); }
    finally { setPayLoading(false); }
  };

  /* ── Loading state ── */
  if (loading) return <LoadingSkeleton />;

  /* ── Not found state ── */
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-2xl font-bold text-neutral-800">Product not found</p>
      <Link to="/products" className="bg-construction-yellow font-bold px-6 py-3 rounded-xl border-2 border-neutral-900">
        ← Back to Products
      </Link>
    </div>
  );

  /* ── Derived values ── */
  const stockLabel = product.stock > 50 ? 'In Stock' : product.stock > 0 ? 'Limited Stock' : 'Out of Stock';
  const stockColor = product.stock > 50 ? 'text-green-600' : product.stock > 0 ? 'text-orange-500' : 'text-red-600';
  const inp = 'w-full border-2 border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:border-construction-yellow focus:outline-none transition-colors bg-white placeholder:text-neutral-400';

  /* ── JSON-LD ── */
  const productImage = product.images && product.images.length > 0 
    ? product.images[0].url 
    : product.imageUrl || '';
    
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name,
    description: product.seoDescription || product.description,
    image: productImage,
    offers: {
      '@type': 'Offer', priceCurrency: 'INR', price: priceData.total.toFixed(0),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      {/* ── SEO ── */}
      <Helmet>
        <title>{`${product.name} — BuildMart Construction Materials`}</title>
        <meta name="description" content={product.seoDescription || product.description} />
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>

      {/* ── Breadcrumb + Back ── */}
      <div className="bg-neutral-100 border-b border-neutral-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">

          {/* Breadcrumb trail */}
          <div className="flex gap-2 items-center flex-wrap text-sm text-neutral-500">
            <Link to="/" className="hover:text-neutral-800 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-neutral-800 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-neutral-700 font-medium truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
          </div>

          {/* ← Back button */}
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-400 px-3 py-1.5 rounded-lg transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {hasHistory ? 'Back' : 'All Products'}
          </button>

        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8" {...swipeHandlers}>
        <div className="grid lg:grid-cols-[1fr_420px] gap-6 lg:gap-8 items-start">

          {/* ═══ LEFT: Image + Description ═══ */}
          <div className="space-y-4 sm:space-y-6">

            {/* Product Image */}
            <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <img
                src={
                  product.images && product.images.length > 0 
                    ? product.images[0].url 
                    : product.imageUrl || 'https://placehold.co/800x500?text=No+Image'
                }
                alt={`${product.name} – ${product.category} for sale at BuildMart`}
                className="w-full object-cover max-h-[400px]"
                loading="lazy"
                width={product.images?.[0]?.width}
                height={product.images?.[0]?.height}
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.stock > 0 && product.stock <= 50 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    ⚡ LIMITED STOCK
                  </span>
                )}
                {product.stock > 50 && (
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    ✓ IN STOCK
                  </span>
                )}
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  BULK DISCOUNT
                </span>
              </div>

              {/* Wishlist + Share */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button onClick={toggleWish} title="Wishlist"
                  className="w-10 h-10 sm:w-9 sm:h-9 bg-white rounded-full shadow border border-neutral-200 flex items-center justify-center hover:border-red-400 transition-all active:scale-95">
                  <span className={`text-lg sm:text-base leading-none ${wishlisted ? 'text-red-500' : 'text-neutral-300'}`}>♥</span>
                </button>
                <button onClick={handleShare} title="Share"
                  className="w-10 h-10 sm:w-9 sm:h-9 bg-white rounded-full shadow border border-neutral-200 flex items-center justify-center hover:border-blue-400 transition-all active:scale-95 text-sm">
                  🔗
                </button>
              </div>
            </div>

            {/* Product Info Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <span className="text-xs bg-construction-yellow text-neutral-900 font-bold px-3 py-1 rounded-full uppercase">
                  {product.category}
                </span>
                <h1 className="mt-3 text-2xl sm:text-3xl font-black text-neutral-900 leading-snug">
                  {product.name}
                </h1>
                <p className="mt-2 text-neutral-600 leading-relaxed">{product.description}</p>
              </div>

              {product.seoDescription && (
                <>
                  <hr className="border-neutral-100" />
                  <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                    {product.seoDescription}
                  </div>
                </>
              )}

              {/* Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { emoji: '🏷️', label: 'Category', val: product.category },
                  { emoji: '📦', label: 'Unit', val: product.unit },
                  { emoji: '📋', label: 'GST', val: `${priceData.gstPct}%` },
                  { emoji: '🚚', label: 'Delivery', val: '24-48 hrs' },
                  { emoji: '✅', label: 'Stock', val: stockLabel, cls: stockColor },
                  { emoji: '🧾', label: 'Invoice', val: 'GST Bill' },
                ].map(s => (
                  <div key={s.label} className="bg-neutral-50 rounded-xl px-3 sm:px-4 py-3 border border-neutral-100">
                    <p className="text-base">{s.emoji}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
                    <p className={`text-sm font-bold ${s.cls || 'text-neutral-800'}`}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT: 3 Sticky Cards ═══ */}
          <div className="lg:sticky lg:top-24 space-y-4">

            {/* Card 1: Product Info + Advanced Quantity + Price */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-5 space-y-4">
              <h2 className="text-base font-black uppercase tracking-wide text-neutral-700">Product Info</h2>

              {/* Base Price */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-neutral-500">Base price</p>
                  <p className="text-3xl font-black text-neutral-900">
                    ₹{priceData.basePrice.toLocaleString()}
                    <span className="text-base font-normal text-neutral-500"> / {product.unit}</span>
                  </p>
                </div>
                <span className={`text-sm font-bold ${stockColor}`}>{stockLabel}</span>
              </div>

              {/* Advanced Quantity Input */}
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Quantity</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Minus Button */}
                  <button
                    onClick={decQty}
                    disabled={qty <= 1}
                    className="flex-shrink-0 w-12 h-12 sm:w-11 sm:h-11 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-2xl font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                    aria-label="Decrease quantity"
                  >−</button>

                  {/* Input Field */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={qtyInput}
                      onChange={handleQtyChange}
                      onFocus={() => setQtyFocused(true)}
                      onBlur={handleQtyBlur}
                      onKeyDown={handleQtyKeyDown}
                      className={`w-full text-center text-2xl font-black text-neutral-900 border-2 rounded-xl px-2 py-2 transition-all outline-none ${
                        qtyFocused 
                          ? 'border-construction-yellow bg-construction-yellow/10 shadow-sm' 
                          : 'border-neutral-200 bg-white'
                      }`}
                      aria-label="Quantity"
                    />
                    {qtyFocused && (
                      <p className="absolute -bottom-6 left-0 right-0 text-center text-xs text-neutral-400 whitespace-nowrap">
                        Use keyboard or ↑↓
                      </p>
                    )}
                  </div>

                  {/* Plus Button */}
                  <button
                    onClick={incQty}
                    disabled={qty >= maxStock}
                    className="flex-shrink-0 w-12 h-12 sm:w-11 sm:h-11 rounded-xl bg-construction-yellow hover:bg-construction-orange active:scale-95 text-2xl font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                    aria-label="Increase quantity"
                  >+</button>

                  <span className="text-sm text-neutral-500 flex-shrink-0 ml-1">{product.unit}</span>
                </div>
                {product.stock > 0 && product.stock < 10 && (
                  <p className="text-xs text-orange-500 font-semibold mt-2">⚠ Only {product.stock} left</p>
                )}
              </div>

              {/* Live Price Breakdown */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Base ({qty} × ₹{priceData.basePrice.toLocaleString()})</span>
                  <span className="font-semibold transition-all">₹{priceData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">GST ({priceData.gstPct}%)</span>
                  <span className="font-semibold transition-all">₹{priceData.gstAmt.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>
                  <span className="text-neutral-400 italic text-xs self-end">At checkout</span>
                </div>
                <hr className="border-neutral-200" />
                <div className="flex justify-between items-center">
                  <span className="font-black text-neutral-900">Total</span>
                  <span className="text-2xl font-black text-construction-yellow transition-all">
                    ₹{priceData.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              {addedToCart && (
                <div className="bg-green-50 border border-green-400 text-green-700 text-sm rounded-xl px-3 py-2 flex items-center gap-2 animate-fade-in">
                  <span>✓</span> Added to cart!
                </div>
              )}
              <button
                onClick={handleAddToCart}
                className="w-full bg-neutral-900 hover:bg-neutral-700 active:scale-[0.98] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </button>
            </div>

            {/* Card 2: Shipping */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-5 space-y-3">
              <h2 className="text-base font-black uppercase tracking-wide text-neutral-700">Shipping Address</h2>
              <input className={inp} placeholder="Full Name *" value={addr.name} onChange={e => setF('name', e.target.value)} />
              <input className={inp} placeholder="Phone *" type="tel" value={addr.phone} onChange={e => setF('phone', e.target.value)} />
              <input className={inp} placeholder="Email" type="email" value={addr.email} onChange={e => setF('email', e.target.value)} />
              <textarea className={`${inp} resize-none`} rows={2} placeholder="Delivery Address"
                value={addr.address} onChange={e => setF('address', e.target.value)} />
              <div className="flex gap-2">
                <input className={inp} placeholder="Pincode" value={addr.pincode} onChange={e => setF('pincode', e.target.value)} />
                <button onClick={detectLocation}
                  className="flex-shrink-0 px-3 py-2 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 border-2 border-blue-200 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-manipulation">
                  📍 Detect
                </button>
              </div>
              {locLabel && <p className="text-xs text-neutral-600 pl-1">{locLabel}</p>}
            </div>

            {/* Card 3: Action Buttons */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-5 space-y-4">
              <h2 className="text-base font-black uppercase tracking-wide text-neutral-700">Purchase Options</h2>

              {/* Total */}
              <div className="bg-construction-yellow/15 border border-construction-yellow/50 rounded-xl p-4 text-center space-y-1">
                <p className="text-xs text-neutral-600 uppercase font-semibold tracking-wider">Your Total</p>
                <p className="text-4xl font-black text-neutral-900">₹{priceData.total.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">{qty} {product.unit} · incl. {priceData.gstPct}% GST</p>
              </div>

              {/* Buy Now - Adds to cart and navigates to /cart */}
              <button onClick={handleBuyNow}
                className="w-full bg-construction-yellow hover:bg-construction-orange active:scale-[0.98] text-neutral-900 font-bold py-3 rounded-xl transition-all border-2 border-neutral-900 touch-manipulation flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Buy Now
              </button>

              {/* Get Quotation - Opens WhatsApp with product details */}
              <button onClick={handleGetQuotation}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] active:scale-[0.98] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-[#1da851] touch-manipulation">
                <WAIcon /> Get Quotation
              </button>

              <p className="text-xs text-center text-neutral-400">🔒 Secure checkout · GST bill · Fast delivery</p>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE STICKY BOTTOM BAR
          Visible only on mobile (lg:hidden). Shows:
          - Quantity stepper (−  n  +)
          - WhatsApp button (pre-filled with product + qty)
          - Call button
          Desktop users already see all actions in the right-side sticky cards.
      ══════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-neutral-200 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] safe-area-inset-bottom">
        <div className="px-3 py-3 flex items-center gap-2">

          {/* ── Quantity stepper ── */}
          <div className="flex items-center bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
            <button
              onClick={decQty}
              disabled={qty <= 1}
              className="w-10 h-10 flex items-center justify-center text-xl font-bold text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
              aria-label="Decrease quantity"
            >−</button>

            <span className="w-9 text-center text-base font-black text-neutral-900 select-none tabular-nums">
              {qty}
            </span>

            <button
              onClick={incQty}
              disabled={qty >= maxStock}
              className="w-10 h-10 flex items-center justify-center text-xl font-bold text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
              aria-label="Increase quantity"
            >+</button>
          </div>

          {/* ── Price pill ── */}
          <div className="flex-shrink-0 text-center hidden xs:block">
            <p className="text-[10px] text-neutral-400 leading-none">Total</p>
            <p className="text-sm font-black text-neutral-900 leading-tight">
              ₹{priceData.total.toLocaleString()}
            </p>
          </div>

          {/* ── Add to Cart ── */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation border-2 ${
              addedToCart
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-700'
            }`}
          >
            {addedToCart ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                Add
              </>
            )}
          </button>

          {/* ── WhatsApp ── */}
          <button
            onClick={handleGetQuotation}
            className="flex-shrink-0 w-10 h-10 bg-[#25D366] hover:bg-[#20BA5A] active:scale-95 rounded-xl flex items-center justify-center shadow-sm transition-all touch-manipulation"
            aria-label="WhatsApp enquiry"
            title="WhatsApp enquiry"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </button>

          {/* ── Call ── */}
          <a
            href={`tel:${CONTACT_CONFIG.phoneRaw}`}
            className="flex-shrink-0 w-10 h-10 bg-[#FF6B35] hover:bg-orange-600 active:scale-95 rounded-xl flex items-center justify-center shadow-sm transition-all touch-manipulation"
            aria-label="Call us"
            title={`Call ${CONTACT_CONFIG.phone}`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </a>

        </div>

        {/* Safe area spacer for iPhone home indicator */}
        <div className="h-safe-bottom" />
      </div>

      {/* Bottom padding so content isn't hidden behind the sticky bar on mobile */}
      <div className="lg:hidden h-20" />
    </>
  );
};

export default ProductDetail;

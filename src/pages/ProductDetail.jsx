import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsData } from '../data/products';
import { useDistanceCalculator } from '../hooks/useDistanceCalculator';
import { useTransportCalculator } from '../hooks/useTransportCalculator';
import { useGSTCalculator } from '../hooks/useGSTCalculator';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = productsData.find(p => p.id === id);

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Order Details
  const [quantity, setQuantity] = useState(1);
  const [distance, setDistance] = useState(null);
  const [gstInvoice, setGstInvoice] = useState(true);

  const { calculateDistance, loading: distanceLoading, error: distanceError } = useDistanceCalculator();
  const { calculateTransport } = useTransportCalculator();
  const { calculateGST } = useGSTCalculator();

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const paymentLink = import.meta.env.VITE_RAZORPAY_LINK || 'https://razorpay.me/@buildmart';

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Weight estimation
  const estimateWeight = (product, quantity) => {
    switch (product.category) {
      case 'Cement': return quantity * 50;
      case 'Steel': return quantity;
      case 'Bricks': return quantity * 3;
      case 'Sand & Aggregates': return quantity * 1000;
      default: return quantity * 10;
    }
  };

  const weightKg = estimateWeight(product, quantity);
  const gstCalculation = calculateGST(product.basePrice, quantity, product.gstPercentage);
  const transportCalculation = distance ? calculateTransport(weightKg, distance.distance) : null;
  const estimatedTotal = transportCalculation
    ? gstCalculation.totalWithGST + transportCalculation.totalTransportCost
    : gstCalculation.totalWithGST;

  const handleCalculateDistance = async (e) => {
    e.preventDefault();
    const address = pincode ? `${deliveryAddress}, ${pincode}` : deliveryAddress;
    
    if (!address.trim()) {
      alert('Please enter delivery address or pincode');
      return;
    }

    const result = await calculateDistance(address);
    setDistance(result);
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return false;
    }
    if (!pincode.trim()) {
      alert('Please enter pincode');
      return false;
    }
    if (!distance) {
      alert('Please calculate distance first');
      return false;
    }
    return true;
  };

  const generateWhatsAppMessage = () => {
    return encodeURIComponent(`*🏗 NEW ORDER - BUILDMART*

*CUSTOMER DETAILS:*
👤 Name: ${customerName}
📞 Phone: ${customerPhone}
📍 Address: ${deliveryAddress}
📮 Pincode: ${pincode}

*PRODUCT DETAILS:*
📦 Product: ${product.name}
📊 Quantity: ${quantity} ${product.unit}
⚖️ Est. Weight: ${weightKg}kg

*DELIVERY:*
🚗 Distance: ${distance.distanceText} ${distance.isFallback ? '(Estimated)' : '(Calculated)'}
🚚 Vehicle: ${transportCalculation.vehicle.name}

*COST BREAKDOWN:*
💰 Material: ₹${gstCalculation.materialCost.toLocaleString()}
📄 GST (${product.gstPercentage}%): ₹${gstCalculation.gstAmount.toLocaleString()}
🚛 Base Charge: ₹${transportCalculation.baseCharge.toLocaleString()}
📏 Distance (${distance.distance}km × ₹${transportCalculation.breakdown.perKmRate}): ₹${transportCalculation.distanceCharge.toLocaleString()}
🚚 Transport Total: ₹${transportCalculation.totalTransportCost.toLocaleString()}

*💵 TOTAL: ₹${estimatedTotal.toLocaleString()}*

📋 GST Invoice: ${gstInvoice ? 'Yes' : 'No'}

_Payment pending. Link will be shared after confirmation._`);
  };

  const handleWhatsAppOrder = () => {
    if (!validateForm()) return;

    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const handlePaymentSuccess = () => {
    // After payment, send confirmation to WhatsApp and redirect home
    const confirmationMessage = encodeURIComponent(`✅ *PAYMENT COMPLETED*

Order for: ${product.name}
Customer: ${customerName}
Phone: ${customerPhone}
Amount: ₹${estimatedTotal.toLocaleString()}

Please confirm order processing. Thank you!`);
    
    const url = `https://wa.me/${whatsappNumber}?text=${confirmationMessage}`;
    window.open(url, '_blank');
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200 py-4">
        <div className="container-custom">
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Link to="/" className="hover:text-primary-500">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary-500">Products</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Product Info */}
          <div>
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="badge-orange mb-3">{product.category}</div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">{product.name}</h1>
              <p className="text-neutral-600 mb-6">{product.description}</p>

              <div className="mb-6">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full rounded-lg"
                />
              </div>

              <div className="flex justify-between items-center bg-neutral-50 rounded-lg p-4">
                <div>
                  <div className="text-sm text-neutral-500">Base Price</div>
                  <div className="text-3xl font-bold text-neutral-900">₹{product.basePrice}</div>
                  <div className="text-sm text-neutral-600">per {product.unit}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-500">GST</div>
                  <div className="text-2xl font-bold text-primary-500">{product.gstPercentage}%</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Product Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-neutral-700">Premium quality certified</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-neutral-700">Direct from manufacturer</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-neutral-700">24-48 hours delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-neutral-700">GST billing available</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right - Order Form */}
          <div className="sticky top-24">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Get Instant Quote</h2>

              <form className="space-y-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input-field"
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Quantity ({product.unit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field"
                  />
                  <div className="text-xs text-neutral-500 mt-1">
                    Est. Weight: ~{weightKg.toFixed(0)} kg
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="House no, Street, Area, Landmark"
                    required
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="input-field"
                    placeholder="6-digit pincode"
                    maxLength="6"
                    required
                  />
                </div>

                {/* Calculate Distance */}
                <button
                  type="button"
                  onClick={handleCalculateDistance}
                  disabled={distanceLoading}
                  className="w-full btn-secondary justify-center"
                >
                  {distanceLoading ? 'Calculating...' : '📍 Calculate Distance & Price'}
                </button>

                {distanceError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {distanceError}
                  </div>
                )}

                {distance && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Distance</span>
                      <span className="text-2xl font-bold text-primary-600">{distance.distanceText}</span>
                    </div>
                    {distance.isFallback && (
                      <p className="text-xs text-neutral-600 mt-1">⚠️ Estimated (API unavailable)</p>
                    )}
                  </div>
                )}
              </form>

              {/* Cost Breakdown */}
              {distance && transportCalculation && (
                <div className="mt-6 bg-neutral-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-lg mb-3">Cost Breakdown</h3>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Material Cost</span>
                    <span className="font-semibold">₹{gstCalculation.materialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">GST ({product.gstPercentage}%)</span>
                    <span className="font-semibold">₹{gstCalculation.gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-neutral-300 pt-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Vehicle: {transportCalculation.vehicle.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Base Charge</span>
                    <span>₹{transportCalculation.baseCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Distance ({distance.distance}km × ₹{transportCalculation.breakdown.perKmRate})</span>
                    <span>₹{transportCalculation.distanceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Transport Total</span>
                    <span>₹{transportCalculation.totalTransportCost.toLocaleString()}</span>
                  </div>
                  <div className="border-t-2 border-neutral-300 pt-3" />
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold">ESTIMATED TOTAL</span>
                    <span className="text-3xl font-bold text-primary-500">
                      ₹{estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* GST Invoice */}
              <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gstInvoice}
                    onChange={(e) => setGstInvoice(e.target.checked)}
                    className="w-5 h-5 text-primary-500 rounded"
                  />
                  <span className="font-medium">GST Invoice Required</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full btn-whatsapp text-lg justify-center"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Send Quote Request
                </button>

                {distance && (
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handlePaymentSuccess}
                    className="block w-full btn-primary text-lg text-center"
                  >
                    💳 Proceed to Payment
                  </a>
                )}
              </div>

              <p className="text-xs text-center text-neutral-500 mt-4 italic">
                ⚠️ Price confirmed on WhatsApp. Payment after confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

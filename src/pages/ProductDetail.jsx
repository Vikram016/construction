import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsData } from '../data/products';
import { useDistanceCalculator } from '../hooks/useDistanceCalculator';
import { useTransportCalculator } from '../hooks/useTransportCalculator';
import { useGSTCalculator } from '../hooks/useGSTCalculator';

const ProductDetail = () => {
  const { id } = useParams();
  const product = productsData.find(p => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [distance, setDistance] = useState(null);
  const [gstInvoice, setGstInvoice] = useState(true);

  const { calculateDistance, loading: distanceLoading, error: distanceError } = useDistanceCalculator();
  const { calculateTransport } = useTransportCalculator();
  const { calculateGST } = useGSTCalculator();

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-3xl mb-4">Product Not Found</h2>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Weight estimation helper
  const estimateWeight = (product, quantity) => {
    switch (product.category) {
      case 'Cement':
        return quantity * 50; // 50kg per bag
      case 'Steel':
        return quantity; // already in kg
      case 'Bricks':
        return quantity * 3; // ~3kg per brick
      case 'Sand & Aggregates':
        return quantity * 1000; // ton to kg
      default:
        return quantity * 10;
    }
  };

  const weightKg = estimateWeight(product, quantity);

  // Calculate GST
  const gstCalculation = calculateGST(product.basePrice, quantity, product.gstPercentage);

  // Calculate Transport (if distance available)
  const transportCalculation = distance
    ? calculateTransport(weightKg, distance.distance)
    : null;

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

  const generateWhatsAppMessage = () => {
    let message = `*ORDER INQUIRY - BUILDMART*

*Product:* ${product.name}
*Quantity:* ${quantity} ${product.unit}

*Delivery Details:*
📍 Address: ${deliveryAddress}
📮 Pincode: ${pincode}
${distance ? `🚗 Distance: ${distance.distanceText} (${distance.isFallback ? 'Estimated' : 'Calculated'})` : '⚠️ Distance not calculated'}

*COST BREAKDOWN:*
💰 Material Cost: ₹${gstCalculation.materialCost.toLocaleString()}
📄 GST (${product.gstPercentage}%): ₹${gstCalculation.gstAmount.toLocaleString()}
`;

    if (transportCalculation) {
      message += `🚚 Vehicle: ${transportCalculation.vehicle.name}
🚛 Base Charge: ₹${transportCalculation.baseCharge.toLocaleString()}
📏 Distance Charge: ₹${transportCalculation.distanceCharge.toLocaleString()} (${distance.distance}km @ ₹${transportCalculation.breakdown.perKmRate}/km)
🚚 Est. Transport: ₹${transportCalculation.totalTransportCost.toLocaleString()}
`;
    } else {
      message += `🚚 Transport: *Not calculated* (please confirm distance)
`;
    }

    message += `
*ESTIMATED TOTAL: ₹${estimatedTotal.toLocaleString()}*

📋 GST Invoice Required: ${gstInvoice ? 'Yes' : 'No'}

_Note: This is an estimate. Final pricing will be confirmed by our team._

Please confirm this order and provide final pricing. Thank you!`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    if (!deliveryAddress) {
      alert('Please enter delivery address');
      return;
    }

    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-construction-lightGray py-2 sm:py-3 md:py-4 border-b-2 border-construction-yellow">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <Link to="/" className="hover:text-construction-yellow">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-construction-yellow">Products</Link>
            <span>/</span>
            <span className="text-construction-mediumGray truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Left Column - Product Info */}
          <div>
            <div className="bg-construction-yellow inline-block px-2 sm:px-3 py-1 font-bold text-xs sm:text-sm uppercase mb-3 sm:mb-4">
              {product.category}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">{product.name}</h1>
            <p className="text-sm sm:text-base md:text-lg text-construction-mediumGray mb-4 sm:mb-6">
              {product.description}
            </p>

            {/* Image */}
            <div className="mb-6 sm:mb-8 overflow-hidden shadow-xl border-2 sm:border-4 border-construction-darkGray">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
              />
            </div>

            {/* Price Info */}
            <div className="bg-construction-darkGray text-white p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs sm:text-sm uppercase tracking-wider mb-1">Base Price</div>
                  <div className="font-display text-3xl sm:text-4xl md:text-5xl text-construction-yellow">
                    ₹{product.basePrice}
                  </div>
                  <div className="text-xs sm:text-sm">per {product.unit}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm uppercase tracking-wider mb-1">GST</div>
                  <div className="font-display text-2xl sm:text-3xl text-construction-yellow">
                    {product.gstPercentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white border-l-4 border-construction-yellow p-4 sm:p-6">
              <h3 className="font-display text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">PRODUCT FEATURES</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-construction-yellow text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-sm sm:text-base">Premium quality certified materials</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-construction-yellow text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-sm sm:text-base">Direct from manufacturer/supplier</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-construction-yellow text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-sm sm:text-base">GST billing available</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-construction-yellow text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-sm sm:text-base">Fast delivery with proper transport</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Calculator */}
          <div>
            <div className="lg:sticky lg:top-24">
              <div className="bg-white shadow-2xl border-t-4 sm:border-t-8 border-construction-yellow p-4 sm:p-6">
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6">GET INSTANT QUOTE</h2>

                {/* Quantity Input */}
                <div className="mb-4 sm:mb-6">
                  <label className="label">
                    Quantity ({product.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field"
                  />
                  <div className="text-xs text-construction-mediumGray mt-1">
                    Est. Weight: ~{weightKg.toFixed(0)} kg
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-4 sm:mb-6">
                  <label className="label">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="input-field"
                    rows="2"
                    placeholder="Enter full delivery address"
                  />
                </div>

                {/* Pincode */}
                <div className="mb-4 sm:mb-6">
                  <label className="label">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="input-field"
                    placeholder="Enter pincode"
                  />
                </div>

                {/* Calculate Distance Button */}
                <button
                  onClick={handleCalculateDistance}
                  disabled={distanceLoading}
                  className="w-full bg-construction-mediumGray text-white py-2 sm:py-3 px-4 sm:px-6 font-bold uppercase text-sm sm:text-base mb-4 sm:mb-6 hover:bg-construction-darkGray transition-colors disabled:opacity-50"
                >
                  {distanceLoading ? 'Calculating...' : 'Calculate Distance & Transport'}
                </button>

                {distanceError && (
                  <div className="bg-red-100 border-l-4 border-red-500 p-3 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-red-700">{distanceError}</p>
                  </div>
                )}

                {distance && (
                  <div className="bg-construction-yellow p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold uppercase text-xs sm:text-sm">Distance</span>
                      <span className="font-display text-xl sm:text-2xl">{distance.distanceText}</span>
                    </div>
                    {distance.isFallback && (
                      <p className="text-xs text-construction-darkGray">
                        ⚠️ Estimated distance (API unavailable)
                      </p>
                    )}
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="bg-construction-lightGray p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="font-display text-lg sm:text-xl mb-3 sm:mb-4">COST BREAKDOWN</h3>

                  <div className="space-y-2 sm:space-y-3 mb-4">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Material Cost</span>
                      <span className="font-bold">₹{gstCalculation.materialCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>GST ({product.gstPercentage}%)</span>
                      <span className="font-bold">₹{gstCalculation.gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-construction-mediumGray pt-2" />

                    {transportCalculation ? (
                      <>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Vehicle: {transportCalculation.vehicle.name}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Base Charge</span>
                          <span>₹{transportCalculation.baseCharge.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-xs">Distance ({distance.distance}km @ ₹{transportCalculation.breakdown.perKmRate}/km)</span>
                          <span>₹{transportCalculation.distanceCharge.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm sm:text-base">
                          <span>Transport Cost</span>
                          <span>₹{transportCalculation.totalTransportCost.toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs sm:text-sm text-construction-mediumGray italic">
                        Calculate distance to see transport cost
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-construction-darkGray pt-3 sm:pt-4">
                    <div className="flex justify-between items-end">
                      <span className="font-display text-base sm:text-lg md:text-xl">ESTIMATED TOTAL</span>
                      <span className="font-display text-2xl sm:text-3xl text-construction-orange">
                        ₹{estimatedTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GST Invoice Checkbox */}
                <div className="mb-4 sm:mb-6">
                  <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gstInvoice}
                      onChange={(e) => setGstInvoice(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="font-bold text-sm sm:text-base">GST Invoice Required</span>
                  </label>
                </div>

                {/* WhatsApp Order Button */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full btn-primary flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="text-sm sm:text-base">ORDER ON WHATSAPP</span>
                </button>

                <p className="text-[10px] sm:text-xs text-center text-construction-mediumGray italic">
                  ⚠️ Final transport charges confirmed on WhatsApp.
                  Payment only after price confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

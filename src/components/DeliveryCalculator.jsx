import { useState } from 'react';
import { useCart } from '../context/CartContext';

const DeliveryCalculator = () => {
  const [pincode, setPincode] = useState('');
  const [calculated, setCalculated] = useState(false);
  const [eta, setEta] = useState('');
  const { updateDeliveryCharge, deliveryCharge } = useCart();

  const calculateDelivery = () => {
    if (!pincode || pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    // Mock distance calculation based on pincode
    // In production, use Google Maps Distance Matrix API
    const lastDigit = parseInt(pincode.charAt(pincode.length - 1));
    let distance, charge, etaText;

    if (lastDigit <= 3) {
      // 0-5km
      distance = Math.floor(Math.random() * 5) + 1;
      charge = 200;
      etaText = '24 hours';
    } else if (lastDigit <= 7) {
      // 5-15km
      distance = Math.floor(Math.random() * 10) + 5;
      charge = 500;
      etaText = '24-48 hours';
    } else {
      // 15+km
      distance = Math.floor(Math.random() * 15) + 15;
      charge = 1000;
      etaText = '48 hours';
    }

    updateDeliveryCharge(charge);
    setEta(`${distance}km - ${etaText}`);
    setCalculated(true);
  };

  return (
    <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
      <h3 className="text-xl font-bold text-neutral-900 mb-6 uppercase tracking-wider">
        Calculate Delivery
      </h3>

      <div className="space-y-4">
        {/* Pincode Input */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase">
            Enter Pincode *
          </label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setPincode(value);
              setCalculated(false);
            }}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            className="w-full px-4 py-3 border-3 border-neutral-900 focus:border-construction-yellow focus:outline-none font-semibold text-lg"
          />
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateDelivery}
          className="w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-bold py-3 px-6 border-3 border-neutral-900 uppercase tracking-wider transition-all hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
        >
          Calculate Delivery
        </button>

        {/* Results */}
        {calculated && (
          <div className="mt-4 bg-green-50 border-3 border-green-600 p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-bold text-neutral-900 mb-1">Delivery Available</p>
                <p className="text-sm text-neutral-700 mb-2">Distance: {eta}</p>
                <p className="text-lg font-black text-green-600">
                  Delivery Charge: ₹{deliveryCharge.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Info */}
        <div className="mt-4 bg-neutral-100 p-4 border-l-4 border-construction-yellow">
          <p className="text-xs font-bold text-neutral-900 mb-2 uppercase">Delivery Rates</p>
          <ul className="text-sm text-neutral-700 space-y-1">
            <li>• 0-5km: ₹200 (24 hours)</li>
            <li>• 5-15km: ₹500 (24-48 hours)</li>
            <li>• 15+km: ₹1,000 (48 hours)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCalculator;

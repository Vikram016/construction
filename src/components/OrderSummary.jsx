import { useCart } from '../context/CartContext';

const OrderSummary = () => {
  const { cartItems, subtotal, deliveryCharge, grandTotal, wasteCollectionInfo = {} } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="bg-white border-3 border-neutral-900 p-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-4 uppercase">Order Summary</h3>
        <p className="text-neutral-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
      <h3 className="text-xl font-bold text-neutral-900 mb-6 uppercase tracking-wider">
        Order Summary
      </h3>

      {/* Cart Items Breakdown */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start pb-3 border-b-2 border-neutral-200">
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">{item.name}</p>
              <p className="text-sm text-neutral-600">
                ₹{item.basePrice.toLocaleString()} × {item.quantity} {item.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-neutral-900">
                ₹{(item.basePrice * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 border-t-3 border-neutral-900 pt-4">
        <div className="flex justify-between text-neutral-700">
          <span>Subtotal</span>
          <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-neutral-700">
          <span>Delivery Charge</span>
          <span className="font-semibold">
            {deliveryCharge > 0 ? `₹${deliveryCharge.toLocaleString()}` : 'Calculate'}
          </span>
        </div>

        {/* Waste Collection Fee */}
        {wasteCollectionInfo.isSelected && (
          <div className="flex justify-between text-green-700 bg-green-50 p-2 border-l-4 border-green-600">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {wasteCollectionInfo.displayText}
            </span>
            <span className="font-semibold">
              {wasteCollectionInfo.isFree ? 'FREE' : `₹${wasteCollectionInfo.fee}`}
            </span>
          </div>
        )}

        <div className="border-t-3 border-construction-yellow pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-neutral-900 uppercase">Grand Total</span>
            <span className="text-2xl font-black text-construction-yellow">
              ₹{grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery ETA */}
      <div className="mt-6 bg-construction-yellow bg-opacity-10 border-l-4 border-construction-yellow p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-construction-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold text-neutral-900">Delivery ETA</p>
            <p className="text-sm text-neutral-700">
              Delivery within 24-48 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;

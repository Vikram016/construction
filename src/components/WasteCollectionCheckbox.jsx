import { useCart } from '../context/CartContext';

const WasteCollectionCheckbox = () => {
  const { 
    wasteCollectionSelected, 
    wasteCollectionFee, 
    wasteCollectionIsFree,
    toggleWasteCollection,
    subtotal,
    gst,
    deliveryCharge
  } = useCart();

  const baseTotal = subtotal + gst + deliveryCharge;
  const threshold = 10000;

  return (
    <div className="bg-green-50 border-3 border-green-600 p-6 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          id="wasteCollection"
          checked={wasteCollectionSelected}
          onChange={toggleWasteCollection}
          className="w-5 h-5 mt-1 cursor-pointer accent-green-600"
        />

        {/* Content */}
        <div className="flex-1">
          <label 
            htmlFor="wasteCollection" 
            className="font-bold text-lg text-neutral-900 cursor-pointer flex items-center gap-2"
          >
            🧹 Waste Sand Collection Service
            {wasteCollectionSelected && wasteCollectionIsFree && (
              <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 border-2 border-neutral-900 uppercase">
                FREE
              </span>
            )}
          </label>

          <p className="text-sm text-neutral-700 mt-2">
            We'll collect old/waste sand from your construction site after delivery.
          </p>

          {/* Pricing Info */}
          <div className="mt-3 bg-white border-2 border-green-600 p-3">
            <p className="text-sm font-semibold text-neutral-900 mb-2">
              💡 Smart Pricing:
            </p>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li className="flex items-center gap-2">
                <span className={baseTotal >= threshold ? 'text-green-600 font-bold' : ''}>
                  ✓ FREE for orders ≥ ₹{threshold.toLocaleString()}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className={baseTotal < threshold ? 'text-neutral-900 font-bold' : ''}>
                  • ₹199 for orders below ₹{threshold.toLocaleString()}
                </span>
              </li>
            </ul>

            {/* Current Status */}
            {wasteCollectionSelected && (
              <div className="mt-3 pt-3 border-t-2 border-green-200">
                <p className="text-sm font-bold text-green-700">
                  {wasteCollectionIsFree 
                    ? `✅ Your order qualifies for FREE waste collection!`
                    : `💰 Waste collection fee: ₹${wasteCollectionFee}`
                  }
                </p>
              </div>
            )}

            {/* Show how much more needed for free */}
            {wasteCollectionSelected && !wasteCollectionIsFree && baseTotal > 0 && (
              <div className="mt-2">
                <p className="text-xs text-neutral-600">
                  💡 Add ₹{(threshold - baseTotal).toLocaleString()} more to get FREE waste collection!
                </p>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-3">
            <p className="text-xs font-bold text-neutral-900 mb-1">
              ✨ Benefits:
            </p>
            <ul className="text-xs text-neutral-700 space-y-1">
              <li>• Keeps your site clean and organized</li>
              <li>• Saves you time and effort</li>
              <li>• Professional cleanup service</li>
              <li>• Eco-friendly waste disposal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteCollectionCheckbox;

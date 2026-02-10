import { useState, useEffect } from 'react';
import { productsData, vehicleTypes } from '../data/products';

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Admin settings state
  const [products, setProducts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [razorpayLink, setRazorpayLink] = useState('');

  useEffect(() => {
    // Load from localStorage or use defaults
    const savedProducts = localStorage.getItem('admin_products');
    const savedVehicles = localStorage.getItem('admin_vehicles');
    const savedWhatsapp = localStorage.getItem('admin_whatsapp');
    const savedUpi = localStorage.getItem('admin_upi');
    const savedRazorpay = localStorage.getItem('admin_razorpay');

    setProducts(savedProducts ? JSON.parse(savedProducts) : productsData);
    setVehicles(savedVehicles ? JSON.parse(savedVehicles) : vehicleTypes);
    setWhatsappNumber(savedWhatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210');
    setUpiId(savedUpi || import.meta.env.VITE_UPI_ID || 'business@upi');
    setRazorpayLink(savedRazorpay || import.meta.env.VITE_RAZORPAY_LINK || 'https://rzp.io/l/your-payment-link');
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleProductUpdate = (index, field, value) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleVehicleUpdate = (index, field, value) => {
    const updated = [...vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setVehicles(updated);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('admin_products', JSON.stringify(products));
    localStorage.setItem('admin_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('admin_whatsapp', whatsappNumber);
    localStorage.setItem('admin_upi', upiId);
    localStorage.setItem('admin_razorpay', razorpayLink);
    
    alert('Settings saved successfully! Note: These changes are stored locally in your browser.');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      localStorage.removeItem('admin_products');
      localStorage.removeItem('admin_vehicles');
      localStorage.removeItem('admin_whatsapp');
      localStorage.removeItem('admin_upi');
      localStorage.removeItem('admin_razorpay');
      
      setProducts(productsData);
      setVehicles(vehicleTypes);
      setWhatsappNumber(import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210');
      setUpiId(import.meta.env.VITE_UPI_ID || 'business@upi');
      setRazorpayLink(import.meta.env.VITE_RAZORPAY_LINK || 'https://rzp.io/l/your-payment-link');
      
      alert('Settings reset to defaults');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-construction-lightGray">
        <div className="bg-white shadow-2xl border-t-8 border-construction-yellow p-8 max-w-md w-full">
          <h1 className="font-display text-4xl mb-6 text-center">
            ADMIN <span className="text-construction-yellow">LOGIN</span>
          </h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>

          <p className="text-xs text-center text-construction-mediumGray mt-4">
            Default password: admin123 (change in .env file)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-construction-lightGray">
      {/* Header */}
      <div className="bg-construction-darkGray text-white py-6 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="font-display text-3xl">
            ADMIN <span className="text-construction-yellow">DASHBOARD</span>
          </h1>
          <button
            onClick={() => setAuthenticated(false)}
            className="bg-construction-mediumGray px-4 py-2 hover:bg-construction-yellow hover:text-construction-darkGray transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mb-8">
          <button
            onClick={handleResetDefaults}
            className="bg-construction-mediumGray text-white px-6 py-3 font-bold uppercase hover:bg-red-600 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSaveSettings}
            className="btn-primary"
          >
            Save All Changes
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Settings */}
          <div className="bg-white shadow-xl border-l-4 border-construction-yellow p-6">
            <h2 className="font-display text-2xl mb-6">CONFIGURATION</h2>

            <div className="space-y-6">
              <div>
                <label className="label">WhatsApp Number (with country code)</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="input-field"
                  placeholder="919876543210"
                />
              </div>

              <div>
                <label className="label">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="input-field"
                  placeholder="business@upi"
                />
              </div>

              <div>
                <label className="label">Razorpay Payment Link</label>
                <input
                  type="text"
                  value={razorpayLink}
                  onChange={(e) => setRazorpayLink(e.target.value)}
                  className="input-field"
                  placeholder="https://rzp.io/l/your-payment-link"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Pricing */}
          <div className="bg-white shadow-xl border-l-4 border-construction-orange p-6">
            <h2 className="font-display text-2xl mb-6">VEHICLE PRICING</h2>

            <div className="space-y-6">
              {vehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="border-b border-construction-lightGray pb-4">
                  <h3 className="font-bold mb-3">{vehicle.name}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase text-construction-mediumGray">Base Charge (₹)</label>
                      <input
                        type="number"
                        value={vehicle.baseCharge}
                        onChange={(e) => handleVehicleUpdate(index, 'baseCharge', parseInt(e.target.value))}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase text-construction-mediumGray">Per KM Rate (₹)</label>
                      <input
                        type="number"
                        value={vehicle.perKmRate}
                        onChange={(e) => handleVehicleUpdate(index, 'perKmRate', parseInt(e.target.value))}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Pricing Table */}
        <div className="bg-white shadow-xl border-l-4 border-construction-yellow p-6 mt-8">
          <h2 className="font-display text-2xl mb-6">PRODUCT PRICING</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-construction-darkGray text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-display">PRODUCT</th>
                  <th className="px-4 py-3 text-left font-display">CATEGORY</th>
                  <th className="px-4 py-3 text-left font-display">BASE PRICE (₹)</th>
                  <th className="px-4 py-3 text-left font-display">UNIT</th>
                  <th className="px-4 py-3 text-left font-display">GST (%)</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-construction-lightGray">
                    <td className="px-4 py-3 font-bold">{product.name}</td>
                    <td className="px-4 py-3 text-sm">{product.category}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={product.basePrice}
                        onChange={(e) => handleProductUpdate(index, 'basePrice', parseInt(e.target.value))}
                        className="w-24 px-2 py-1 border-2 border-construction-mediumGray focus:border-construction-yellow"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{product.unit}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={product.gstPercentage}
                        onChange={(e) => handleProductUpdate(index, 'gstPercentage', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border-2 border-construction-mediumGray focus:border-construction-yellow"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-construction-yellow p-6 mt-8">
          <h3 className="font-display text-2xl mb-4">IMPORTANT NOTES</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-construction-darkGray font-bold">•</span>
              <span>Changes are saved in browser's localStorage (not in database)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-construction-darkGray font-bold">•</span>
              <span>Clear browser data will reset all custom pricing</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-construction-darkGray font-bold">•</span>
              <span>For production use, implement a proper backend database</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-construction-darkGray font-bold">•</span>
              <span>Click "Save All Changes" to apply modifications</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Admin;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openWhatsApp } from '../utils/whatsapp';
import PageSEO from '../components/PageSEO';
import { PAGE_SEO, LOCAL_BUSINESS_SCHEMA, SITE } from '../config/seoConfig';

const Calculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    plotArea: '',
    floors: '1',
    constructionType: 'Standard',
    includeGST: true
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const constructionTypes = {
    'Basic': { ratePerSqFt: 1600, description: 'Standard quality materials' },
    'Standard': { ratePerSqFt: 1900, description: 'Premium quality materials' },
    'Premium': { ratePerSqFt: 2200, description: 'High-end materials & finishes' }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateMaterials = () => {
    const plotArea = parseFloat(formData.plotArea);
    const floors = parseInt(formData.floors);
    
    if (!plotArea || plotArea <= 0 || plotArea > 50000) {
      alert('Please enter a valid plot area (1-50,000 sq.ft)');
      return;
    }

    if (!floors || floors < 1 || floors > 10) {
      alert('Please select floors between 1-10');
      return;
    }

    setLoading(true);

    // Simulate calculation delay
    setTimeout(() => {
      const builtUpArea = plotArea * floors;
      const ratePerSqFt = constructionTypes[formData.constructionType].ratePerSqFt;
      const baseCost = builtUpArea * ratePerSqFt;

      // Material quantities (approximate)
      const cement = Math.round(builtUpArea * 0.4); // bags
      const steel = Math.round(builtUpArea * 3.5); // kg
      const sand = Math.round(builtUpArea * 0.0005 * 100) / 100; // tons
      const bricks = Math.round(builtUpArea * 60); // pieces

      // Material costs (approximate)
      const cementCost = cement * 380;
      const steelCost = steel * 65;
      const sandCost = sand * 1800;
      const bricksCost = bricks * 8;

      const materialTotal = cementCost + steelCost + sandCost + bricksCost;
      const laborCost = baseCost * 0.3;
      const gst = formData.includeGST ? (materialTotal * 0.18) : 0;
      const grandTotal = baseCost + materialTotal + laborCost + gst;

      setResults({
        builtUpArea,
        baseCost,
        materials: {
          cement: { quantity: cement, cost: cementCost },
          steel: { quantity: steel, cost: steelCost },
          sand: { quantity: sand, cost: sandCost },
          bricks: { quantity: bricks, cost: bricksCost }
        },
        materialTotal,
        laborCost,
        gst,
        grandTotal
      });

      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setFormData({
      plotArea: '',
      floors: '1',
      constructionType: 'Standard',
      includeGST: true
    });
    setResults(null);
  };
  
  /**
   * Handle Get Quote - Opens WhatsApp with calculation details
   */
  const handleGetQuote = () => {
    if (!results) {
      alert('Please calculate first to get a quote');
      return;
    }
    
    // Format dimensions
    const dimensions = `${formData.plotArea} sq.ft × ${formData.floors} floors = ${results.builtUpArea} sq.ft built-up`;
    
    // Format materials
    const materialsList = `Cement: ${results.materials.cement.quantity} bags, Steel: ${results.materials.steel.quantity} kg, Sand: ${results.materials.sand.quantity} tons, Bricks: ${results.materials.bricks.quantity.toLocaleString()} pieces`;
    
    // Open WhatsApp with calculation details
    openWhatsApp({
      product: `${formData.constructionType} Construction`,
      dimensions: dimensions,
      quantity: materialsList,
      total: results.grandTotal.toLocaleString()
    });
  };

  return (
    <>
      <PageSEO
        config={PAGE_SEO.calculator}
        schemas={[LOCAL_BUSINESS_SCHEMA]}
        breadcrumbs={[{ name: 'Home', url: SITE.url }, { name: 'Calculator', url: SITE.url + '/calculator' }]}
      />
      <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-construction-yellow to-construction-orange text-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">
              Material Calculator
            </h1>
            <p className="text-xl md:text-2xl font-semibold">
              Estimate construction materials & costs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-white border-3 border-neutral-900 p-8">
            <h2 className="text-2xl font-black uppercase mb-6 text-neutral-900">
              Project Details
            </h2>

            <div className="space-y-6">
              {/* Plot Area */}
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-900 uppercase">
                  Plot Area (sq.ft) *
                </label>
                <input
                  type="number"
                  name="plotArea"
                  value={formData.plotArea}
                  onChange={handleChange}
                  placeholder="Enter plot area"
                  className="w-full px-4 py-3 border-2 border-neutral-300 focus:border-construction-yellow focus:outline-none"
                  min="1"
                  max="50000"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Maximum 50,000 sq.ft
                </p>
              </div>

              {/* Floors */}
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-900 uppercase">
                  Number of Floors *
                </label>
                <select
                  name="floors"
                  value={formData.floors}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-neutral-300 focus:border-construction-yellow focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {/* Construction Type */}
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-900 uppercase">
                  Construction Type *
                </label>
                <div className="space-y-3">
                  {Object.entries(constructionTypes).map(([type, details]) => (
                    <label
                      key={type}
                      className={`block p-4 border-2 cursor-pointer transition-all ${
                        formData.constructionType === type
                          ? 'border-construction-yellow bg-construction-yellow'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="constructionType"
                        value={type}
                        checked={formData.constructionType === type}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <span className="font-bold">{type}</span>
                      <span className="text-sm text-neutral-600 ml-2">
                        (₹{details.ratePerSqFt}/sq.ft)
                      </span>
                      <p className="text-xs text-neutral-500 ml-7 mt-1">
                        {details.description}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Include GST */}
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="includeGST"
                    checked={formData.includeGST}
                    onChange={handleChange}
                    className="w-5 h-5 text-construction-yellow"
                  />
                  <span className="ml-3 font-bold text-neutral-900">
                    Include GST (18%)
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={calculateMaterials}
                  disabled={loading}
                  className={`flex-1 py-3 px-6 font-bold uppercase border-3 border-neutral-900 transition-all ${
                    loading
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-construction-yellow hover:bg-construction-orange text-neutral-900'
                  }`}
                >
                  {loading ? 'Calculating...' : 'Calculate'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border-3 border-neutral-900 bg-white hover:bg-neutral-100 font-bold uppercase transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {results ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-construction-yellow border-3 border-neutral-900 p-8">
                  <h3 className="text-3xl font-black uppercase mb-4 text-neutral-900">
                    Total Estimate
                  </h3>
                  <div className="text-5xl font-black text-neutral-900 mb-2">
                    ₹{results.grandTotal.toLocaleString()}
                  </div>
                  <p className="text-neutral-700">
                    For {results.builtUpArea.toLocaleString()} sq.ft built-up area
                  </p>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white border-3 border-neutral-900 p-6">
                  <h4 className="text-xl font-black uppercase mb-4 text-neutral-900">
                    Cost Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-neutral-200">
                      <span>Base Construction</span>
                      <span className="font-bold">₹{results.baseCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-200">
                      <span>Materials</span>
                      <span className="font-bold">₹{results.materialTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-200">
                      <span>Labor</span>
                      <span className="font-bold">₹{results.laborCost.toLocaleString()}</span>
                    </div>
                    {results.gst > 0 && (
                      <div className="flex justify-between py-2 border-b border-neutral-200">
                        <span>GST (18%)</span>
                        <span className="font-bold">₹{results.gst.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Material Requirements */}
                <div className="bg-white border-3 border-neutral-900 p-6">
                  <h4 className="text-xl font-black uppercase mb-4 text-neutral-900">
                    Material Requirements
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Cement</div>
                        <div className="text-sm text-neutral-600">
                          {results.materials.cement.quantity} bags
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{results.materials.cement.cost.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Steel/TMT</div>
                        <div className="text-sm text-neutral-600">
                          {results.materials.steel.quantity} kg
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{results.materials.steel.cost.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Sand</div>
                        <div className="text-sm text-neutral-600">
                          {results.materials.sand.quantity} tons
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{results.materials.sand.cost.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Bricks</div>
                        <div className="text-sm text-neutral-600">
                          {results.materials.bricks.quantity.toLocaleString()} pieces
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{results.materials.bricks.cost.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleGetQuote}
                    className="w-full py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white border-3 border-neutral-900 font-bold uppercase transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Get Quote on WhatsApp
                  </button>
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full py-4 bg-white hover:bg-neutral-100 border-3 border-neutral-900 font-bold uppercase transition-all"
                  >
                    Browse Products
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border-3 border-neutral-900 p-12 text-center">
                <div className="text-6xl mb-4">📐</div>
                <h3 className="text-xl font-bold mb-2 text-neutral-900">
                  Ready to Calculate
                </h3>
                <p className="text-neutral-600">
                  Fill in your project details and click "Calculate" to get an instant estimate
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-yellow-50 border-l-4 border-construction-yellow p-6">
          <p className="text-sm text-neutral-700">
            <strong>Note:</strong> This is an approximate estimate based on average market rates. 
            Actual costs may vary based on location, material quality, labor rates, and project specifications. 
            For an accurate quote, please contact our team.
          </p>
        </div>
      </div>
    </div>
    </>
  );

};

export default Calculator;

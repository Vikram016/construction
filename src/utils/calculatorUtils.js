// Construction rate constants (configurable)
export const CONSTRUCTION_RATES = {
  basic: 1600,
  standard: 1900,
  premium: 2200
};

// Material estimation per sq.ft
export const MATERIAL_PER_SQFT = {
  cement: 0.4,    // bags
  steel: 3.5,     // kg
  sand: 0.5,      // tons
  bricks: 60      // pieces
};

// Material base prices (can be fetched from products.js)
export const MATERIAL_PRICES = {
  cement: 380,    // per bag
  steel: 65,      // per kg
  sand: 800,      // per ton
  bricks: 8       // per piece
};

// Transport rates based on distance
export const TRANSPORT_RATES = {
  nearby: { max: 5, cost: 200 },
  medium: { max: 15, cost: 500 },
  far: { cost: 1000 }
};

// GST rate
export const GST_RATE = 0.18;

// Calculate built-up area
export const calculateBuiltUpArea = (plotArea, floors) => {
  return plotArea * floors;
};

// Calculate base cost
export const calculateBaseCost = (builtUpArea, constructionType) => {
  const rate = CONSTRUCTION_RATES[constructionType] || CONSTRUCTION_RATES.basic;
  return builtUpArea * rate;
};

// Calculate material quantities
export const calculateMaterialQuantities = (builtUpArea) => {
  return {
    cement: Math.ceil(builtUpArea * MATERIAL_PER_SQFT.cement),
    steel: Math.ceil(builtUpArea * MATERIAL_PER_SQFT.steel),
    sand: parseFloat((builtUpArea * MATERIAL_PER_SQFT.sand).toFixed(2)),
    bricks: Math.ceil(builtUpArea * MATERIAL_PER_SQFT.bricks)
  };
};

// Calculate material costs
export const calculateMaterialCosts = (quantities) => {
  return {
    cement: quantities.cement * MATERIAL_PRICES.cement,
    steel: quantities.steel * MATERIAL_PRICES.steel,
    sand: quantities.sand * MATERIAL_PRICES.sand,
    bricks: quantities.bricks * MATERIAL_PRICES.bricks
  };
};

// Calculate transport cost based on distance
export const calculateTransportCost = (distanceKm) => {
  if (distanceKm <= TRANSPORT_RATES.nearby.max) {
    return TRANSPORT_RATES.nearby.cost;
  } else if (distanceKm <= TRANSPORT_RATES.medium.max) {
    return TRANSPORT_RATES.medium.cost;
  } else {
    return TRANSPORT_RATES.far.cost;
  }
};

// Calculate total estimate
export const calculateTotalEstimate = (baseCost, materialCosts, transportCost, includeGST) => {
  const materialTotal = Object.values(materialCosts).reduce((sum, cost) => sum + cost, 0);
  const subtotal = baseCost + materialTotal + transportCost;
  const gst = includeGST ? subtotal * GST_RATE : 0;
  const grandTotal = subtotal + gst;

  return {
    baseCost,
    materialTotal,
    transportCost,
    subtotal,
    gst,
    grandTotal
  };
};

// Format currency
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Generate estimate ID
export const generateEstimateId = () => {
  return `EST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

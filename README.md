# BuildMart - Construction Materials Ordering System

A modern React application for ordering construction materials with WhatsApp integration, distance-based transport calculation, and GST billing.

## 🏗️ Features

### Core Functionality
- **Product Catalog**: Browse Cement, Steel, Bricks, Sand & Aggregates
- **Distance Calculator**: Google Maps Distance Matrix API integration for real-time distance calculation
- **Transport Calculator**: Auto-selects vehicle (Mini Truck, Lorry, Tipper) based on weight
- **GST Calculation**: Automatic GST calculation per product category
- **WhatsApp Ordering**: Direct order placement via pre-filled WhatsApp messages
- **Payment Links**: External payment integration (UPI/Razorpay/Stripe)
- **Admin Dashboard**: Manage pricing, GST rates, vehicle charges, and configuration

### Technical Features
- React 18 with functional components and hooks
- React Router for navigation
- Tailwind CSS for styling with industrial theme
- Custom hooks for business logic
- Environment variable configuration
- LocalStorage for admin settings
- Responsive mobile-first design

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm

### Setup Steps

1. **Clone/Download the project**
   ```bash
   cd construction-materials-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` and update values:
   ```env
   # Google Maps API Key (get from Google Cloud Console)
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   
   # Warehouse Location (your business location)
   VITE_WAREHOUSE_LAT=28.6139
   VITE_WAREHOUSE_LNG=77.2090
   
   # WhatsApp Business Number (no + or spaces)
   VITE_WHATSAPP_NUMBER=919876543210
   
   # Admin Password
   VITE_ADMIN_PASSWORD=your_secure_password
   
   # Payment Details
   VITE_UPI_ID=yourname@upi
   VITE_RAZORPAY_LINK=https://rzp.io/l/your-payment-link
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

5. **Build for production**
   ```bash
   npm run build
   ```
   Production files will be in `dist/` folder

## 🔑 Getting Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Distance Matrix API**
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key to `.env` file
6. (Optional) Restrict key to Distance Matrix API and your domain

**Important**: The current implementation calls Google Maps API from the client side. For production, you should proxy API calls through your backend to secure the API key.

## 🗂️ Project Structure

```
construction-materials-app/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation header
│   │   ├── Footer.jsx          # Site footer
│   │   └── ProductCard.jsx     # Product display card
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Products.jsx        # Product listing
│   │   ├── ProductDetail.jsx   # Product detail + calculator
│   │   ├── Contact.jsx         # Contact information
│   │   └── Admin.jsx           # Admin dashboard
│   ├── hooks/
│   │   ├── useDistanceCalculator.js  # Distance calculation logic
│   │   ├── useTransportCalculator.js # Transport pricing logic
│   │   └── useGSTCalculator.js       # GST calculation logic
│   ├── data/
│   │   └── products.js         # Product and vehicle data
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── public/
├── .env.example               # Environment variables template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Design System

### Colors
- **Yellow** (#FDB913): Primary CTA, highlights
- **Dark Gray** (#2C2C2C): Headers, text
- **Medium Gray** (#4A4A4A): Secondary elements
- **Light Gray** (#E5E5E5): Backgrounds
- **Orange** (#FF6B35): Accents

### Typography
- **Display Font**: Bebas Neue (headings)
- **Body Font**: Roboto Condensed

## 📱 User Flow

1. **Browse Products** → User views product catalog
2. **Select Product** → Click product to see details
3. **Enter Quantity** → Specify amount needed
4. **Enter Location** → Add delivery address/pincode
5. **Calculate Distance** → System calculates road distance
6. **View Quote** → See material cost, GST, transport breakdown
7. **Order on WhatsApp** → Pre-filled message sent to WhatsApp
8. **Confirm on WhatsApp** → Business confirms final pricing
9. **Make Payment** → User pays via UPI/payment link
10. **Share Confirmation** → Send payment proof on WhatsApp

## 🔧 Admin Dashboard

Access: `/admin`

Default password: `admin123` (change in `.env`)

**Features:**
- Update product prices and GST rates
- Modify vehicle base charges and per-km rates
- Update WhatsApp number and payment links
- All changes saved to browser localStorage

**Note**: Current implementation uses localStorage. For production, implement a proper backend database.

## 📊 Pricing Calculation

### Material Cost
```
Material Cost = Base Price × Quantity
```

### GST Calculation
```
GST Amount = Material Cost × (GST % / 100)
Total with GST = Material Cost + GST Amount
```

### Transport Calculation
```
1. Estimate Weight (kg)
   - Cement: Quantity × 50kg
   - Steel: Quantity (already in kg)
   - Bricks: Quantity × 3kg
   - Sand/Aggregates: Quantity × 1000kg (ton to kg)

2. Select Vehicle
   - Mini Truck: Up to 1000kg
   - Lorry: 1000kg - 5000kg
   - Tipper: 5000kg - 15000kg

3. Calculate Transport Cost
   Transport Cost = Base Charge + (Distance × Per KM Rate)
```

### Total Estimate
```
Estimated Total = Material Cost + GST + Transport Cost
```

## 🔒 Security Considerations

**Current Implementation (Development):**
- Google Maps API key exposed in client-side code
- Admin password in environment variables
- LocalStorage for data persistence

**Production Recommendations:**
1. **Backend API**: Create a Node.js/Express backend to:
   - Proxy Google Maps API calls
   - Secure admin authentication with JWT
   - Store data in MongoDB/PostgreSQL
   - Handle payment webhooks

2. **Environment Security**:
   - Never commit `.env` to version control
   - Use server-side environment variables
   - Implement rate limiting on APIs

3. **Payment Integration**:
   - Use Razorpay/Stripe webhooks for payment confirmation
   - Store order data in database
   - Send email notifications

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Environment Variables
Don't forget to set environment variables in your hosting platform:
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_WAREHOUSE_LAT`
- `VITE_WAREHOUSE_LNG`
- `VITE_WHATSAPP_NUMBER`
- `VITE_ADMIN_PASSWORD`
- `VITE_UPI_ID`
- `VITE_RAZORPAY_LINK`

## 📝 Customization

### Adding New Products
Edit `src/data/products.js`:
```javascript
{
  id: "unique-id",
  category: "Category Name",
  name: "Product Name",
  basePrice: 500,
  unit: "bag/kg/ton/piece",
  gstPercentage: 18,
  description: "Product description",
  image: "image-url"
}
```

### Modifying Vehicle Types
Edit `src/data/products.js`:
```javascript
{
  id: "vehicle-id",
  name: "Vehicle Name",
  maxCapacity: 5000,  // in kg
  baseCharge: 1200,   // base cost
  perKmRate: 18,      // per km rate
  description: "Weight range"
}
```

### Changing Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  construction: {
    yellow: '#FDB913',
    darkGray: '#2C2C2C',
    // Add your custom colors
  }
}
```

## 🐛 Troubleshooting

### Distance calculation not working
- Verify Google Maps API key is correct
- Enable Distance Matrix API in Google Cloud Console
- Check browser console for errors
- Ensure API key has no domain restrictions during development

### WhatsApp not opening
- Verify WhatsApp number format: country code + number (no + or spaces)
- Example: `919876543210` not `+91 98765 43210`

### Admin login not working
- Check `.env` file has `VITE_ADMIN_PASSWORD`
- Restart dev server after changing `.env`
- Clear browser cache

## 📞 Support

For issues or questions:
- Check the code comments in source files
- Review this README thoroughly
- Verify environment variables are set correctly

## 📄 License

This project is created as a custom construction materials ordering system. Modify and use as needed for your business.

## 🎯 Future Enhancements

**Suggested improvements for production:**
1. Backend API with database (Node.js + MongoDB/PostgreSQL)
2. User authentication and order history
3. Real-time inventory management
4. SMS notifications for order updates
5. Multi-language support
6. Analytics dashboard
7. Customer reviews and ratings
8. Bulk order discounts calculator
9. Invoice generation (PDF)
10. Integration with accounting software

---

**Built with:** React + Vite + Tailwind CSS + Google Maps API

**Ready to use:** Just configure your environment variables and deploy!

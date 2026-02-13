# Quick Setup Guide - BuildMart

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd construction-materials-app
npm install
```

### Step 2: Configure Environment
Create `.env` file in the root directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_WAREHOUSE_LAT=28.6139
VITE_WAREHOUSE_LNG=77.2090
VITE_WHATSAPP_NUMBER=919876543210
VITE_ADMIN_PASSWORD=admin123
VITE_UPI_ID=business@upi
VITE_RAZORPAY_LINK=https://rzp.io/l/payment-link
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open http://localhost:5173

### Step 4: Test the Application

1. **Browse Products**: Go to "Products" page
2. **Get Quote**: Click any product → Enter quantity → Add address
3. **Calculate Distance**: Click "Calculate Distance & Transport"
4. **Order**: Click "ORDER ON WHATSAPP" (opens WhatsApp with pre-filled message)
5. **Admin**: Go to `/admin` → Login with password from .env

---

## 🔑 Getting Google Maps API Key (Required for Distance Calculation)

### Method 1: Google Cloud Console
1. Visit https://console.cloud.google.com/
2. Create project or select existing
3. Click "APIs & Services" → "Enable APIs and Services"
4. Search "Distance Matrix API" → Enable it
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy the API key
7. Paste in `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

### Method 2: Without API Key (Fallback Mode)
- App will use fallback distance estimation (15km default)
- Perfect for testing/demo without Google Maps costs
- Just leave `VITE_GOOGLE_MAPS_API_KEY` empty in `.env`

---

## 📱 WhatsApp Number Format

**Correct Format**: `919876543210`
- Country code + number
- No `+` symbol
- No spaces
- No hyphens

**Examples:**
- India: `919876543210` ✅
- USA: `19876543210` ✅
- UK: `447700900000` ✅

**Wrong formats:**
- `+91 98765 43210` ❌
- `+91-9876543210` ❌
- `91 9876543210` ❌

---

## 🎯 Testing Checklist

- [ ] Home page loads with products
- [ ] Navigate to Products page
- [ ] Click on a product to see details
- [ ] Change quantity
- [ ] Enter delivery address
- [ ] Click "Calculate Distance" (works if API key configured)
- [ ] See cost breakdown (Material + GST + Transport)
- [ ] Click "ORDER ON WHATSAPP" (opens WhatsApp)
- [ ] Go to `/admin`
- [ ] Login with admin password
- [ ] Change a product price
- [ ] Click "Save All Changes"
- [ ] Go back to product page and verify new price

---

## 🛠️ Common Issues & Solutions

### Issue: "Cannot find module" error
**Solution**: Run `npm install` again

### Issue: White screen / Nothing loads
**Solution**: 
1. Check browser console (F12)
2. Verify all files are created
3. Run `npm run dev` again

### Issue: Distance calculator doesn't work
**Solution**: 
1. Check if `VITE_GOOGLE_MAPS_API_KEY` is set
2. Verify API key is valid
3. Enable Distance Matrix API in Google Cloud
4. Or use fallback mode (app works without API)

### Issue: WhatsApp doesn't open
**Solution**:
1. Verify number format (no + or spaces)
2. Use correct country code
3. Example: `919876543210` for India

### Issue: Admin login fails
**Solution**:
1. Check `.env` has `VITE_ADMIN_PASSWORD`
2. Restart dev server after changing .env
3. Default is `admin123`

### Issue: Changes not reflected
**Solution**: 
1. Hard refresh browser (Ctrl + Shift + R)
2. Clear browser cache
3. Restart dev server

---

## 📦 Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

Production files will be in `dist/` folder - ready to deploy!

---

## 🌐 Deployment (Free Options)

### Vercel (Recommended)
1. Create account at vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. Run: `vercel`
4. Add environment variables in Vercel dashboard

### Netlify
1. Create account at netlify.com
2. Install Netlify CLI: `npm i -g netlify-cli`
3. Run: `netlify deploy --prod`
4. Add environment variables in Netlify dashboard

### GitHub Pages (Static only)
1. Build: `npm run build`
2. Deploy `dist/` folder to GitHub Pages

**Remember**: Add all environment variables in your hosting platform!

---

## ✅ You're All Set!

Your construction materials ordering system is ready. 

**Next steps:**
1. Customize products in `src/data/products.js`
2. Update company info in Header/Footer
3. Add your logo
4. Configure actual WhatsApp business number
5. Set up payment links (Razorpay/UPI)
6. Deploy to production

Need help? Check the main README.md for detailed documentation.

---

**Questions?** Review the code - it's well-commented and organized!

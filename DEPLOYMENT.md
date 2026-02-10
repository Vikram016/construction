# Deployment Guide - BuildMart Construction Materials App

## 📋 Pre-Deployment Checklist

### Required Configurations
- [ ] Google Maps API Key obtained and configured
- [ ] WhatsApp Business Number verified
- [ ] Payment gateway set up (UPI/Razorpay/Stripe)
- [ ] Warehouse location coordinates confirmed
- [ ] Admin password changed from default
- [ ] All environment variables documented

### Optional Customizations
- [ ] Company logo added
- [ ] Product catalog updated with actual inventory
- [ ] Pricing verified and finalized
- [ ] Transport rates confirmed
- [ ] GST rates verified per current regulations

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Free Tier Available)

**Advantages:**
- Zero configuration deployment
- Automatic HTTPS
- Global CDN
- Easy environment variable management
- Continuous deployment from Git

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd construction-materials-app
   vercel
   ```

4. **Add Environment Variables**
   - Go to your project dashboard on vercel.com
   - Navigate to Settings → Environment Variables
   - Add each variable:
     ```
     VITE_GOOGLE_MAPS_API_KEY
     VITE_WAREHOUSE_LAT
     VITE_WAREHOUSE_LNG
     VITE_WHATSAPP_NUMBER
     VITE_ADMIN_PASSWORD
     VITE_UPI_ID
     VITE_RAZORPAY_LINK
     ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

**Custom Domain:**
- In Vercel dashboard → Settings → Domains
- Add your domain and follow DNS configuration steps

---

### Option 2: Netlify (Alternative - Free Tier Available)

**Steps:**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Configure Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all VITE_* variables

**Alternative: Git-based deployment**
1. Push code to GitHub
2. Connect repository in Netlify dashboard
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

---

### Option 3: Traditional Web Hosting (Shared Hosting)

**Steps:**

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Upload files**
   - Upload entire `dist/` folder to your web server
   - Ensure all files maintain their directory structure

3. **Configure .htaccess** (for Apache)
   Create `.htaccess` in dist folder:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. **Environment Variables**
   - Since this is client-side, variables are baked into build
   - Update `.env` file before building
   - Rebuild and reupload when environment changes

---

### Option 4: AWS S3 + CloudFront

**For larger scale deployments**

1. **Build**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - Name it (e.g., buildmart-app)
   - Enable static website hosting
   - Upload dist/ contents

3. **Configure CloudFront**
   - Create distribution pointing to S3 bucket
   - Enable HTTPS
   - Configure custom domain

4. **Set up CI/CD** (Optional)
   - Use GitHub Actions or AWS CodePipeline
   - Auto-deploy on push to main branch

---

## 🔒 Security Hardening for Production

### 1. API Key Security

**Problem**: Google Maps API key is exposed in client-side code

**Solution**: Create a backend proxy

Example Node.js proxy:
```javascript
// backend/server.js
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/distance', async (req, res) => {
  const { origin, destination } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Server-side only
  
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`,
      {
        params: { origins: origin, destinations: destination, key: apiKey }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Distance calculation failed' });
  }
});

app.listen(3000);
```

Then update frontend to call `/api/distance` instead of Google directly.

### 2. Environment Variable Protection

**Never commit `.env` to version control**

Add to `.gitignore`:
```
.env
.env.*
!.env.example
```

### 3. Admin Authentication Enhancement

Replace localStorage password check with:
- JWT authentication
- Backend session management
- Role-based access control

### 4. Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;">
```

---

## 📊 Production Optimizations

### 1. Image Optimization

Replace placeholder images with optimized CDN images:
```javascript
// Use image CDN like Cloudinary or imgix
const imageUrl = `https://res.cloudinary.com/your-cloud/image/upload/c_fill,w_400,h_300/product-image.jpg`;
```

### 2. Code Splitting

Already handled by Vite, but verify in production:
```bash
npm run build
# Check dist/assets/ for chunked files
```

### 3. Analytics Integration

Add Google Analytics or Mixpanel:
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 4. Performance Monitoring

Use Vercel Analytics or Lighthouse CI for continuous monitoring.

---

## 🗄️ Database Migration (Future Enhancement)

### Current: LocalStorage (Development)
- Data stored in browser
- Lost on cache clear
- No synchronization across devices

### Recommended: Backend + Database

**Tech Stack Options:**

1. **Node.js + MongoDB**
   ```
   Frontend (React) → API (Express) → Database (MongoDB)
   ```

2. **Firebase (Quickest)**
   ```
   Frontend (React) → Firebase (Firestore + Auth)
   ```

3. **Supabase (PostgreSQL)**
   ```
   Frontend (React) → Supabase API → PostgreSQL
   ```

**What to Store:**
- Product catalog
- Pricing rules
- Customer orders
- Admin users
- Order history
- Analytics data

---

## 📱 WhatsApp Business API Integration (Advanced)

For automated order processing:

1. **Register WhatsApp Business API**
   - Apply through Meta Business
   - Or use providers like Twilio, MessageBird

2. **Webhook Integration**
   ```javascript
   // Receive orders automatically
   app.post('/webhook/whatsapp', (req, res) => {
     const { message, from } = req.body;
     // Process order
     // Send confirmation
   });
   ```

3. **Benefits**
   - Automated order confirmation
   - Order tracking updates
   - Payment status notifications

---

## 💳 Payment Gateway Integration

### Razorpay (India)

1. **Create Account** at razorpay.com
2. **Get API Keys** from dashboard
3. **Install SDK**
   ```bash
   npm install razorpay
   ```
4. **Create Payment Link API**
   ```javascript
   const Razorpay = require('razorpay');
   const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_KEY_SECRET
   });
   
   const paymentLink = await razorpay.paymentLink.create({
     amount: total * 100, // paise
     currency: "INR",
     description: "Order #123",
     customer: {
       name: customerName,
       contact: phone
     }
   });
   ```

### Stripe (International)

Similar integration for global payments.

---

## 🔍 SEO Optimization

### 1. Add Meta Tags

In each page component:
```javascript
import { Helmet } from 'react-helmet';

<Helmet>
  <title>Buy Cement Online | BuildMart Construction Materials</title>
  <meta name="description" content="Order premium cement, steel, bricks online. Fast delivery with transparent pricing." />
  <meta name="keywords" content="cement online, construction materials, buy steel" />
</Helmet>
```

### 2. Generate sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/products</loc>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 3. robots.txt

```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

---

## 📈 Monitoring & Maintenance

### Key Metrics to Track
- Order conversion rate
- Average order value
- Popular products
- Delivery locations (distance distribution)
- WhatsApp response time
- Payment success rate

### Error Monitoring
Use services like:
- Sentry (error tracking)
- LogRocket (session replay)
- Vercel Analytics (performance)

### Regular Maintenance
- [ ] Update product prices monthly
- [ ] Review transport rates quarterly
- [ ] Verify GST rates (on law changes)
- [ ] Update dependencies (npm audit)
- [ ] Backup data regularly
- [ ] Test all user flows weekly

---

## 🆘 Support & Troubleshooting

### Common Production Issues

**Issue: API rate limits exceeded**
- Solution: Implement request caching
- Add rate limiting on backend proxy

**Issue: Slow initial load**
- Solution: Implement code splitting
- Use lazy loading for routes
- Optimize images

**Issue: Mobile performance**
- Solution: Reduce bundle size
- Remove unused dependencies
- Use Lighthouse for optimization tips

---

## 📞 Go-Live Checklist

Final checks before launching:

- [ ] Test complete user flow (browse → order → payment)
- [ ] Verify WhatsApp messages format correctly
- [ ] Test on mobile devices (iOS + Android)
- [ ] Test on multiple browsers
- [ ] Set up error monitoring
- [ ] Configure Google Analytics
- [ ] Set up automated backups
- [ ] Test admin dashboard
- [ ] Verify all links work
- [ ] Check HTTPS is enabled
- [ ] Test payment flow end-to-end
- [ ] Prepare customer support process
- [ ] Document admin procedures
- [ ] Train staff on order processing

---

## 🎉 Launch Strategy

1. **Soft Launch** (Week 1)
   - Limited announcement
   - Monitor closely
   - Gather feedback
   - Fix any issues

2. **Marketing Launch** (Week 2+)
   - Social media announcement
   - WhatsApp broadcast to customers
   - Local advertising
   - Special launch offers

3. **Optimization** (Ongoing)
   - Review analytics
   - A/B test pricing display
   - Optimize user flow
   - Add requested features

---

**Ready to deploy?** Choose your platform and follow the steps above!

Need a backend? Consider hiring a developer to implement the security enhancements and database integration.

Good luck with your launch! 🚀

# API Integration Reference

## 🗺️ Google Maps Distance Matrix API

### Overview
Calculates real road distance between warehouse and delivery location.

### Setup
1. **Enable API**: Google Cloud Console → APIs & Services → Enable "Distance Matrix API"
2. **Create Key**: Credentials → Create API Key
3. **Restrict Key** (Recommended):
   - API restrictions: Distance Matrix API only
   - Application restrictions: HTTP referrers (websites)
   - Add your domain: `yourdomain.com/*`

### Current Implementation

```javascript
// src/hooks/useDistanceCalculator.js
const url = `https://maps.googleapis.com/maps/api/distancematrix/json?
  origins=${origin}&
  destinations=${destination}&
  key=${apiKey}`;
```

### API Response Structure
```json
{
  "status": "OK",
  "rows": [{
    "elements": [{
      "status": "OK",
      "distance": {
        "value": 15000,        // meters
        "text": "15 km"
      },
      "duration": {
        "value": 1800,         // seconds
        "text": "30 mins"
      }
    }]
  }]
}
```

### Error Handling
```javascript
// Fallback when API fails
return {
  distance: 15,
  distanceText: '15 km (estimated)',
  duration: '30 mins (estimated)',
  isFallback: true
};
```

### Cost Optimization

**Free Tier**: $200 credit monthly (~40,000 requests)

**Pricing** (as of 2024): $0.005 per request

**Optimization Strategies**:
1. **Cache results** by location
2. **Batch requests** for multiple orders
3. **Use fallback** for testing
4. **Rate limit** calculations

Example caching:
```javascript
const cache = new Map();

const getCachedDistance = (destination) => {
  const cacheKey = destination.toLowerCase().trim();
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await calculateDistance(destination);
  cache.set(cacheKey, result);
  return result;
};
```

---

## 💬 WhatsApp Integration

### Current Implementation: URL Scheme

```javascript
const message = encodeURIComponent(`
*ORDER INQUIRY - BUILDMART*
Product: ${productName}
Quantity: ${quantity}
...
`);

const url = `https://wa.me/${whatsappNumber}?text=${message}`;
window.open(url, '_blank');
```

### Message Format Best Practices

**Good Message Structure**:
```
*ORDER INQUIRY*

Product: ACC Cement OPC 53
Quantity: 100 bags

📍 Delivery: 123 Main St, Delhi
📮 PIN: 110001
🚗 Distance: 12 km

💰 Material: ₹38,000
📄 GST (28%): ₹10,640
🚚 Transport: ₹744

TOTAL: ₹49,384

GST Invoice: Yes
```

**Why this works**:
- Clear headers with emojis
- Structured information
- Easy to read on mobile
- All details in one message

### WhatsApp Business API (Advanced)

For automated order processing:

**Providers**:
- Twilio WhatsApp API
- MessageBird
- 360Dialog
- Gupshup

**Example with Twilio**:

```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

// Send order confirmation
await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${customerNumber}`,
  body: `Thank you for your order! 
  
Order ID: #12345
Total: ₹49,384

We will confirm delivery within 2 hours.`
});
```

**Benefits**:
- Automated confirmations
- Order tracking
- Payment reminders
- Delivery updates

---

## 💳 Payment Gateway Integration

### Option 1: Razorpay (India)

**Setup**:
1. Register at razorpay.com
2. Complete KYC verification
3. Get API keys from dashboard

**Create Payment Link**:
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const paymentLink = await razorpay.paymentLink.create({
  amount: 49384 * 100, // Convert to paise
  currency: "INR",
  description: "Order #12345 - Cement Delivery",
  customer: {
    name: "John Doe",
    email: "john@example.com",
    contact: "9876543210"
  },
  notify: {
    sms: true,
    email: true,
    whatsapp: true
  },
  callback_url: "https://yourdomain.com/payment-success",
  callback_method: "get"
});

// paymentLink.short_url -> Send to customer
```

**Webhook Handler**:
```javascript
app.post('/webhook/razorpay', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');
  
  if (digest === req.headers['x-razorpay-signature']) {
    // Payment verified
    const { event, payload } = req.body;
    
    if (event === 'payment.captured') {
      // Update order status
      // Send WhatsApp confirmation
      // Generate invoice
    }
  }
  
  res.json({ status: 'ok' });
});
```

### Option 2: Stripe (International)

**Setup**:
```bash
npm install stripe
```

**Create Checkout Session**:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'upi'],
  line_items: [{
    price_data: {
      currency: 'inr',
      product_data: {
        name: 'ACC Cement OPC 53',
        description: '100 bags with delivery'
      },
      unit_amount: 49384 * 100, // Convert to smallest currency unit
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://yourdomain.com/cancel',
});

// Redirect to session.url
```

### Option 3: UPI Direct Links

**Generate UPI Intent**:
```javascript
const generateUPILink = (upiId, amount, orderId) => {
  const upiUrl = `upi://pay?pa=${upiId}&pn=BuildMart&am=${amount}&cu=INR&tn=Order%20${orderId}`;
  return upiUrl;
};

// Usage
const upiLink = generateUPILink('buildmart@paytm', 49384, '12345');
```

**QR Code Generation**:
```bash
npm install qrcode
```

```javascript
const QRCode = require('qrcode');

const upiString = `upi://pay?pa=buildmart@paytm&pn=BuildMart&am=49384&cu=INR&tn=Order12345`;
const qrCode = await QRCode.toDataURL(upiString);

// Display qrCode image to customer
```

---

## 📧 Email Notifications

### SendGrid Integration

```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOrderConfirmation = async (orderDetails) => {
  const msg = {
    to: orderDetails.customerEmail,
    from: 'orders@buildmart.com',
    subject: `Order Confirmation #${orderDetails.orderId}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order ID: ${orderDetails.orderId}</p>
      <p>Total Amount: ₹${orderDetails.total}</p>
      <p>Expected Delivery: ${orderDetails.deliveryDate}</p>
    `
  };
  
  await sgMail.send(msg);
};
```

---

## 📊 Analytics Integration

### Google Analytics 4

**Setup**:
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Track Events**:
```javascript
// Track product view
gtag('event', 'view_item', {
  items: [{
    item_id: product.id,
    item_name: product.name,
    price: product.basePrice,
    item_category: product.category
  }]
});

// Track add to quote
gtag('event', 'add_to_cart', {
  items: [{
    item_id: product.id,
    item_name: product.name,
    quantity: quantity,
    price: totalPrice
  }]
});

// Track WhatsApp order
gtag('event', 'begin_checkout', {
  value: estimatedTotal,
  currency: 'INR'
});
```

### Mixpanel (Alternative)

```bash
npm install mixpanel-browser
```

```javascript
import mixpanel from 'mixpanel-browser';
mixpanel.init('YOUR_PROJECT_TOKEN');

// Track events
mixpanel.track('Product Viewed', {
  'Product Name': product.name,
  'Price': product.basePrice,
  'Category': product.category
});

mixpanel.track('Quote Generated', {
  'Product': product.name,
  'Quantity': quantity,
  'Distance': distance,
  'Total Amount': estimatedTotal
});
```

---

## 📱 SMS Notifications (Optional)

### Twilio SMS

```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

const sendOrderSMS = async (phone, orderId, total) => {
  await client.messages.create({
    body: `BuildMart: Your order #${orderId} of ₹${total} has been confirmed. We'll deliver soon!`,
    from: '+1234567890',
    to: phone
  });
};
```

### MSG91 (India)

```javascript
const axios = require('axios');

const sendSMS = async (phone, message) => {
  await axios.post('https://api.msg91.com/api/v5/flow/', {
    authkey: process.env.MSG91_AUTH_KEY,
    mobiles: phone,
    message: message
  });
};
```

---

## 🔔 Push Notifications

### Firebase Cloud Messaging

```bash
npm install firebase
```

```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission
const token = await getToken(messaging, {
  vapidKey: 'YOUR_PUBLIC_VAPID_KEY'
});

// Send notification from backend
const admin = require('firebase-admin');
admin.initializeApp();

await admin.messaging().send({
  token: userToken,
  notification: {
    title: 'Order Delivered!',
    body: 'Your cement order has been delivered.'
  }
});
```

---

## 🗄️ Database Integration Examples

### MongoDB with Mongoose

```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: String,
  product: {
    id: String,
    name: String,
    price: Number,
    quantity: Number
  },
  customer: {
    name: String,
    phone: String,
    address: String,
    pincode: String
  },
  delivery: {
    distance: Number,
    transportCost: Number,
    vehicleType: String
  },
  pricing: {
    materialCost: Number,
    gstAmount: Number,
    transportCost: Number,
    total: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'dispatched', 'delivered'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Create order
const order = new Order({
  orderId: 'ORD12345',
  product: { ... },
  customer: { ... },
  // ... other fields
});
await order.save();
```

### Firebase Firestore

```javascript
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const db = getFirestore();

// Add order
const docRef = await addDoc(collection(db, 'orders'), {
  orderId: 'ORD12345',
  product: { ... },
  customer: { ... },
  timestamp: new Date()
});
```

---

## 🔐 Authentication (If Needed)

### JWT Authentication

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register user
const hashedPassword = await bcrypt.hash(password, 10);
await User.create({ email, password: hashedPassword });

// Login
const user = await User.findOne({ email });
const validPassword = await bcrypt.compare(password, user.password);

if (validPassword) {
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token });
}

// Verify middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = decoded.userId;
    next();
  });
};
```

---

## 📦 Full Backend Example (Express)

Complete backend setup with all integrations:

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

// Routes
app.post('/api/calculate-distance', async (req, res) => {
  // Google Maps API call (server-side)
});

app.post('/api/create-order', async (req, res) => {
  // 1. Save order to database
  // 2. Generate payment link
  // 3. Send WhatsApp message
  // 4. Send email confirmation
});

app.post('/api/webhook/payment', async (req, res) => {
  // Handle payment webhook
  // Update order status
  // Send confirmation
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## 🧪 Testing APIs

### Using Postman/Insomnia

**Test Distance Calculation**:
```
GET https://maps.googleapis.com/maps/api/distancematrix/json
?origins=28.6139,77.2090
&destinations=New+Delhi+110001
&key=YOUR_API_KEY
```

**Test Razorpay**:
```
POST https://api.razorpay.com/v1/payment_links
Authorization: Basic <base64(key_id:key_secret)>
Content-Type: application/json

{
  "amount": 50000,
  "currency": "INR",
  "description": "Test Order"
}
```

---

## 📝 Environment Variables Summary

```env
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=

# Location
VITE_WAREHOUSE_LAT=
VITE_WAREHOUSE_LNG=

# WhatsApp
VITE_WHATSAPP_NUMBER=

# Admin
VITE_ADMIN_PASSWORD=

# Payments
VITE_UPI_ID=
VITE_RAZORPAY_LINK=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Notifications
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Database
MONGODB_URI=

# Auth
JWT_SECRET=
```

---

**Ready to integrate?** Start with the APIs that provide immediate value (Google Maps, WhatsApp), then add payment and notifications as you scale.

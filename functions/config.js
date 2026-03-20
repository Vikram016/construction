/**
 * config.js — Drop-in replacement for functions.config()
 * Maps all old functions.config() keys to process.env variables
 * Place this file in your functions/ folder
 * Then replace: functions.config() with require('./config')()
 */

module.exports = function getConfig() {
  return {
    aws: {
      access_key_id: process.env.AWS_ACCESS_KEY_ID,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "ap-south-1",
      from_email: process.env.SES_FROM_EMAIL || "noreply@anjaneyadealers.com",
    },
    sheets: {
      purchase_webhook: process.env.ORDERS_WEBHOOK,
      inquiry_webhook: process.env.ORDERS_WEBHOOK,
      orders_webhook: process.env.ORDERS_WEBHOOK,
      waste_sand_webhook: process.env.WASTE_SAND_WEBHOOK,
      debris_sand_webhook: process.env.DEBRIS_SAND_WEBHOOK,
      site_clean_webhook: process.env.SITE_CLEAN_WEBHOOK,
    },
    google: {
      places_api_key: process.env.GOOGLE_API_KEY,
      place_id: process.env.GOOGLE_BUSINESS_LOCATION_ID,
      service_account_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
      sheet_id: process.env.GOOGLE_SHEET_ID,
    },
    razorpay: {
      webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    },
    whatsapp: {
      provider: process.env.WHATSAPP_PROVIDER,
      access_token: process.env.WHATSAPP_ACCESS_TOKEN,
      phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID,
      owner_phone: process.env.WHATSAPP_OWNER_PHONE,
      twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
      twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
      twilio_from_number: process.env.TWILIO_FROM_NUMBER,
      wati_api_key: process.env.WATI_API_KEY,
      wati_api_url: process.env.WATI_API_URL,
    },
    admin: {
      email: process.env.ADMIN_EMAIL || "admin@anjaneyadealers.com",
      whatsapp_phone: process.env.WHATSAPP_OWNER_PHONE,
    },
    delivery: {
      third_party_api_url: process.env.THIRD_PARTY_API_URL,
      third_party_api_key: process.env.THIRD_PARTY_API_KEY,
      allow_fallback: process.env.DELIVERY_ALLOW_FALLBACK || "true",
    },
    business: {
      owner_phone: process.env.WHATSAPP_OWNER_PHONE,
    },
  };
};

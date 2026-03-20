// functions/config/serverConfig.js
const CONTACT_CONFIG_SERVER = {
  phone: process.env.CONTACT_PHONE || "",
  email: process.env.CONTACT_EMAIL || "",
  whatsapp: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  businessName: "AnjaneyaDealers",
  website: "https://anjaneyadealers.com",
};

module.exports = { CONTACT_CONFIG_SERVER };

const Contact = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const warehouseLat = import.meta.env.VITE_WAREHOUSE_LAT || '28.6139';
  const warehouseLng = import.meta.env.VITE_WAREHOUSE_LNG || '77.2090';

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-construction-darkGray text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-5xl mb-4">
            CONTACT <span className="text-construction-yellow">US</span>
          </h1>
          <p className="text-construction-lightGray max-w-2xl">
            Get in touch for orders, quotes, or any queries about construction materials
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="bg-white shadow-xl border-l-4 border-construction-yellow p-8 mb-8">
              <h2 className="font-display text-3xl mb-6">GET IN TOUCH</h2>
              
              <div className="space-y-6">
                {/* WhatsApp */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl mb-1">WHATSAPP</h3>
                    <p className="text-construction-mediumGray mb-2">
                      Quick orders and instant support
                    </p>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-block text-sm py-2 px-4"
                    >
                      Message Us
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-construction-yellow flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-construction-darkGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl mb-1">PHONE</h3>
                    <p className="text-construction-mediumGray mb-2">
                      Speak directly with our team
                    </p>
                    <a
                      href={`tel:${whatsappNumber}`}
                      className="btn-secondary inline-block text-sm py-2 px-4"
                    >
                      Call Now
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-construction-orange flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl mb-1">WAREHOUSE</h3>
                    <p className="text-construction-mediumGray">
                      Main Distribution Center<br />
                      Coordinates: {warehouseLat}, {warehouseLng}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-construction-yellow p-8">
              <h3 className="font-display text-2xl mb-4">BUSINESS HOURS</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Monday - Saturday</span>
                  <span>8:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Sunday</span>
                  <span>9:00 AM - 5:00 PM</span>
                </div>
              </div>
              <p className="text-sm mt-4 text-construction-darkGray">
                * WhatsApp orders accepted 24/7
              </p>
            </div>
          </div>

          {/* Map & Features */}
          <div>
            {/* Google Maps Embed */}
            <div className="bg-construction-mediumGray h-96 mb-8 flex items-center justify-center shadow-xl">
              <div className="text-center text-white p-8">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="font-display text-xl">
                  MAP PLACEHOLDER
                </p>
                <p className="text-sm mt-2">
                  Configure Google Maps API to show location
                </p>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white shadow-xl border-t-4 border-construction-yellow p-8">
              <h3 className="font-display text-2xl mb-6">WHY CHOOSE BUILDMART?</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-construction-yellow text-2xl font-bold">✓</span>
                  <div>
                    <h4 className="font-bold mb-1">Transparent Pricing</h4>
                    <p className="text-sm text-construction-mediumGray">
                      Know your costs upfront with our distance-based calculator
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-construction-yellow text-2xl font-bold">✓</span>
                  <div>
                    <h4 className="font-bold mb-1">Quality Guaranteed</h4>
                    <p className="text-sm text-construction-mediumGray">
                      Certified materials from trusted manufacturers
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-construction-yellow text-2xl font-bold">✓</span>
                  <div>
                    <h4 className="font-bold mb-1">Fast Delivery</h4>
                    <p className="text-sm text-construction-mediumGray">
                      Efficient logistics with multiple vehicle options
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-construction-yellow text-2xl font-bold">✓</span>
                  <div>
                    <h4 className="font-bold mb-1">GST Compliance</h4>
                    <p className="text-sm text-construction-mediumGray">
                      Proper invoicing for your business needs
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import { Link } from 'react-router-dom';
import PageSEO from '../components/PageSEO';
import { PAGE_SEO, LOCAL_BUSINESS_SCHEMA, SITE } from '../config/seoConfig';

const About = () => {
  const stats = [
    { number: '10+', label: 'Years in Business' },
    { number: '5000+', label: 'Happy Customers' },
    { number: '50+', label: 'Quality Products' },
    { number: '24/7', label: 'Customer Support' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Quality First',
      description: 'We source only premium-grade construction materials from certified manufacturers.'
    },
    {
      icon: '⚡',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery within 24-48 hours to your construction site.'
    },
    {
      icon: '💰',
      title: 'Best Prices',
      description: 'Competitive pricing with transparent costs and no hidden charges.'
    },
    {
      icon: '🛡️',
      title: 'Trust & Reliability',
      description: 'Trusted by thousands of builders, contractors, and homeowners across India.'
    }
  ];

  const team = [
    {
      name: 'Rajesh Sharma',
      role: 'Founder & CEO',
      image: '👨‍💼',
      description: '15+ years in construction materials industry'
    },
    {
      name: 'Priya Patel',
      role: 'Operations Head',
      image: '👩‍💼',
      description: 'Expert in logistics and supply chain management'
    },
    {
      name: 'Amit Kumar',
      role: 'Quality Manager',
      image: '👨‍🔧',
      description: 'Ensuring premium quality in every delivery'
    }
  ];

  const services = [
    {
      icon: '🚚',
      title: 'Own Delivery Fleet',
      description: 'Direct delivery to your site with our own vehicles'
    },
    {
      icon: '🗑️',
      title: 'Waste Sand Collection',
      description: 'Free site cleanup service for orders above ₹10,000'
    },
    {
      icon: '📱',
      title: 'WhatsApp Support',
      description: 'Instant support and updates via WhatsApp'
    },
    {
      icon: '📊',
      title: 'Cost Calculator',
      description: 'Free construction cost estimation tool'
    },
    {
      icon: '📄',
      title: 'GST Invoices',
      description: 'Proper tax invoices for all your purchases'
    },
    {
      icon: '🎯',
      title: 'Order Tracking',
      description: 'Real-time tracking of your material delivery'
    }
  ];

  return (
    <>
      <PageSEO
        config={PAGE_SEO.about}
        schemas={[LOCAL_BUSINESS_SCHEMA]}
        breadcrumbs={[{ name: 'Home', url: SITE.url }, { name: 'About', url: SITE.url + '/about' }]}
      />
      <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-construction-yellow to-construction-orange text-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">
              About BuildMart
            </h1>
            <p className="text-xl md:text-2xl font-semibold max-w-3xl mx-auto">
              India's Trusted Construction Materials Supplier
            </p>
            <p className="text-lg mt-4 max-w-2xl mx-auto">
              Building dreams with premium materials since 2014
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-construction-yellow mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-neutral-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black uppercase mb-6 text-neutral-900">
                Our Story
              </h2>
              <div className="space-y-4 text-neutral-700">
                <p>
                  Founded in 2014, BuildMart started with a simple vision: to make quality construction materials accessible to everyone. What began as a small warehouse in Bangalore has grown into one of India's most trusted construction materials suppliers.
                </p>
                <p>
                  We understand that building a home or a commercial space is one of the most important investments you'll make. That's why we're committed to providing only the best materials at competitive prices, with service that goes beyond just delivery.
                </p>
                <p>
                  Today, we serve thousands of customers across Karnataka, from individual homeowners to large construction companies. Our commitment to quality, transparency, and customer service remains unchanged.
                </p>
              </div>
            </div>
            <div className="bg-construction-yellow p-8 border-3 border-neutral-900">
              <h3 className="text-2xl font-black uppercase mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Premium quality materials from certified manufacturers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Competitive prices with transparent billing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Fast delivery within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Free site cleanup for large orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Expert advice and support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>WhatsApp support and real-time updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase mb-12 text-center text-neutral-900">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-neutral-50 p-6 border-3 border-neutral-900 hover:border-construction-yellow transition-all hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">
                  {value.title}
                </h3>
                <p className="text-neutral-700">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase mb-12 text-center text-neutral-900">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-white p-6 border-3 border-neutral-900"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-neutral-900">
                  {service.title}
                </h3>
                <p className="text-neutral-700 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-neutral-800 p-6 border-3 border-construction-yellow text-center"
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-construction-yellow font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-neutral-300 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-construction-yellow py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black uppercase mb-4 text-neutral-900">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg mb-8 text-neutral-800">
            Get a free quote or browse our products to find exactly what you need
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-neutral-900 text-white px-8 py-4 border-3 border-neutral-900 font-bold uppercase hover:bg-neutral-800 transition-colors"
            >
              Browse Products
            </Link>
            <Link
              to="/contact"
              className="bg-white text-neutral-900 px-8 py-4 border-3 border-neutral-900 font-bold uppercase hover:bg-neutral-100 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">📍</div>
              <h3 className="font-bold text-lg mb-2 text-neutral-900">Visit Us</h3>
              <p className="text-neutral-700">
                12 Industrial Layout<br />
                Peenya Industrial Area, Bangalore 560058
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-bold text-lg mb-2 text-neutral-900">Call Us</h3>
              <p className="text-neutral-700">
                +91 98765 43210<br />
                Mon-Sat: 9 AM - 7 PM
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-bold text-lg mb-2 text-neutral-900">Email Us</h3>
              <p className="text-neutral-700">
                sales@buildmart.com<br />
                support@buildmart.com
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default About;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock order data - In production, fetch from Firestore
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrder({
        id: orderId,
        orderNumber: `ORD-${orderId}`,
        status: 'dispatched', // confirmed, preparing, dispatched, delivered
        customerName: 'Rajesh Kumar',
        customerPhone: '+91 98765 43210',
        deliveryAddress: '12 Industrial Layout, Peenya Industrial Area, Bangalore 560058',
        items: [
          { name: 'ACC Cement OPC 53 Grade', quantity: 100, unit: 'bags' },
          { name: 'TMT Steel Bars 12mm', quantity: 500, unit: 'kg' }
        ],
        subtotal: 48000,
        gst: 8640,
        deliveryCharge: 500,
        grandTotal: 57140,
        orderDate: '2024-02-10T10:30:00',
        estimatedDelivery: '2024-02-12T16:00:00',
        vehicleType: 'Mini Truck',
        driverName: 'Suresh Patil',
        driverPhone: '+91 98765 12345',
        vehicleNumber: 'MH02AB1234',
        timeline: [
          { status: 'confirmed', label: 'Order Confirmed', time: '2024-02-10T10:30:00', completed: true },
          { status: 'preparing', label: 'Preparing Order', time: '2024-02-10T14:00:00', completed: true },
          { status: 'dispatched', label: 'Dispatched', time: '2024-02-11T09:00:00', completed: true },
          { status: 'delivered', label: 'Delivered', time: null, completed: false }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center bg-white border-3 border-neutral-900 p-12 construction-shadow">
          <svg className="w-20 h-20 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-3xl font-bold mb-4">Order Not Found</h2>
          <p className="text-neutral-600 mb-6">We couldn't find an order with ID: {orderId}</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const getStatusProgress = () => {
    const statuses = ['confirmed', 'preparing', 'dispatched', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-500',
      preparing: 'bg-construction-yellow',
      dispatched: 'bg-construction-orange',
      delivered: 'bg-green-600'
    };
    return colors[status] || 'bg-neutral-400';
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-construction-yellow hover:text-construction-orange font-bold mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-neutral-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-neutral-600">Order #{order.orderNumber}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tracking Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Card */}
            <div className="bg-white border-3 border-neutral-900 p-8 construction-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase text-neutral-900">Current Status</h2>
                <span className={`px-4 py-2 ${getStatusColor(order.status)} text-white font-bold uppercase text-sm border-2 border-neutral-900`}>
                  {order.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-8">
                <div className="h-2 bg-neutral-200 border-2 border-neutral-900">
                  <div 
                    className={`h-full ${getStatusColor(order.status)} transition-all duration-500`}
                    style={{ width: `${getStatusProgress()}%` }}
                  ></div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                {order.timeline.map((item, index) => (
                  <div key={item.status} className="relative pl-8">
                    {/* Connector Line */}
                    {index !== order.timeline.length - 1 && (
                      <div className={`absolute left-2.5 top-10 w-0.5 h-full ${item.completed ? 'bg-construction-yellow' : 'bg-neutral-300'}`}></div>
                    )}
                    
                    {/* Status Icon */}
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-3 border-neutral-900 flex items-center justify-center ${item.completed ? getStatusColor(item.status) : 'bg-neutral-300'}`}>
                      {item.completed && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>

                    {/* Status Info */}
                    <div>
                      <h3 className={`font-bold text-lg ${item.completed ? 'text-neutral-900' : 'text-neutral-500'}`}>
                        {item.label}
                      </h3>
                      <p className="text-sm text-neutral-600">{formatDateTime(item.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            {order.status === 'dispatched' && (
              <div className="bg-construction-yellow bg-opacity-20 border-3 border-construction-yellow p-6">
                <h3 className="text-xl font-black uppercase mb-4 text-neutral-900">Vehicle & Driver Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Vehicle Type</p>
                    <p className="font-bold text-neutral-900">{order.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Vehicle Number</p>
                    <p className="font-bold text-neutral-900">{order.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Driver Name</p>
                    <p className="font-bold text-neutral-900">{order.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Driver Contact</p>
                    <a href={`tel:${order.driverPhone}`} className="font-bold text-construction-yellow hover:text-construction-orange">
                      {order.driverPhone}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
              <h3 className="text-xl font-black uppercase mb-4 text-neutral-900">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start pb-3 border-b-2 border-neutral-200 last:border-0">
                    <div>
                      <p className="font-bold text-neutral-900">{item.name}</p>
                      <p className="text-sm text-neutral-600">Quantity: {item.quantity} {item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Details */}
            <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
              <h3 className="text-xl font-black uppercase mb-4 text-neutral-900">Delivery Address</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Customer Name</p>
                  <p className="font-bold text-neutral-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Phone</p>
                  <p className="font-bold text-neutral-900">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Address</p>
                  <p className="font-bold text-neutral-900">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border-3 border-neutral-900 p-6 construction-shadow">
              <h3 className="text-xl font-black uppercase mb-4 text-neutral-900">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-bold text-neutral-900">₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Delivery</span>
                  <span className="font-bold text-neutral-900">₹{order.deliveryCharge.toLocaleString()}</span>
                </div>
                <div className="border-t-3 border-construction-yellow pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black uppercase text-neutral-900">Total</span>
                    <span className="text-2xl font-black text-construction-yellow">₹{order.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Button */}
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}?text=Hi! I need help with my order ${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 text-center border-3 border-neutral-900 uppercase tracking-wider transition-all construction-shadow"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Get Help
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;

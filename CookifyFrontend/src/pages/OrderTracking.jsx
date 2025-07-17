import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchOrderDetails();
    
    const interval = setInterval(() => {
      fetchOrderDetails(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const response = await axios.get(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setOrder(response.data);
      setLastUpdated(new Date());
      setError('');
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'Pending': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
        description: 'Your order has been received and is waiting for restaurant confirmation.'
      },
      'Confirmed': {
        color: 'bg-blue-100 text-blue-800',
        icon: '✅',
        description: 'Restaurant has confirmed your order and will start preparing it soon.'
      },
      'Preparing': {
        color: 'bg-orange-100 text-orange-800',
        icon: '👨‍🍳',
        description: 'Your delicious meal is being prepared by the restaurant.'
      },
      'Out for Delivery': {
        color: 'bg-purple-100 text-purple-800',
        icon: '🚗',
        description: 'Your order is on its way! The delivery driver will arrive soon.'
      },
      'Delivered': {
        color: 'bg-green-100 text-green-800',
        icon: '📦',
        description: 'Your order has been delivered. Enjoy your meal!'
      },
      'Cancelled': {
        color: 'bg-red-100 text-red-800',
        icon: '❌',
        description: 'This order has been cancelled.'
      }
    };
    return statusMap[status] || statusMap['Pending'];
  };

  const getEstimatedDeliveryTime = () => {
    if (order?.estimatedDeliveryTime) {
      return new Date(order.estimatedDeliveryTime);
    }
    const orderTime = new Date(order?.createdAt);
    orderTime.setMinutes(orderTime.getMinutes() + 35);
    return orderTime;
  };

  const getDeliveryTimeStatus = () => {
    const estimatedTime = getEstimatedDeliveryTime();
    const now = new Date();
    const diffInMinutes = Math.floor((estimatedTime - now) / (1000 * 60));

    if (order?.status === 'Delivered') {
      return {
        text: 'Delivered',
        color: 'text-green-600',
        isLate: false
      };
    }

    if (diffInMinutes > 0) {
      return {
        text: `Expected in ${diffInMinutes} minutes`,
        color: 'text-blue-600',
        isLate: false
      };
    } else if (diffInMinutes > -10) {
      return {
        text: 'Arriving now',
        color: 'text-orange-600',
        isLate: false
      };
    } else {
      return {
        text: `${Math.abs(diffInMinutes)} minutes late`,
        color: 'text-red-600',
        isLate: true
      };
    }
  };

  const OrderStatusTimeline = () => {
    const statuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);
    const isCancelled = order.status === 'Cancelled';

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div 
            className="absolute left-6 top-0 w-0.5 bg-orange-500 transition-all duration-500"
            style={{ 
              height: isCancelled ? '0%' : `${((currentStatusIndex + 1) / statuses.length) * 100}%` 
            }}
          ></div>

          <div className="space-y-6">
            {statuses.map((status, index) => {
              const isPast = index <= currentStatusIndex && !isCancelled;
              const isCurrent = index === currentStatusIndex && !isCancelled;
              const statusInfo = getStatusInfo(status);

              return (
                <div key={status} className="relative flex items-start">
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 
                    ${isPast || isCurrent 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}>
                    <span className="text-lg">{statusInfo.icon}</span>
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        isPast || isCurrent ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {status}
                      </h4>
                      {isCurrent && (
                        <span className="text-xs text-orange-600 font-medium">Current</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      isPast || isCurrent ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {statusInfo.description}
                    </p>
                    {isCurrent && (
                      <div className="mt-2 flex items-center">
                        <div className="animate-pulse w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-xs text-orange-600">In Progress</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isCancelled && (
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 bg-red-500 border-red-500 text-white">
                  <span className="text-lg">❌</span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">Cancelled</h4>
                  <p className="text-sm mt-1 text-gray-600">This order has been cancelled.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Link 
            to="/order-history"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md"
          >
            View Order History
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const deliveryTimeStatus = getDeliveryTimeStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
            <button
              onClick={() => fetchOrderDetails()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
          <p className="text-gray-600">
            Order #{order._id.slice(-8).toUpperCase()} • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{statusInfo.icon}</span>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{order.status}</h2>
                      <p className="text-gray-600">{statusInfo.description}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery Time:</p>
                    <p className="font-medium text-gray-900">
                      {getEstimatedDeliveryTime().toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${deliveryTimeStatus.color}`}>
                      {deliveryTimeStatus.text}
                    </p>
                    {deliveryTimeStatus.isLate && (
                      <p className="text-xs text-gray-500">We apologize for the delay</p>
                    )}
                  </div>
                </div>
              </div>

              <OrderStatusTimeline />

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Contact</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{order.restaurant.name}</h4>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>📞 {order.restaurant.phone}</p>
                    {order.restaurant.email && (
                      <p>📧 {order.restaurant.email}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Contact the restaurant directly for any questions about your order.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.quantity}x {item.menuItem.name}
                      </p>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      AED {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>AED {order.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span>AED {order.pricing.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>AED {order.pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>AED {order.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
              <div className="text-sm text-gray-700">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                {order.deliveryAddress.instructions && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-yellow-800 text-xs">
                      <span className="font-medium">Instructions:</span> {order.deliveryAddress.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={`/restaurant/${order.restaurant._id}`}
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-center font-medium transition-colors"
                >
                  Order Again
                </Link>
                <Link
                  to="/order-history"
                  className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-center font-medium transition-colors"
                >
                  View Order History
                </Link>
                {(order.status === 'Pending' || order.status === 'Confirmed') && (
                  <button className="w-full border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-md font-medium transition-colors">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
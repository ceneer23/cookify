import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Preparing': 'bg-orange-100 text-orange-800',
      'Out for Delivery': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEstimatedDeliveryTime = () => {
    if (order?.estimatedDeliveryTime) {
      return new Date(order.estimatedDeliveryTime).toLocaleString();
    }
    const orderTime = new Date(order?.createdAt);
    orderTime.setMinutes(orderTime.getMinutes() + 35);
    return orderTime.toLocaleString();
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
            to="/restaurants"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We're preparing your delicious meal!
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Restaurant</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900">{order.restaurant.name}</h4>
                <p className="text-sm text-gray-600">Phone: {order.restaurant.phone}</p>
                <p className="text-sm text-gray-600">Email: {order.restaurant.email}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-700">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Instructions:</span> {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Info</h4>
                  <p className="text-sm text-gray-700">Phone: {order.contactInfo.phone}</p>
                  {order.contactInfo.email && (
                    <p className="text-sm text-gray-700">Email: {order.contactInfo.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🕐</span>
                <div>
                  <h4 className="font-medium text-blue-900">Estimated Delivery Time</h4>
                  <p className="text-blue-700">{getEstimatedDeliveryTime()}</p>
                  <p className="text-sm text-blue-600">We'll keep you updated on your order status</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.quantity}x {item.menuItem.name}
                      </h4>
                      <p className="text-sm text-gray-600">AED {item.price.toFixed(2)} each</p>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          {item.customizations.map((custom, idx) => (
                            <div key={idx}>
                              {custom.name}: {custom.selectedOptions.map(opt => opt.name).join(', ')}
                            </div>
                          ))}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Note:</span> {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      AED {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {order.specialInstructions && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Instructions</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800">{order.specialInstructions}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2">
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
                {order.pricing.discount.amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-AED {order.pricing.discount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>AED {order.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {!['Delivered', 'Cancelled'].includes(order.status) && (
            <Link
              to={`/order-tracking/${order._id}`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium text-center transition-colors"
            >
              Track Your Order
            </Link>
          )}
          <Link
            to="/restaurants"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium text-center transition-colors"
          >
            Order Again
          </Link>
          <Link
            to="/order-history"
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-md font-medium text-center transition-colors"
          >
            View Order History
          </Link>
        </div>

        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your order, please contact the restaurant directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <span className="text-gray-600">Restaurant Phone: {order.restaurant.phone}</span>
            {order.restaurant.email && (
              <span className="text-gray-600">• Email: {order.restaurant.email}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
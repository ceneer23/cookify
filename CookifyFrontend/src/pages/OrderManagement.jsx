import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { token } = useAuth();

  const statusOptions = [
    'Pending',
    'Confirmed', 
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Preparing': 'bg-orange-100 text-orange-800',
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchOrders();
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrders, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/orders/restaurant', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage({ type: 'error', text: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5001/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: `Order status updated to ${newStatus}` });
      fetchOrders(); // Refresh orders
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update order status' 
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['Delivered', 'Cancelled'].includes(order.status);
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  const getTimeAgo = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">Manage incoming orders and delivery status</p>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p>{message.text}</p>
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              className="float-right text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length})
            </button>
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status} ({orders.filter(o => o.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No orders have been placed yet.'
                : `No orders with status "${filter}".`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow border border-gray-200">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.customer.name} • {getTimeAgo(order.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        AED {order.pricing.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start text-sm">
                            <div className="flex-1">
                              <span className="font-medium">{item.quantity}x</span>
                              <span className="ml-2">{item.menuItem.name}</span>
                              {item.specialInstructions && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Note: {item.specialInstructions}
                                </p>
                              )}
                              {item.customizations && item.customizations.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.customizations.map((custom, idx) => (
                                    <div key={idx}>
                                      {custom.name}: {custom.selectedOptions.map(opt => opt.name).join(', ')}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-gray-900 font-medium">
                              AED {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {order.specialInstructions && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                          <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                        </div>
                      )}
                    </div>

                    {/* Customer & Delivery Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Customer:</span> {order.customer.name}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {order.contactInfo.phone}
                        </div>
                        <div>
                          <span className="font-medium">Address:</span>
                          <br />
                          {order.deliveryAddress.street}
                          <br />
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                        </div>
                        {order.deliveryAddress.instructions && (
                          <div>
                            <span className="font-medium">Delivery Instructions:</span>
                            <br />
                            {order.deliveryAddress.instructions}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Payment:</span> {order.paymentMethod}
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            order.paymentStatus === 'Paid' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <h5 className="font-medium text-gray-900 mb-2">Order Total</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>AED {order.pricing.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Fee:</span>
                            <span>AED {order.pricing.deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>AED {order.pricing.tax.toFixed(2)}</span>
                          </div>
                          {order.pricing.discount.amount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-AED {order.pricing.discount.amount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold border-t pt-1">
                            <span>Total:</span>
                            <span>AED {order.pricing.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Controls */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Update Order Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map(status => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order._id, status)}
                          disabled={order.status === status}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            order.status === status
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
                          Mark as {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Delivery Time */}
                  {order.status === 'Confirmed' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Estimated Delivery:</span>
                        {order.estimatedDeliveryTime 
                          ? ` ${new Date(order.estimatedDeliveryTime).toLocaleString()}`
                          : ' 30-45 minutes from now'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
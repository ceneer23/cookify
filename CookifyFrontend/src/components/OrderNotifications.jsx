import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const OrderNotifications = () => {
  const { user, token } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    if (user && token) {
      fetchActiveOrders();
      
      const interval = setInterval(() => {
        fetchActiveOrders();
      }, 120000);

      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchActiveOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const active = response.data.filter(order => 
        !['Delivered', 'Cancelled'].includes(order.status)
      );
      
      checkForStatusUpdates(active);
      setActiveOrders(active);
      
    } catch (error) {
      console.error('Error fetching active orders:', error);
    }
  };

  const checkForStatusUpdates = (newOrders) => {
    const now = new Date();
    
    newOrders.forEach(newOrder => {
      const existingOrder = activeOrders.find(order => order._id === newOrder._id);
      
      if (existingOrder && existingOrder.status !== newOrder.status) {
        const notification = {
          id: `${newOrder._id}-${now.getTime()}`,
          orderId: newOrder._id,
          message: getStatusUpdateMessage(newOrder.status),
          status: newOrder.status,
          timestamp: now,
          read: false
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      }
    });
  };

  const getStatusUpdateMessage = (status) => {
    const messages = {
      'Confirmed': 'Your order has been confirmed! 🎉',
      'Preparing': 'Your delicious meal is being prepared! 👨‍🍳',
      'Out for Delivery': 'Your order is on the way! 🚗',
      'Delivered': 'Your order has been delivered! Enjoy! 📦'
    };
    return messages[status] || `Order status updated to ${status}`;
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': '⏳',
      'Confirmed': '✅',
      'Preparing': '👨‍🍳',
      'Out for Delivery': '🚗',
      'Delivered': '📦',
      'Cancelled': '❌'
    };
    return icons[status] || '📋';
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {(getUnreadCount() > 0 || activeOrders.length > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {getUnreadCount() || activeOrders.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order Updates</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Updates</h4>
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-start">
                          <span className="text-lg mr-2">{getStatusIcon(notification.status)}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              Order #{notification.orderId.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeOrders.length > 0 && (
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Active Orders</h4>
                  <div className="space-y-3">
                    {activeOrders.map(order => (
                      <Link
                        key={order._id}
                        to={`/order-tracking/${order._id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-lg mr-3">{getStatusIcon(order.status)}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.restaurant.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                #{order._id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              {order.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              AED {order.pricing.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {activeOrders.length === 0 && notifications.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No recent orders</h4>
                  <p className="text-xs text-gray-500">
                    Your order updates will appear here
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <Link
                to="/order-history"
                className="block text-center text-sm text-orange-600 hover:text-orange-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View All Orders
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderNotifications;
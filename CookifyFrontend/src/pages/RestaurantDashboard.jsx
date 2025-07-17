import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      const restaurantRes = await axios.get(`${API_URL}/restaurants/my-restaurant`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (restaurantRes.data) {
        setRestaurant(restaurantRes.data);
        
        const ordersRes = await axios.get(`${API_URL}/orders/restaurant?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(ordersRes.data);
        
        const menuRes = await axios.get(`${API_URL}/menus/restaurant/${restaurantRes.data._id}?available=false`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMenuItemsCount(menuRes.data.length);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load restaurant data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-6">🍽️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Cookify Restaurant Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You haven't registered your restaurant yet. Get started to begin receiving orders!
            </p>
            <Link
              to="/restaurant-registration"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              Register Your Restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (isApproved) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⏳ Pending Approval
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="mt-1 text-gray-600">{restaurant.cuisine} • {restaurant.address.city}, {restaurant.address.state}</p>
            </div>
            {getStatusBadge(restaurant.isApproved)}
          </div>
        </div>

        {!restaurant.isApproved && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="text-yellow-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Restaurant Pending Approval
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Your restaurant is currently under review. Once approved by our team, 
                  it will be visible to customers and you can start receiving orders.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rating
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {restaurant.rating.average > 0 ? restaurant.rating.average.toFixed(1) : 'No ratings yet'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Menu Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {menuItemsCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Orders Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {orders.filter(order => {
                        const today = new Date().toDateString();
                        return new Date(order.createdAt).toDateString() === today;
                      }).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Revenue Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      AED {orders.filter(order => {
                        const today = new Date().toDateString();
                        return new Date(order.createdAt).toDateString() === today && order.status !== 'Cancelled';
                      }).reduce((sum, order) => sum + order.pricing.total, 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🍕</span>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Manage Menu
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add, edit, or remove menu items
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  to="/menu-management"
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors text-center"
                >
                  Manage Menu
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📋</span>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    View Orders
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage incoming orders
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  to="/order-management"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-center"
                >
                  View Orders
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">⚙️</span>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Restaurant Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update restaurant information
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Restaurant Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm text-gray-900">
                  <p><span className="font-medium">Phone:</span> {restaurant.phone}</p>
                  <p><span className="font-medium">Email:</span> {restaurant.email}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
                <div className="text-sm text-gray-900">
                  <p>{restaurant.address.street}</p>
                  <p>{restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Settings</h4>
                <div className="space-y-2 text-sm text-gray-900">
                  <p><span className="font-medium">Delivery Fee:</span> AED {restaurant.deliveryFee}</p>
                  <p><span className="font-medium">Minimum Order:</span> AED {restaurant.minimumOrder}</p>
                  <p><span className="font-medium">Estimated Delivery:</span> {restaurant.estimatedDeliveryTime}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-sm text-gray-900">{restaurant.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
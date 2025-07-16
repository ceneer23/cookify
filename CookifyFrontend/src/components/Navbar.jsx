import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar';
import OrderNotifications from './OrderNotifications';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">🍽️ Cookify</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link to="/restaurants" className="text-gray-500 hover:text-gray-900 transition-colors">
              Restaurants
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Order Notifications */}
            {isAuthenticated && <OrderNotifications />}
            
            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-2xl">🛒</span>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hi, {user?.name}</span>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Admin
                  </Link>
                )}
                {user?.role === 'restaurant_owner' && (
                  <>
                    <Link 
                      to="/restaurant-dashboard" 
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/restaurant-registration" 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Register Restaurant
                    </Link>
                  </>
                )}
                <Link 
                  to="/profile" 
                  className="text-gray-600 hover:text-gray-800"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Navbar;
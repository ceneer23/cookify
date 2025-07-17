import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user?.role === 'restaurant_owner') {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                Welcome Back,
                <span className="block text-green-100">{user.name}!</span>
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl text-green-100">
                Manage your restaurant, track orders, and grow your business with Cookify
              </p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:inline-flex">
                  <Link
                    to="/restaurant-dashboard"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/order-management"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    View Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Restaurant Management Tools
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
                Everything you need to run your restaurant efficiently
              </p>
            </div>

            <div className="mt-20">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Link to="/restaurant-dashboard" className="text-center group cursor-pointer">
                  <div className="flex items-center justify-center h-16 w-16 mx-auto bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Dashboard</h3>
                  <p className="mt-2 text-base text-gray-500">
                    View analytics, revenue, and restaurant performance
                  </p>
                </Link>

                <Link to="/menu-management" className="text-center group cursor-pointer">
                  <div className="flex items-center justify-center h-16 w-16 mx-auto bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Menu Management</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Add, edit, and organize your menu items
                  </p>
                </Link>

                <Link to="/order-management" className="text-center group cursor-pointer">
                  <div className="flex items-center justify-center h-16 w-16 mx-auto bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">Order Management</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Track and manage incoming orders
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Delicious Food
              <span className="block text-orange-100">Delivered Fast</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-orange-100">
              Order from your favorite restaurants and get food delivered to your door in minutes
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:inline-flex">
                <Link
                  to="/restaurants"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Browse Restaurants
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Sign Up Now
                  </Link>
                )}
                {isAuthenticated && (
                  <Link
                    to="/order-history"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    View Orders
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Cookify?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              We make food delivery simple, fast, and delicious
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-orange-100 rounded-full">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Fast Delivery</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get your food delivered in 30 minutes or less
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-orange-100 rounded-full">
                  <span className="text-2xl">🍕</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Wide Selection</h3>
                <p className="mt-2 text-base text-gray-500">
                  Choose from hundreds of restaurants and cuisines
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-orange-100 rounded-full">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Secure Payment</h3>
                <p className="mt-2 text-base text-gray-500">
                  Safe and secure payment processing with multiple options
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
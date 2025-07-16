import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    cuisine: '',
    page: 1
  });

  const cuisines = ['Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Thai', 'Japanese', 'Mediterranean', 'Fast Food'];

  useEffect(() => {
    fetchRestaurants();
  }, [filters]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      params.append('page', filters.page);
      params.append('limit', '12');

      const response = await axios.get(`http://localhost:5001/api/restaurants?${params}`);
      setRestaurants(response.data.restaurants);
      setError('');
    } catch (err) {
      setError('Failed to load restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
      page: 1
    });
  };

  const handleCuisineFilter = (cuisine) => {
    setFilters({
      ...filters,
      cuisine: cuisine === filters.cuisine ? '' : cuisine,
      page: 1
    });
  };

  const RestaurantCard = ({ restaurant }) => (
    <Link 
      to={`/restaurant/${restaurant._id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
    >
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {restaurant.images && restaurant.images[0] ? (
          <img 
            src={restaurant.images[0]} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">🍽️</span>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
          {restaurant.rating.average > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm text-gray-600 ml-1">
                {restaurant.rating.average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{restaurant.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded">{restaurant.cuisine}</span>
          <span>{restaurant.estimatedDeliveryTime}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">AED {restaurant.deliveryFee}</span> delivery fee
          </div>
          <div className="text-sm text-gray-600">
            Min: <span className="font-medium">AED {restaurant.minimumOrder}</span>
          </div>
        </div>

        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {restaurant.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurants</h1>
          
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Cuisine Filters */}
          <div className="flex flex-wrap gap-2">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => handleCuisineFilter(cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.cuisine === cuisine
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading restaurants...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && !error && (
          <>
            {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
                <p className="text-gray-500">
                  {filters.search || filters.cuisine 
                    ? 'Try adjusting your search or filters'
                    : 'No restaurants are available in your area yet'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
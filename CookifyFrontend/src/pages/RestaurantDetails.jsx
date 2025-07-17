import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useCart } from '../context/CartContext';

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { addToCart, canAddToCart } = useCart();

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      
      const restaurantRes = await axios.get(`${API_URL}/restaurants/${id}`);
      setRestaurant(restaurantRes.data);

      const menuRes = await axios.get(`${API_URL}/menus/restaurant/${id}`);
      setMenuItems(menuRes.data);
      
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      setError('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(menuItems.map(item => item.category))];
  
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleAddToCart = (menuItem) => {
    if (!canAddToCart(restaurant)) {
      setMessage({
        type: 'error',
        text: 'You can only order from one restaurant at a time. Clear your current cart to order from this restaurant.'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    addToCart(menuItem, restaurant, 1);
    setMessage({
      type: 'success',
      text: `${menuItem.name} added to cart!`
    });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The restaurant you are looking for does not exist.'}</p>
          <Link 
            to="/restaurants"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md"
          >
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {restaurant.images && restaurant.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={restaurant.images[0]}
                      alt={restaurant.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  {restaurant.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {restaurant.images.slice(1, 5).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${restaurant.name} ${index + 2}`}
                          className="w-full h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-6xl">🍽️</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                  <p className="text-lg text-gray-600 mt-2">{restaurant.description}</p>
                </div>
                {restaurant.rating.average > 0 && (
                  <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-medium text-green-800">
                      {restaurant.rating.average.toFixed(1)}
                    </span>
                    <span className="text-green-600 text-sm ml-1">
                      ({restaurant.rating.count})
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🍴</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {restaurant.cuisine}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🕒</span>
                  <span>{restaurant.estimatedDeliveryTime}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🚚</span>
                  <span>AED {restaurant.deliveryFee} delivery fee</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <span className="mr-2">💰</span>
                  <span>AED {restaurant.minimumOrder} minimum order</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📍</span>
                  <span>
                    {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📞</span>
                  <span>{restaurant.phone}</span>
                </div>
              </div>

              {restaurant.tags && restaurant.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {restaurant.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
          {menuItems.length === 0 && (
            <p className="text-gray-500">Menu coming soon!</p>
          )}
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p>{message.text}</p>
          </div>
        )}

        {menuItems.length > 0 && (
          <>
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Items
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {Object.entries(groupedMenuItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map((item) => (
                      <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.name}
                                className="w-32 h-32 object-cover"
                              />
                            ) : (
                              <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                                <span className="text-3xl">🍽️</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                                  {item.isPopular && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Popular
                                    </span>
                                  )}
                                  {item.discount?.percentage > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      {item.discount.percentage}% OFF
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                  {item.preparationTime && (
                                    <span>🕒 {item.preparationTime} min</span>
                                  )}
                                  {item.spiceLevel && item.spiceLevel !== 'None' && (
                                    <span>🌶️ {item.spiceLevel}</span>
                                  )}
                                  {item.calories && (
                                    <span>🔥 {item.calories} cal</span>
                                  )}
                                </div>

                                {item.dietary && item.dietary.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.dietary.map((diet) => (
                                      <span 
                                        key={diet}
                                        className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded"
                                      >
                                        {diet}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {item.ingredients && item.ingredients.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    <span className="font-medium">Ingredients:</span> {item.ingredients.join(', ')}
                                  </p>
                                )}
                              </div>

                              <div className="ml-4 text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  {item.discount?.percentage > 0 ? (
                                    <div>
                                      <span className="line-through text-gray-500 text-sm">
                                        AED {item.price.toFixed(2)}
                                      </span>
                                      <div className="text-red-600">
                                        AED {(item.price * (1 - item.discount.percentage / 100)).toFixed(2)}
                                      </div>
                                    </div>
                                  ) : (
                                    `AED ${item.price.toFixed(2)}`
                                  )}
                                </div>
                                
                                <button 
                                  onClick={() => handleAddToCart(item)}
                                  className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;
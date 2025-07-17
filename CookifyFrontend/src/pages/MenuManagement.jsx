import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { token } = useAuth();

  const categories = [
    'Appetizers', 'Main Course', 'Desserts', 'Beverages', 
    'Salads', 'Soups', 'Sides', 'Specials'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Keto', 'Low-Carb', 'Halal', 'Kosher'
  ];

  const spiceLevels = ['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    preparationTime: 15,
    ingredients: '',
    dietary: [],
    spiceLevel: 'None',
    calories: '',
    isAvailable: true,
    isPopular: false,
    discount: {
      percentage: 0,
      validUntil: ''
    }
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, []);

  const fetchRestaurantAndMenu = async () => {
    try {
      // First get restaurant
      const restaurantRes = await axios.get('http://localhost:5000/api/restaurants/my-restaurant', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (restaurantRes.data) {
        setRestaurant(restaurantRes.data);
        
        // Then get menu items (even for unapproved restaurants)
        const menuRes = await axios.get(`http://localhost:5000/api/menus/restaurant/${restaurantRes.data._id}?available=false`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMenuItems(menuRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show error for empty menu
      if (error.response?.status !== 404) {
        setMessage({ type: 'error', text: 'Failed to load menu items' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'dietary') {
      const currentDietary = Array.isArray(formData.dietary) ? formData.dietary : [];
      const newDietary = checked 
        ? [...currentDietary, value]
        : currentDietary.filter(item => item !== value);
      setFormData({ ...formData, dietary: newDietary });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, WebP)' });
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById('menuImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('preparationTime', formData.preparationTime);
      formDataToSend.append('spiceLevel', formData.spiceLevel);
      formDataToSend.append('isAvailable', formData.isAvailable);
      formDataToSend.append('isPopular', formData.isPopular);
      
      if (formData.calories) {
        formDataToSend.append('calories', parseInt(formData.calories));
      }
      
      // Add ingredients as array
      const ingredients = formData.ingredients.split(',').map(i => i.trim()).filter(i => i);
      ingredients.forEach(ingredient => {
        formDataToSend.append('ingredients', ingredient);
      });
      
      // Add dietary options as array
      if (Array.isArray(formData.dietary)) {
        formData.dietary.forEach(diet => {
          formDataToSend.append('dietary', diet);
        });
      }
      
      // Add discount
      formDataToSend.append('discount[percentage]', parseFloat(formData.discount.percentage) || 0);
      if (formData.discount.validUntil) {
        formDataToSend.append('discount[validUntil]', formData.discount.validUntil);
      }
      
      // Add restaurant ID
      formDataToSend.append('restaurant', restaurant._id);
      
      // Add image if selected
      if (imageFile) {
        formDataToSend.append('menuImage', imageFile);
      }

      if (editingItem) {
        await axios.put(
          `http://localhost:5000/api/menus/${editingItem._id}`,
          formDataToSend,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        setMessage({ type: 'success', text: 'Menu item updated successfully!' });
      } else {
        await axios.post(
          'http://localhost:5000/api/menus',
          formDataToSend,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        setMessage({ type: 'success', text: 'Menu item added successfully!' });
      }

      resetForm();
      fetchRestaurantAndMenu();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to save menu item' 
      });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      preparationTime: item.preparationTime,
      ingredients: item.ingredients.join(', '),
      dietary: item.dietary || [],
      spiceLevel: item.spiceLevel,
      calories: item.calories || '',
      isAvailable: item.isAvailable,
      isPopular: item.isPopular,
      discount: {
        percentage: item.discount?.percentage || 0,
        validUntil: item.discount?.validUntil?.split('T')[0] || ''
      }
    });
    
    // Set existing image preview if available
    if (item.image) {
      setImagePreview(`http://localhost:5000${item.image}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/menus/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Menu item deleted successfully!' });
      fetchRestaurantAndMenu();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to delete menu item' 
      });
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await axios.put(
        `http://localhost:5000/api/menus/${item._id}`,
        { isAvailable: !item.isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRestaurantAndMenu();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      preparationTime: 15,
      ingredients: '',
      dietary: [],
      spiceLevel: 'None',
      calories: '',
      isAvailable: true,
      isPopular: false,
      discount: {
        percentage: 0,
        validUntil: ''
      }
    });
    setEditingItem(null);
    setImageFile(null);
    setImagePreview(null);
    setShowAddForm(false);
    
    // Clear file input
    const fileInput = document.getElementById('menuImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please register a restaurant first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-2 text-gray-600">Manage your restaurant's menu items</p>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p>{message.text}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menu Item Image
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="menuImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500">
                      Upload an image for your menu item (Max 5MB, JPEG/PNG/WebP)
                    </p>
                    
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Menu item preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (AED) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spice Level
                  </label>
                  <select
                    name="spiceLevel"
                    value={formData.spiceLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {spiceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories (optional)
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients (comma separated)
                  </label>
                  <input
                    type="text"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    placeholder="e.g., Chicken, Rice, Vegetables"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Dietary Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Options
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dietaryOptions.map(diet => (
                    <label key={diet} className="flex items-center">
                      <input
                        type="checkbox"
                        name="dietary"
                        value={diet}
                        checked={Array.isArray(formData.dietary) && formData.dietary.includes(diet)}
                        onChange={handleChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{diet}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount.percentage"
                    value={formData.discount.percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Valid Until
                  </label>
                  <input
                    type="date"
                    name="discount.validUntil"
                    value={formData.discount.validUntil}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Availability and Popular */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={formData.isPopular}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mark as Popular</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md"
            >
              + Add New Item
            </button>
          </div>
        )}

        {/* Menu Items List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Menu Items ({menuItems.length})
            </h3>
          </div>

          {menuItems.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No menu items yet. Add your first item!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {menuItems.map(item => (
                <div key={item._id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Menu Item Image */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={`http://localhost:5000${item.image}`}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                    </div>

                    {/* Menu Item Details */}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h4>
                        {item.isPopular && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Popular
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unavailable
                          </span>
                        )}
                        {item.discount?.percentage > 0 && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.discount.percentage}% OFF
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">AED {item.price.toFixed(2)}</span>
                        <span>{item.category}</span>
                        <span>{item.preparationTime} min</span>
                        {item.spiceLevel !== 'None' && (
                          <span>🌶️ {item.spiceLevel}</span>
                        )}
                        {item.calories && <span>{item.calories} cal</span>}
                      </div>

                      {item.dietary && item.dietary.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.dietary.map(diet => (
                            <span key={diet} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {diet}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`px-3 py-1 text-sm rounded ${
                          item.isAvailable 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
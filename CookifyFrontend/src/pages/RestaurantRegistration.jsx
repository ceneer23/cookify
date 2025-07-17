import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const RestaurantRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    },
    deliveryFee: 2.99,
    minimumOrder: 15,
    estimatedDeliveryTime: '30-45 min',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Check if user already has a restaurant
  useEffect(() => {
    if (user && token && user.role === 'restaurant_owner') {
      const checkExistingRestaurant = async () => {
        try {
          const response = await axios.get(`${API_URL}/restaurants/my-restaurant`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            // User already has a restaurant, redirect to dashboard
            navigate('/restaurant-dashboard');
          }
        } catch (error) {
          // No restaurant found, user can register
          console.log('No existing restaurant found, user can register');
        }
      };
      
      checkExistingRestaurant();
    }
  }, [user, token, navigate]);

  const cuisines = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 
    'Thai', 'Japanese', 'Mediterranean', 'Fast Food', 'Other'
  ];

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: {
          ...formData.hours[day],
          [field]: value
        }
      }
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setFormData({
      ...formData,
      images: [...formData.images, ...imageUrls].slice(0, 5)
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.cuisine) {
      newErrors.cuisine = 'Cuisine type is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if user is authenticated
    if (!token) {
      setErrors({ submit: 'Authentication required. Please log in again.' });
      return;
    }
    
    // Check if user has the right role
    if (user.role !== 'restaurant_owner') {
      setErrors({ submit: 'You must be registered as a restaurant owner to create a restaurant.' });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting restaurant registration...');
      console.log('API URL:', `${API_URL}/restaurants`);
      console.log('Token available:', !!token);
      console.log('User role:', user.role);
      
      const response = await axios.post(
        `${API_URL}/restaurants`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/restaurant-dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Restaurant registration error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMsg = 'Registration failed';
      
      if (error.response) {
        // Server responded with error status
        errorMsg = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = 'Network error: Unable to connect to server. Please check if the server is running and try again.';
      } else {
        // Something else happened
        errorMsg = error.message || 'Registration failed';
      }
      
      // Special handling for "already have a restaurant" error
      if (errorMsg.includes('already have a restaurant')) {
        setErrors({ 
          submit: 'You already have a restaurant registered. Redirecting to your dashboard...' 
        });
        setTimeout(() => {
          navigate('/restaurant-dashboard');
        }, 3000);
      } else {
        setErrors({ submit: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'restaurant_owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to register as a restaurant owner to access this page.</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md"
          >
            Register as Restaurant Owner
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your restaurant has been submitted for approval. You'll be redirected to your dashboard.
          </p>
          <div className="text-sm text-gray-500">
            Note: Your restaurant will be visible to customers once approved by an admin.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Register Your Restaurant</h1>
            <p className="mt-2 text-gray-600">
              Fill out the information below to get your restaurant listed on Cookify
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter restaurant name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine Type *
                  </label>
                  <select
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.cuisine ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select cuisine type</option>
                    {cuisines.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                  {errors.cuisine && <p className="mt-1 text-sm text-red-600">{errors.cuisine}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your restaurant and what makes it special"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="restaurant@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors['address.street'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors['address.city'] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors['address.state'] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="State"
                    />
                    {errors['address.state'] && <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors['address.zipCode'] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="12345"
                    />
                    {errors['address.zipCode'] && <p className="mt-1 text-sm text-red-600">{errors['address.zipCode']}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-20">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.hours[day].closed}
                        onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Closed</span>
                    </div>

                    {!formData.hours[day].closed && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={formData.hours[day].open}
                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData.hours[day].close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Images</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images (Max 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or GIF. Max file size 5MB each.
                  </p>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Restaurant ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Fee (AED)
                  </label>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order (AED)
                  </label>
                  <input
                    type="number"
                    name="minimumOrder"
                    value={formData.minimumOrder}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Delivery Time
                  </label>
                  <input
                    type="text"
                    name="estimatedDeliveryTime"
                    value={formData.estimatedDeliveryTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 30-45 min"
                  />
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{errors.submit}</p>
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Registering Restaurant...' : 'Register Restaurant'}
              </button>
              
              <p className="mt-4 text-sm text-gray-600 text-center">
                Your restaurant will be reviewed and approved by our team before going live.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegistration;
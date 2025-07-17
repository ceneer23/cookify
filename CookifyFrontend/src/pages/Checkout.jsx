import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { 
    items, 
    restaurant, 
    getCartTotal, 
    getDeliveryFee, 
    getTax, 
    getFinalTotal,
    clearCart 
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    // Delivery Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: '',
    
    // Contact Info
    phone: user?.phone || '',
    email: user?.email || '',
    
    // Payment
    paymentMethod: 'Cash on Delivery',
    
    // Special Instructions
    specialInstructions: ''
  });

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      navigate('/restaurants');
      return;
    }

    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
  }, [items, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['street', 'city', 'state', 'zipCode', 'phone'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      setMessage({
        type: 'error',
        text: `Please fill in all required fields: ${missing.join(', ')}`
      });
      return false;
    }

    // Validate phone number (basic)
    if (!/^\d{8,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid phone number'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const orderData = {
        restaurant: restaurant._id,
        items: items.map(item => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations || [],
          specialInstructions: item.specialInstructions || ''
        })),
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          instructions: formData.instructions
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email
        },
        paymentMethod: formData.paymentMethod,
        specialInstructions: formData.specialInstructions,
        pricing: {
          subtotal: getCartTotal(),
          deliveryFee: getDeliveryFee(),
          tax: getTax(),
          discount: { amount: 0 },
          total: getFinalTotal()
        }
      };

      const response = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Clear cart and redirect to order confirmation
      clearCart();
      navigate(`/order-confirmation/${response.data._id}`);
      
    } catch (error) {
      console.error('Order placement error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to place order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mx-6 mt-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Forms */}
              <div className="space-y-8">
                {/* Delivery Address */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter your street address"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="City"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="State"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="ZIP Code"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Instructions
                      </label>
                      <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Ring doorbell twice, Leave at door, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Your phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Your email address"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {['Cash on Delivery', 'Credit Card', 'Debit Card', 'PayPal'].map(method => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={formData.paymentMethod === method}
                          onChange={handleChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                  {formData.paymentMethod !== 'Cash on Delivery' && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700">
                        Online payment processing will be available soon. For now, please select "Cash on Delivery".
                      </p>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h2>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Any special requests for your order..."
                  />
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <div className="sticky top-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  {/* Restaurant Info */}
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                    <p className="text-sm text-gray-600">Delivery: {restaurant.estimatedDeliveryTime}</p>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.quantity}x {item.menuItem.name}
                          </h4>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {item.customizations.map((custom, idx) => (
                                <div key={idx}>
                                  {custom.name}: {custom.selectedOptions.map(opt => opt.name).join(', ')}
                                </div>
                              ))}
                            </div>
                          )}
                          {item.specialInstructions && (
                            <p className="text-xs text-gray-500">Note: {item.specialInstructions}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          AED {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>AED {getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee:</span>
                      <span>AED {getDeliveryFee().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8.5%):</span>
                      <span>AED {getTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>AED {getFinalTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/restaurants')}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      ← Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const { 
    items, 
    restaurant, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getDeliveryFee, 
    getTax, 
    getFinalTotal 
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add some delicious items to get started!</p>
              <Link
                to="/restaurants"
                onClick={onClose}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="p-6">
              {restaurant && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                  <p className="text-sm text-gray-600">Delivery: {restaurant.estimatedDeliveryTime}</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                    <div className="flex-shrink-0">
                      {item.menuItem.image ? (
                        <img
                          src={`http://localhost:5000${item.menuItem.image}`}
                          alt={item.menuItem.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🍽️</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.menuItem.name}</h4>
                      <p className="text-sm text-gray-600">AED {item.price.toFixed(2)} each</p>
                      
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.customizations.map((custom, idx) => (
                            <div key={idx}>
                              {custom.name}: {custom.selectedOptions.map(opt => opt.name).join(', ')}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                      )}

                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="mx-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        AED {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={clearCart}
                className="w-full text-center text-red-600 hover:text-red-800 text-sm py-2 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-6">
            <div className="space-y-2 mb-4">
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

            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition-colors"
            >
              {user ? 'Proceed to Checkout' : 'Login to Order'}
            </button>

            {!user && (
              <p className="text-xs text-gray-500 text-center mt-2">
                You need to login to place an order
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
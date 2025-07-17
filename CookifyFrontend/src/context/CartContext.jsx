import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(
        item => item.menuItem._id === action.payload.menuItem._id &&
                JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations)
      );
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.menuItem._id === action.payload.menuItem._id &&
            JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations)
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, action.payload],
        restaurant: action.payload.restaurant
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        restaurant: null
      };

    case 'LOAD_CART':
      return action.payload;

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  restaurant: null,
  isOpen: false
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('cookify-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cookify-cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (menuItem, restaurant, quantity = 1, customizations = [], specialInstructions = '') => {
    const cartItem = {
      id: `${menuItem._id}-${Date.now()}`,
      menuItem,
      restaurant,
      quantity,
      customizations,
      specialInstructions,
      price: calculateItemPrice(menuItem, customizations)
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const calculateItemPrice = (menuItem, customizations = []) => {
    let basePrice = menuItem.price;
    
    if (menuItem.discount?.percentage > 0) {
      basePrice = basePrice * (1 - menuItem.discount.percentage / 100);
    }

    const customizationCost = customizations.reduce((total, customization) => {
      return total + customization.selectedOptions.reduce((optionTotal, option) => {
        return optionTotal + (option.price || 0);
      }, 0);
    }, 0);

    return basePrice + customizationCost;
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const canAddToCart = (restaurant) => {
    if (state.items.length === 0) return true;
    
    return state.restaurant?._id === restaurant._id;
  };

  const getDeliveryFee = () => {
    return state.restaurant?.deliveryFee || 0;
  };

  const getTax = () => {
    const subtotal = getCartTotal();
    return Math.round(subtotal * 0.085 * 100) / 100;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getDeliveryFee() + getTax();
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    getCartTotal,
    getCartItemCount,
    canAddToCart,
    getDeliveryFee,
    getTax,
    getFinalTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
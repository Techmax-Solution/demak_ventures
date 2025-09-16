import { createContext, useContext, useReducer, useEffect } from 'react';
import { useUser } from './UserContext';
import SessionManager from '../utils/sessionManager.js';

const CartContext = createContext();

// Cart action types
const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const { product, quantity = 1, size, color } = action.payload;
      
      // Create a unique item key based on product ID, size, and color
      const itemKey = `${product._id}-${size || 'default'}-${color || 'default'}`;
      
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(item => item.key === itemKey);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + quantity,
          totalPrice: state.totalPrice + (product.price * quantity)
        };
      } else {
        // Add new item
        const newItem = {
          key: itemKey,
          product,
          quantity,
          size,
          color,
          price: product.price
        };
        
        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + quantity,
          totalPrice: state.totalPrice + (product.price * quantity)
        };
      }
    }
    
    case CART_ACTIONS.REMOVE_FROM_CART: {
      const { itemKey } = action.payload;
      const itemToRemove = state.items.find(item => item.key === itemKey);
      
      if (!itemToRemove) return state;
      
      return {
        ...state,
        items: state.items.filter(item => item.key !== itemKey),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity)
      };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemKey, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_FROM_CART,
          payload: { itemKey }
        });
      }
      
      const itemIndex = state.items.findIndex(item => item.key === itemKey);
      if (itemIndex === -1) return state;
      
      const oldItem = state.items[itemIndex];
      const quantityDiff = quantity - oldItem.quantity;
      const priceDiff = oldItem.price * quantityDiff;
      
      const updatedItems = [...state.items];
      updatedItems[itemIndex] = { ...oldItem, quantity };
      
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDiff,
        totalPrice: state.totalPrice + priceDiff
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    
    case CART_ACTIONS.LOAD_CART:
      return action.payload || {
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useUser();

  // Load cart from localStorage on mount (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Loading cart from localStorage using SessionManager...');
      const savedCart = SessionManager.loadCart();
      if (savedCart && (savedCart.items?.length > 0 || savedCart.totalItems > 0)) {
        console.log('Cart loaded successfully:', savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: savedCart });
      }
    } else {
      // Clear cart if user is not authenticated
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated, user]);

  // Save cart to localStorage whenever state changes (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user && (state.items.length > 0 || state.totalItems > 0)) {
      SessionManager.saveCart(state);
      console.log('Cart saved to localStorage:', state);
    }
  }, [state, isAuthenticated, user]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      SessionManager.clearCart();
    }
  }, [isAuthenticated]);

  // Cart actions with authentication checks
  const addToCart = (product, quantity = 1, options = {}, onAuthRequired) => {
    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        // Default behavior: redirect to login
        window.location.href = '/login';
      }
      return false;
    }

    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { product, quantity, ...options }
    });
    return true;
  };

  const removeFromCart = (itemKey) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: { itemKey }
    });
  };

  const updateQuantity = (itemKey, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemKey, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    // Also clear from SessionManager
    SessionManager.clearCart();
  };

  const getItemQuantity = (productId, size, color) => {
    const itemKey = `${productId}-${size || 'default'}-${color || 'default'}`;
    const item = state.items.find(item => item.key === itemKey);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId, size, color) => {
    return getItemQuantity(productId, size, color) > 0;
  };

  const getCartTotal = () => {
    return state.totalPrice;
  };

  const getCartItemsCount = () => {
    return state.totalItems;
  };

  const value = {
    // State
    cartItems: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Utilities
    getItemQuantity,
    isInCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;

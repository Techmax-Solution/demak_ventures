import { createContext, useContext, useReducer, useEffect } from 'react';
import { useUser } from './UserContext';
import SessionManager from '../utils/sessionManager.js';

const WishlistContext = createContext();

// Wishlist action types
const WISHLIST_ACTIONS = {
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  LOAD_WISHLIST: 'LOAD_WISHLIST'
};

// Wishlist reducer
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.ADD_TO_WISHLIST: {
      const { product } = action.payload;
      
      // Check if item already exists in wishlist
      const existingItemIndex = state.items.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Item already in wishlist, return current state
        return state;
      } else {
        // Add new item
        const newItem = {
          _id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images,
          category: product.category,
          totalStock: product.totalStock
        };
        
        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + 1
        };
      }
    }
    
    case WISHLIST_ACTIONS.REMOVE_FROM_WISHLIST: {
      const { productId } = action.payload;
      
      const itemToRemove = state.items.find(item => item._id === productId);
      
      if (!itemToRemove) return state;
      
      return {
        ...state,
        items: state.items.filter(item => item._id !== productId),
        totalItems: state.totalItems - 1
      };
    }
    
    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return {
        items: [],
        totalItems: 0
      };
    
    case WISHLIST_ACTIONS.LOAD_WISHLIST:
      return action.payload || {
        items: [],
        totalItems: 0
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  totalItems: 0
};

// Wishlist provider component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated, user } = useUser();

  // Load wishlist from localStorage on mount (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Loading wishlist from localStorage...');
      const savedWishlist = SessionManager.loadWishlist();
      if (savedWishlist && (savedWishlist.items?.length > 0 || savedWishlist.totalItems > 0)) {
        console.log('Wishlist loaded successfully:', savedWishlist);
        dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: savedWishlist });
      }
    } else {
      // Clear wishlist if user is not authenticated
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
    }
  }, [isAuthenticated, user]);

  // Save wishlist to localStorage whenever state changes (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user && (state.items.length > 0 || state.totalItems > 0)) {
      SessionManager.saveWishlist(state);
      console.log('Wishlist saved to localStorage:', state);
    }
  }, [state, isAuthenticated, user]);

  // Clear wishlist when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
      SessionManager.clearWishlist();
    }
  }, [isAuthenticated]);

  // Wishlist actions with authentication checks
  const addToWishlist = (product, onAuthRequired) => {
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
      type: WISHLIST_ACTIONS.ADD_TO_WISHLIST,
      payload: { product }
    });
    return true;
  };

  const removeFromWishlist = (productId) => {
    if (!isAuthenticated) {
      return false;
    }

    dispatch({
      type: WISHLIST_ACTIONS.REMOVE_FROM_WISHLIST,
      payload: { productId }
    });
    return true;
  };

  const clearWishlist = () => {
    if (!isAuthenticated) {
      return false;
    }

    dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
    SessionManager.clearWishlist();
    return true;
  };

  const isInWishlist = (productId) => {
    return state.items.some(item => item._id === productId);
  };

  const getWishlistItemsCount = () => {
    return state.totalItems;
  };

  const value = {
    // State
    wishlistItems: state.items,
    totalItems: state.totalItems,
    
    // Actions
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    
    // Utilities
    isInWishlist,
    getWishlistItemsCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // Updated to match backend configuration
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Products API calls
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Handle multiple categories - backend expects single category parameter for each
    if (filters.categories && filters.categories.length > 0) {
      // For multiple categories, we'll use the first one or handle it client-side
      // Backend currently supports single category filter
      params.append('category', filters.categories[0]);
    }
    
    // Handle price range
    if (filters.priceRange && Array.isArray(filters.priceRange)) {
      const [min, max] = filters.priceRange;
      if (min !== undefined) params.append('minPrice', min.toString());
      if (max !== undefined) params.append('maxPrice', max.toString());
    }
    
    // Handle colors - backend expects single color parameter for each
    if (filters.colors && filters.colors.length > 0) {
      // For multiple colors, use the first one or handle client-side
      params.append('color', filters.colors[0]);
    }
    
    // Handle sizes - backend expects single size parameter
    if (filters.sizes && filters.sizes.length > 0) {
      // For multiple sizes, use the first one or handle client-side
      params.append('size', filters.sizes[0]);
    }
    
    // Handle sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          params.append('sortBy', 'price_asc');
          break;
        case 'price-high':
          params.append('sortBy', 'price_desc');
          break;
        case 'newest':
          params.append('sortBy', 'newest');
          break;
        default:
          params.append('sortBy', 'name');
      }
    }

    // Add pagination parameters
    params.append('limit', '50'); // Get more products for client-side filtering

    console.log('Fetching products with params:', params.toString());
    const response = await api.get(`/products?${params.toString()}`);
    
    // Return the products array from the response
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Enhance error information for better debugging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getProductFilters = async () => {
  try {
    const response = await api.get('/products/filters');
    return response.data;
  } catch (error) {
    console.error('Error fetching product filters:', error);
    throw error;
  }
};

// Orders API calls
export const getUserOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const cancelOrder = async (id) => {
  try {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// User API calls
export const updateUser = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Cart API calls (if implemented on backend)
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1, options = {}) => {
  try {
    const response = await api.post('/cart/add', {
      productId,
      quantity,
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Export the axios instance for direct use if needed
export default api;

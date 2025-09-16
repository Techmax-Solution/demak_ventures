import api from './api.js';

// Admin Products API
export const adminProductsAPI = {
  // Get all products for admin
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin products:', error);
      throw error;
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Upload image (placeholder - backend endpoint needs to be implemented)
  uploadImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
};

// Admin Categories API
export const adminCategoriesAPI = {
  // Get all categories
  getAllCategories: async (params = {}) => {
    try {
      const response = await api.get('/categories', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Create category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      console.log('🗑️ Attempting to delete category:', id);
      const response = await api.delete(`/categories/${id}`);
      console.log('✅ Category deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Re-throw the error with enhanced information
      if (error.response?.data?.message) {
        error.userMessage = error.response.data.message;
      }
      
      throw error;
    }
  },

  // Get category tree
  getCategoryTree: async () => {
    try {
      const response = await api.get('/categories/tree');
      return response.data;
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw error;
    }
  },

  // Get product filters (includes categories)
  getFilters: async () => {
    try {
      const response = await api.get('/products/filters');
      return response.data;
    } catch (error) {
      console.error('Error fetching filters:', error);
      throw error;
    }
  }
};

// Admin Users API
export const adminUsersAPI = {
  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user (deactivate)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
};

// Admin Orders API
export const adminOrdersAPI = {
  // Get all orders
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/orders/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Mark order as delivered
  markOrderDelivered: async (id, trackingData) => {
    try {
      const response = await api.put(`/orders/${id}/deliver`, trackingData);
      return response.data;
    } catch (error) {
      console.error('Error marking order delivered:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStats: async () => {
    try {
      const response = await api.get('/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }
};

export default {
  products: adminProductsAPI,
  categories: adminCategoriesAPI,
  users: adminUsersAPI,
  orders: adminOrdersAPI
};

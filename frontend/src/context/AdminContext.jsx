import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';
import { useUser } from './UserContext';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user, isAuthenticated, loading: userLoading, login: userLogin, logout: userLogout } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Monitor user changes from UserContext and update admin state accordingly
  useEffect(() => {
    console.log('🔍 AdminContext: User state changed', {
      isAuthenticated,
      userLoading,
      user: user ? { name: user.name, email: user.email, role: user.role } : null,
      currentIsAdmin: isAdmin
    });
    
    // Only update admin state when UserContext is not loading
    if (!userLoading) {
      if (isAuthenticated && user && user.role === 'admin') {
        console.log('✅ AdminContext: Setting isAdmin to true');
        setIsAdmin(true);
      } else {
        console.log('❌ AdminContext: Setting isAdmin to false', {
          reason: !isAuthenticated ? 'not authenticated' : 
                  !user ? 'no user data' : 
                  user.role !== 'admin' ? 'not admin role' : 'unknown'
        });
        setIsAdmin(false);
      }
      // Set loading to false when UserContext finishes loading
      setLoading(false);
    } else {
      console.log('⏳ AdminContext: UserContext still loading, waiting...');
    }
  }, [isAuthenticated, user, userLoading]);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated and is admin
      if (isAuthenticated && user && user.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 AdminContext: Starting admin login...');
      
      // Use UserContext login first
      const response = await userLogin(credentials);
      console.log('✅ AdminContext: UserContext login successful', {
        name: response.name,
        email: response.email,
        role: response.role
      });
      
      if (response.role !== 'admin') {
        console.log('❌ AdminContext: User is not admin, logging out...');
        // If not admin, logout from UserContext
        await userLogout();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Set admin state
      console.log('✅ AdminContext: Setting isAdmin to true');
      setIsAdmin(true);
      
      return response;
    } catch (error) {
      console.error('❌ AdminContext: Admin login failed:', error);
      setIsAdmin(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Use UserContext logout
      await userLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAdmin(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading: loading || userLoading, // Show loading if either context is loading
    login,
    logout,
    checkAuth
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;

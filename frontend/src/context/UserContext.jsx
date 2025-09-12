import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

  const checkAuth = async () => {
    try {
      setAuthChecked(true);
      const token = localStorage.getItem('token');
      const loginExpiry = localStorage.getItem('loginExpiry');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !loginExpiry) {
        setLoading(false);
        return;
      }

      // Check if login has expired
      const currentTime = new Date().getTime();
      if (currentTime > parseInt(loginExpiry)) {
        // Login has expired, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginExpiry');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // If we have a stored user and token is not expired, use it first
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }

      // Then verify with server (but don't block UI)
      try {
        const userData = await authAPI.getProfile();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          // Update stored user data if different
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginExpiry');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // If profile request fails but token is not expired, keep user logged in
        // Only log out if it's a clear authentication failure
        if (error.response?.status === 401) {
          console.error('Auth check failed - token invalid:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginExpiry');
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Network error or other issue - keep user logged in with stored data
          console.warn('Auth check failed but keeping user logged in:', error);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginExpiry');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Set expiration time to 3 days from now
      const expirationTime = new Date().getTime() + (3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('loginExpiry', expirationTime.toString());
      
      setUser(response);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Set expiration time to 3 days from now
      const expirationTime = new Date().getTime() + (3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('loginExpiry', expirationTime.toString());
      
      setUser(response);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginExpiry');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

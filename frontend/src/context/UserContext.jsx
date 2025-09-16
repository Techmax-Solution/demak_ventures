import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api.js';
import SessionManager from '../utils/sessionManager.js';
import { debugAuth } from '../utils/debugAuth.js';

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
  const [initialized, setInitialized] = useState(false);
  const initializingRef = useRef(false);
  const stateChangeCountRef = useRef(0);

  // Wrapper for setUser to track all changes
  const setUserWithTracking = (newUser, reason = 'unknown') => {
    console.log(`👤 Setting user (${reason}):`, {
      from: user ? (user.name || user.email) : 'null',
      to: newUser ? (newUser.name || newUser.email) : 'null',
      stack: new Error().stack.split('\n')[2]?.trim()
    });
    setUser(newUser);
  };

  // Track user state changes to detect unexpected resets
  useEffect(() => {
    stateChangeCountRef.current += 1;
    console.log(`🔄 User state changed (#${stateChangeCountRef.current}):`, {
      user: user ? (user.name || user.email) : 'null',
      isAuthenticated,
      loading,
      initialized
    });
    
    // Alert if user is unexpectedly cleared
    if (stateChangeCountRef.current > 2 && !user && !loading) {
      console.error('🚨 ALERT: User state was cleared unexpectedly!');
      debugAuth();
    }
  }, [user, isAuthenticated, loading, initialized]);

  // Initialize authentication on mount - always run on page load
  useEffect(() => {
    let isMounted = true;
    
    const runInitialization = async () => {
      if (isMounted) {
        console.log('🏁 Component mounted, starting auth initialization...');
        // Reset flags to ensure fresh initialization on every page load
        setInitialized(false);
        initializingRef.current = false;
        await initializeAuth();
      }
    };
    
    runInitialization();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for storage changes to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === 'user_backup' || e.key === 'loginExpiry' || e.key === 'sessionId') {
        console.log('🔄 Auth storage changed in another tab, refreshing auth state');
        console.log('📋 Storage change details:', { key: e.key, oldValue: e.oldValue, newValue: e.newValue });
        setInitialized(false);
        initializingRef.current = false;
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodic check to ensure session persistence (every 10 seconds for debugging)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAuthenticated && user) {
        const sessionData = SessionManager.loadUserSession();
        if (!sessionData) {
          console.error('🚨 CRITICAL: Session data lost unexpectedly!');
          debugAuth();
          // Try to restore from backup or re-initialize
          setInitialized(false);
          initializingRef.current = false;
          initializeAuth();
        } else {
          console.log('✅ Session check passed - user still authenticated:', user.name || user.email);
        }
      } else if (isAuthenticated && !user) {
        console.error('🚨 INCONSISTENT STATE: isAuthenticated=true but user=null');
        debugAuth();
      }
    }, 10000); // Check every 10 seconds for debugging

    return () => clearInterval(intervalId);
  }, [isAuthenticated, user]);

  const initializeAuth = async () => {
    // Prevent concurrent execution but allow re-initialization
    if (initializingRef.current) {
      console.log('🔄 Auth initialization already in progress, skipping...');
      return;
    }

    console.log('🚀 Initializing authentication...');
    console.log('📊 Current state - User:', !!user, 'Authenticated:', isAuthenticated, 'Loading:', loading, 'Initialized:', initialized);
    debugAuth(); // Debug localStorage contents
    
    // Set flag to prevent concurrent execution
    initializingRef.current = true;
    
    try {
      // Use SessionManager to load session data
      const sessionData = SessionManager.loadUserSession();
      
      if (!sessionData) {
        console.log('❌ No valid session found');
        setUserWithTracking(null, 'no-session-data');
        setIsAuthenticated(false);
        setLoading(false);
        setInitialized(true);
        return;
      }

      console.log('✅ Valid session found, restoring user:', sessionData.user.email || sessionData.user.name);
      console.log('📋 Session data:', sessionData);
      
      // Immediately restore user state from valid session
      console.log('🔄 Setting user state...', {
        userBefore: !!user,
        authenticatedBefore: isAuthenticated,
        loadingBefore: loading,
        userToSet: sessionData.user.name || sessionData.user.email
      });
      
      setUserWithTracking(sessionData.user, 'session-restore');
      setIsAuthenticated(true);
      setLoading(false);
      setInitialized(true);
      
      // Add a small delay to ensure state is properly set before any other operations
      setTimeout(() => {
        console.log('🔍 Post-restore state check:', {
          user: !!user,
          isAuthenticated,
          loading,
          userName: user?.name || user?.email || 'NO_USER'
        });
      }, 50);
      
      console.log('✅ User state updated - User:', !!sessionData.user, 'Authenticated: true, Loading: false');
      
      // Verify the state was actually set (async state updates)
      setTimeout(() => {
        console.log('🔍 State verification after 100ms:', {
          user: !!user,
          isAuthenticated,
          loading,
          userName: user?.name || user?.email || 'NO_USER'
        });
      }, 100);

      // Verify with server in background (don't change state on network errors)
      // Only verify if we have a valid token
      if (sessionData.token) {
        verifyWithServer();
      }
      
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      setUserWithTracking(null, 'initialization-error');
      setIsAuthenticated(false);
      setLoading(false);
      setInitialized(true);
    } finally {
      initializingRef.current = false;
    }
  };

  const verifyWithServer = async () => {
    try {
      console.log('🔄 Verifying session with server...');
      const userData = await authAPI.getProfile();
      
      if (userData) {
        console.log('✅ Server verification successful, user data:', userData);
        setUserWithTracking(userData, 'server-verification');
        setIsAuthenticated(true);
        // Update stored user data
        SessionManager.saveData(SessionManager.KEYS.USER, userData);
      } else {
        console.log('❌ Server says no user, clearing session');
        clearSession();
      }
    } catch (error) {
      console.error('🚨 Server verification error details:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      
      // Only log out on explicit auth errors, not network errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('❌ Server rejected token, clearing session:', error.response.status);
        clearSession();
      } else {
        console.warn('⚠️ Server verification failed (network/server error), keeping user logged in:', error.message);
        // Keep user logged in with stored data on network errors
      }
    }
  };

  const clearSession = () => {
    console.log('🧹 Clearing user session');
    SessionManager.clearUserSession();
    setUserWithTracking(null, 'clear-session');
    setIsAuthenticated(false);
    setInitialized(false);
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Logging in user...');
      const response = await authAPI.login(credentials);
      
      // Set expiration time to 7 days from now (longer persistence)
      const expirationTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
      
      console.log('✅ Login successful, storing comprehensive auth data');
      // Use SessionManager for comprehensive data storage
      SessionManager.saveUserSession(response, response.token, expirationTime);
      
      setUserWithTracking(response, 'login-success');
      setIsAuthenticated(true);
      setLoading(false);
      setInitialized(true);
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registering user...');
      const response = await authAPI.register(userData);
      
      console.log('✅ Registration successful, user needs to verify email');
      console.log('📋 Registration response:', response);
      
      // Don't set user as authenticated or store session data
      // User needs to verify email first
      setUserWithTracking(null, 'register-success-no-verification');
      setIsAuthenticated(false);
      setLoading(false);
      setInitialized(true);
      
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await authAPI.logout();
    } catch (error) {
      console.error('⚠️ Logout error:', error);
    } finally {
      clearSession();
      setLoading(false);
    }
  };

  // Manual refresh function for components that need to re-check auth
  const refreshAuth = async () => {
    console.log('🔄 Manually refreshing auth...');
    setInitialized(false);
    initializingRef.current = false;
    await initializeAuth();
  };

  // Force re-check auth (useful for debugging)
  const checkAuth = async () => {
    console.log('🔍 Force checking auth...');
    await verifyWithServer();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    refreshAuth
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
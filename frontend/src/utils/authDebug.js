// Authentication Debug Utility
// This utility helps debug authentication issues by providing detailed information
// about the current authentication state and session data

import SessionManager from './sessionManager.js';

export const debugAuthState = () => {
  console.group('🔍 Authentication Debug Information');
  
  // Check localStorage contents
  console.log('📦 localStorage Contents:');
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      try {
        const value = localStorage.getItem(key);
        if (key.includes('token') || key.includes('user') || key.includes('session')) {
          console.log(`  ${key}:`, value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : 'null');
        }
      } catch (e) {
        console.log(`  ${key}: [Error reading]`);
      }
    }
  }
  
  // Check session data
  console.log('\n🔐 Session Data:');
  const sessionData = SessionManager.loadUserSession();
  if (sessionData) {
    console.log('  Has Session:', true);
    console.log('  Has Token:', !!sessionData.token);
    console.log('  Token Length:', sessionData.token ? sessionData.token.length : 0);
    console.log('  User Email:', sessionData.user?.email || 'N/A');
    console.log('  User Role:', sessionData.user?.role || 'N/A');
    console.log('  Session Valid:', sessionData.timeRemaining > 0 ? 'Yes' : 'No');
    console.log('  Time Remaining:', Math.floor(sessionData.timeRemaining / (1000 * 60 * 60)) + ' hours');
  } else {
    console.log('  Has Session:', false);
  }
  
  // Check current URL and route
  console.log('\n🌐 Current Location:');
  console.log('  URL:', window.location.href);
  console.log('  Path:', window.location.pathname);
  console.log('  Is Admin Route:', window.location.pathname.startsWith('/admin'));
  
  // Check if we're in an admin context
  console.log('\n👑 Admin Context:');
  console.log('  Current User Agent:', navigator.userAgent);
  console.log('  Timestamp:', new Date().toISOString());
  
  console.groupEnd();
};

export const testAuthRequest = async () => {
  console.group('🧪 Testing Authentication Request');
  
  try {
    // Import the API service
    const { authAPI } = await import('../services/api.js');
    
    console.log('📡 Testing profile request...');
    const response = await authAPI.getProfile();
    console.log('✅ Auth request successful:', response);
    return response;
  } catch (error) {
    console.error('❌ Auth request failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    return null;
  } finally {
    console.groupEnd();
  }
};

export const clearAuthData = () => {
  console.log('🧹 Clearing all authentication data...');
  SessionManager.clearUserSession();
  console.log('✅ Authentication data cleared');
};

// Auto-run debug when imported in development
if (process.env.NODE_ENV === 'development') {
  // Add to window for easy access in console
  window.debugAuth = debugAuthState;
  window.testAuth = testAuthRequest;
  window.clearAuth = clearAuthData;
  
  console.log('🛠️ Auth debug utilities available:');
  console.log('  - debugAuth() - Show current auth state');
  console.log('  - testAuth() - Test authentication request');
  console.log('  - clearAuth() - Clear all auth data');
}

export default {
  debugAuthState,
  testAuthRequest,
  clearAuthData
};

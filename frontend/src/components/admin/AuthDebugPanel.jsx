import { useState, useEffect } from 'react';
import SessionManager from '../../utils/sessionManager.js';
import { authAPI } from '../../services/api.js';

const AuthDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const gatherDebugInfo = () => {
    console.log('🔍 Gathering debug information...');
    
    const sessionData = SessionManager.loadUserSession();
    const localStorageData = {};
    
    // Get all localStorage items
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const value = localStorage.getItem(key);
          localStorageData[key] = value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : null;
        } catch (e) {
          localStorageData[key] = '[Error reading]';
        }
      }
    }

    const info = {
      timestamp: new Date().toISOString(),
      sessionData: sessionData ? {
        hasSession: true,
        hasToken: !!sessionData.token,
        tokenLength: sessionData.token?.length || 0,
        tokenStart: sessionData.token ? sessionData.token.substring(0, 30) + '...' : 'null',
        userEmail: sessionData.user?.email,
        userRole: sessionData.user?.role,
        userActive: sessionData.user?.isActive,
        timeRemaining: sessionData.timeRemaining
      } : { hasSession: false },
      localStorageData,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent
    };

    setDebugInfo(info);
    return info;
  };

  const testAuthRequest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testing authentication request...');
      const response = await authAPI.getProfile();
      setTestResult({
        success: true,
        data: response,
        message: 'Authentication test successful'
      });
      console.log('✅ Auth test successful:', response);
    } catch (error) {
      const errorInfo = {
        success: false,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        hasAuthHeader: !!error.config?.headers?.Authorization,
        authHeaderStart: error.config?.headers?.Authorization ? 
          error.config.headers.Authorization.substring(0, 30) + '...' : 'none'
      };
      setTestResult(errorInfo);
      console.error('❌ Auth test failed:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const clearAllAuthData = () => {
    console.log('🧹 Clearing all authentication data...');
    SessionManager.clearUserSession();
    setDebugInfo(null);
    setTestResult(null);
    console.log('✅ Authentication data cleared');
  };

  const fixTokenQuotes = () => {
    console.log('🔧 Attempting to fix token quotes...');
    
    try {
      // Check and fix token in localStorage
      let token = localStorage.getItem('token');
      if (token && (token.startsWith('"') || token.includes('\\"'))) {
        const cleanToken = token.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
        localStorage.setItem('token', cleanToken);
        console.log('✅ Fixed token in localStorage');
      }
      
      // Check and fix token in user object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.token && (user.token.startsWith('"') || user.token.includes('\\"'))) {
          user.token = user.token.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
          localStorage.setItem('user', JSON.stringify(user));
          console.log('✅ Fixed token in user object');
        }
      }
      
      // Refresh debug info
      gatherDebugInfo();
      console.log('✅ Token quote fix completed');
    } catch (error) {
      console.error('❌ Error fixing token quotes:', error);
    }
  };

  useEffect(() => {
    gatherDebugInfo();
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Authentication Debug Panel</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2 flex-wrap gap-2">
          <button
            onClick={gatherDebugInfo}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Refresh Debug Info
          </button>
          <button
            onClick={testAuthRequest}
            disabled={loading}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Auth Request'}
          </button>
          <button
            onClick={fixTokenQuotes}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
          >
            Fix Token Quotes
          </button>
          <button
            onClick={clearAllAuthData}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Clear Auth Data
          </button>
        </div>

        {debugInfo && (
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">Session Information:</h4>
            <pre className="text-xs text-gray-600 overflow-auto max-h-40">
              {JSON.stringify(debugInfo.sessionData, null, 2)}
            </pre>
          </div>
        )}

        {testResult && (
          <div className={`p-3 rounded border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h4 className={`font-medium mb-2 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
              Test Result: {testResult.success ? '✅ Success' : '❌ Failed'}
            </h4>
            <pre className="text-xs text-gray-600 overflow-auto max-h-40">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo && (
          <details className="bg-white p-3 rounded border">
            <summary className="font-medium text-gray-700 cursor-pointer">LocalStorage Contents</summary>
            <pre className="text-xs text-gray-600 overflow-auto max-h-40 mt-2">
              {JSON.stringify(debugInfo.localStorageData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default AuthDebugPanel;

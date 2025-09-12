import { useState, useEffect } from 'react';
import SessionManager from '../utils/sessionManager.js';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';

const SessionDebugger = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const { user, isAuthenticated } = useUser();
  const { cartItems, totalItems } = useCart();

  useEffect(() => {
    if (showDebugger) {
      const info = SessionManager.getStorageInfo();
      setStorageInfo(info);
    }
  }, [showDebugger, user, cartItems]);

  const exportData = () => {
    const data = SessionManager.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This will log you out and clear your cart.')) {
      SessionManager.clearAllAppData();
      window.location.reload();
    }
  };

  if (!showDebugger) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebugger(true)}
          className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
          title="Show Session Debug Info"
        >
          Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Session Storage</h3>
        <button
          onClick={() => setShowDebugger(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>Authentication:</strong> {isAuthenticated ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? user.email || user.name : 'None'}
        </div>
        
        <div>
          <strong>Cart Items:</strong> {totalItems}
        </div>
        
        {storageInfo && (
          <div>
            <strong>Storage:</strong> {storageInfo.totalSizeKB} KB
          </div>
        )}
        
        <div>
          <strong>Session Valid:</strong> {SessionManager.isSessionValid() ? '✅' : '❌'}
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <button
          onClick={exportData}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
        >
          Export Data
        </button>
        
        <button
          onClick={clearAllData}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
};

export default SessionDebugger;

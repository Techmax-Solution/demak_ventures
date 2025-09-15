// Session Manager - Comprehensive localStorage management
// This utility ensures all user data, cart, and session info persists across browser sessions

export class SessionManager {
  // Keys for localStorage
  static KEYS = {
    TOKEN: 'token',
    USER: 'user',
    USER_BACKUP: 'user_backup',
    LOGIN_EXPIRY: 'loginExpiry',
    LOGIN_TIMESTAMP: 'loginTimestamp',
    SESSION_ID: 'sessionId',
    CART: 'cart',
    CART_BACKUP: 'cart_backup',
    CART_TIMESTAMP: 'cart_timestamp',
    USER_PREFERENCES: 'user_preferences',
    SEARCH_HISTORY: 'search_history',
    VIEWED_PRODUCTS: 'viewed_products',
    SESSION_METADATA: 'session_metadata'
  };

  // Save data with automatic backup
  static saveData(key, data, createBackup = true) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      
      if (createBackup) {
        localStorage.setItem(`${key}_backup`, serializedData);
      }
      
      // Update timestamp
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
      
      console.log(`Data saved to localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error saving data to localStorage: ${key}`, error);
      return false;
    }
  }

  // Load data with automatic fallback to backup
  static loadData(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      
      // Try backup if main data doesn't exist
      const backupData = localStorage.getItem(`${key}_backup`);
      if (backupData) {
        console.log(`Using backup data for: ${key}`);
        const parsedBackup = JSON.parse(backupData);
        // Restore main data from backup
        this.saveData(key, parsedBackup, false);
        return parsedBackup;
      }
      
      return defaultValue;
    } catch (error) {
      console.error(`Error loading data from localStorage: ${key}`, error);
      
      // Try backup on parse error
      try {
        const backupData = localStorage.getItem(`${key}_backup`);
        if (backupData) {
          console.log(`Using backup data after parse error: ${key}`);
          return JSON.parse(backupData);
        }
      } catch (backupError) {
        console.error(`Error loading backup data: ${key}`, backupError);
      }
      
      return defaultValue;
    }
  }

  // Clear specific data and its backup
  static clearData(key) {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_backup`);
    localStorage.removeItem(`${key}_timestamp`);
    console.log(`Cleared data: ${key}`);
  }

  // Save complete user session
  static saveUserSession(userData, token, expiryTime) {
    // Clean the token to ensure no extra quotes
    const cleanToken = token ? token.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"') : token;
    
    const sessionData = {
      user: userData,
      token: cleanToken,
      loginExpiry: expiryTime,
      loginTimestamp: Date.now(),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userAgent: navigator.userAgent,
      lastActivity: Date.now()
    };

    // Save individual components
    this.saveData(this.KEYS.TOKEN, cleanToken);
    this.saveData(this.KEYS.USER, userData);
    this.saveData(this.KEYS.LOGIN_EXPIRY, expiryTime.toString());
    this.saveData(this.KEYS.LOGIN_TIMESTAMP, sessionData.loginTimestamp.toString());
    this.saveData(this.KEYS.SESSION_ID, sessionData.sessionId);
    
    // Save complete session metadata
    this.saveData(this.KEYS.SESSION_METADATA, sessionData);
    
    console.log('Complete user session saved to localStorage');
    return sessionData;
  }

  // Load complete user session
  static loadUserSession() {
    try {
      let token = localStorage.getItem(this.KEYS.TOKEN);
      const user = this.loadData(this.KEYS.USER);
      const loginExpiry = localStorage.getItem(this.KEYS.LOGIN_EXPIRY);
      const sessionMetadata = this.loadData(this.KEYS.SESSION_METADATA);

      console.log('📋 Loading session - Token:', !!token, 'User:', !!user, 'Expiry:', loginExpiry);

      // More flexible session validation - if we have user and expiry, try to restore
      if (!user || !loginExpiry) {
        console.log('❌ Incomplete session data, cannot restore session');
        return null;
      }
      
      // If token is missing from localStorage but exists in user object, use it
      if (!token && user && user.token) {
        console.log('🔄 Token missing from localStorage but found in user object, restoring...');
        token = user.token;
        // Save it back to localStorage for future use
        localStorage.setItem(this.KEYS.TOKEN, token);
      }
      
      // Clean the token to remove any extra quotes
      if (token) {
        token = token.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
      }
      
      // If token is still missing, log warning but continue
      if (!token) {
        console.warn('⚠️ Token missing completely - user will need to re-authenticate for server requests');
      }

      // Check if session is expired
      const currentTime = Date.now();
      const expiryTime = parseInt(loginExpiry);
      
      if (currentTime > expiryTime) {
        console.log('⏰ Session expired, clearing data');
        this.clearUserSession();
        return null;
      }

      // Calculate time remaining
      const timeRemaining = expiryTime - currentTime;
      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      console.log(`✅ Valid session loaded - Time remaining: ${daysRemaining}d ${hoursRemaining}h`);
      
      return {
        token,
        user,
        loginExpiry: expiryTime,
        sessionMetadata,
        timeRemaining
      };
    } catch (error) {
      console.error('❌ Error loading user session:', error);
      return null;
    }
  }

  // Clear complete user session
  static clearUserSession() {
    this.clearData(this.KEYS.TOKEN);
    this.clearData(this.KEYS.USER);
    this.clearData(this.KEYS.LOGIN_EXPIRY);
    this.clearData(this.KEYS.LOGIN_TIMESTAMP);
    this.clearData(this.KEYS.SESSION_ID);
    this.clearData(this.KEYS.SESSION_METADATA);
    console.log('Complete user session cleared');
  }

  // Save cart data
  static saveCart(cartData) {
    return this.saveData(this.KEYS.CART, cartData);
  }

  // Load cart data
  static loadCart() {
    return this.loadData(this.KEYS.CART, {
      items: [],
      totalItems: 0,
      totalPrice: 0
    });
  }

  // Clear cart data
  static clearCart() {
    this.clearData(this.KEYS.CART);
  }

  // Save user preferences (theme, language, etc.)
  static saveUserPreferences(preferences) {
    return this.saveData(this.KEYS.USER_PREFERENCES, preferences);
  }

  // Load user preferences
  static loadUserPreferences() {
    return this.loadData(this.KEYS.USER_PREFERENCES, {
      theme: 'light',
      language: 'en',
      currency: 'USD',
      notifications: true
    });
  }

  // Save search history
  static saveSearchHistory(searchTerms) {
    const history = this.loadData(this.KEYS.SEARCH_HISTORY, []);
    const updatedHistory = [searchTerms, ...history.slice(0, 9)]; // Keep last 10 searches
    return this.saveData(this.KEYS.SEARCH_HISTORY, updatedHistory);
  }

  // Load search history
  static loadSearchHistory() {
    return this.loadData(this.KEYS.SEARCH_HISTORY, []);
  }

  // Save viewed products
  static saveViewedProduct(productId) {
    const viewed = this.loadData(this.KEYS.VIEWED_PRODUCTS, []);
    const updated = [productId, ...viewed.filter(id => id !== productId).slice(0, 19)]; // Keep last 20
    return this.saveData(this.KEYS.VIEWED_PRODUCTS, updated);
  }

  // Load viewed products
  static loadViewedProducts() {
    return this.loadData(this.KEYS.VIEWED_PRODUCTS, []);
  }

  // Update last activity timestamp
  static updateActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  // Check if session is still valid
  static isSessionValid() {
    const session = this.loadUserSession();
    return session !== null;
  }

  // Get storage usage info
  static getStorageInfo() {
    let totalSize = 0;
    const info = {};
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length;
        totalSize += size;
        info[key] = size;
      }
    }
    
    return {
      totalSize,
      totalSizeKB: Math.round(totalSize / 1024),
      items: info
    };
  }

  // Clear all app data (for reset/logout)
  static clearAllAppData() {
    Object.values(this.KEYS).forEach(key => {
      this.clearData(key);
    });
    
    // Clear additional keys
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('rememberedEmail');
    
    console.log('All app data cleared from localStorage');
  }

  // Export all data (for backup/transfer)
  static exportAllData() {
    const data = {};
    Object.values(this.KEYS).forEach(key => {
      const value = this.loadData(key);
      if (value !== null) {
        data[key] = value;
      }
    });
    
    return {
      exportDate: new Date().toISOString(),
      data
    };
  }

  // Import data (from backup/transfer)
  static importData(exportedData) {
    try {
      if (!exportedData.data) {
        throw new Error('Invalid data format');
      }
      
      Object.entries(exportedData.data).forEach(([key, value]) => {
        this.saveData(key, value);
      });
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Auto-update activity on user interactions
if (typeof window !== 'undefined') {
  ['click', 'keydown', 'scroll', 'mousemove'].forEach(event => {
    let lastUpdate = 0;
    window.addEventListener(event, () => {
      const now = Date.now();
      if (now - lastUpdate > 30000) { // Update every 30 seconds max
        SessionManager.updateActivity();
        lastUpdate = now;
      }
    }, { passive: true });
  });
}

export default SessionManager;

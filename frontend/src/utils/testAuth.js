// Test utility to manually create auth data for testing
export const createTestAuthData = () => {
  const testUser = {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };
  
  const testToken = 'test-jwt-token-12345';
  const expirationTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000); // 7 days
  
  console.log('🧪 Creating test auth data...');
  
  localStorage.setItem('token', testToken);
  localStorage.setItem('user', JSON.stringify(testUser));
  localStorage.setItem('user_backup', JSON.stringify(testUser));
  localStorage.setItem('loginExpiry', expirationTime.toString());
  localStorage.setItem('loginTimestamp', Date.now().toString());
  localStorage.setItem('sessionId', `test-session-${Date.now()}`);
  
  console.log('✅ Test auth data created');
  console.log('📋 Test user:', testUser);
  console.log('🔑 Test token:', testToken);
  console.log('⏰ Expires:', new Date(expirationTime).toLocaleString());
  
  return { testUser, testToken, expirationTime };
};

export const clearTestAuthData = () => {
  console.log('🧹 Clearing test auth data...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_backup');
  localStorage.removeItem('loginExpiry');
  localStorage.removeItem('loginTimestamp');
  localStorage.removeItem('sessionId');
  console.log('✅ Test auth data cleared');
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.createTestAuth = createTestAuthData;
  window.clearTestAuth = clearTestAuthData;
}

export default { createTestAuthData, clearTestAuthData };

// Debug utility to check authentication state
export const debugAuth = () => {
  console.log('🔍 AUTH DEBUG REPORT 🔍');
  console.log('========================');
  
  // Check localStorage contents
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const loginExpiry = localStorage.getItem('loginExpiry');
  const loginTimestamp = localStorage.getItem('loginTimestamp');
  const sessionId = localStorage.getItem('sessionId');
  
  console.log('📦 LocalStorage Contents:');
  console.log('  Token:', token ? '✅ Present' : '❌ Missing');
  console.log('  User:', user ? '✅ Present' : '❌ Missing');
  console.log('  Login Expiry:', loginExpiry);
  console.log('  Login Timestamp:', loginTimestamp);
  console.log('  Session ID:', sessionId);
  
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      console.log('  Parsed User:', parsedUser);
    } catch (e) {
      console.error('  ❌ User data corrupted:', e);
    }
  }
  
  // Check expiry
  if (loginExpiry) {
    const currentTime = Date.now();
    const expiryTime = parseInt(loginExpiry);
    
    // Validate the expiry time
    if (isNaN(expiryTime) || expiryTime <= 0) {
      console.log('⏰ Session Timing:');
      console.log('  ❌ Invalid expiry time:', loginExpiry);
      return;
    }
    
    const isExpired = currentTime > expiryTime;
    const timeLeft = expiryTime - currentTime;
    
    console.log('⏰ Session Timing:');
    console.log('  Current Time:', new Date(currentTime).toLocaleString());
    console.log('  Expiry Time:', new Date(expiryTime).toLocaleString());
    console.log('  Is Expired:', isExpired ? '❌ YES' : '✅ NO');
    
    if (!isExpired && timeLeft > 0) {
      const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      console.log('  Time Remaining:', `${daysLeft}d ${hoursLeft}h`);
    }
  }
  
  console.log('========================');
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}

export default debugAuth;

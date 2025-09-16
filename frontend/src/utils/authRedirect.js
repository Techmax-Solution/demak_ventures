// Authentication redirect utility
// Provides consistent behavior for redirecting unauthenticated users

// Modal-based authentication handler
export const createAuthHandler = (setShowModal, setModalAction) => {
  return (action = 'perform this action') => {
    setModalAction(action);
    setShowModal(true);
  };
};

// Legacy confirm dialog functions (kept for backward compatibility)
export const handleAuthRequired = (action = 'perform this action') => {
  // Show a confirmation dialog before redirecting
  const shouldRedirect = window.confirm(
    `You need to create an account to ${action}. Would you like to create an account now?`
  );
  
  if (shouldRedirect) {
    // Redirect to register page
    window.location.href = '/register';
  }
};

export const handleAuthRequiredForCart = () => {
  return handleAuthRequired('add items to your cart');
};

export const handleAuthRequiredForWishlist = () => {
  return handleAuthRequired('add items to your wishlist');
};

export const handleAuthRequiredForCheckout = () => {
  return handleAuthRequired('proceed to checkout');
};

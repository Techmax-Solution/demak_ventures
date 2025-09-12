import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import ProfileSidebar from './ProfileSidebar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [wishlistCount] = useState(0); // Add wishlist state
  const location = useLocation();
  const { getCartItemsCount } = useCart();
  const { isAuthenticated, user, logout } = useUser();

  const isActive = (path) => location.pathname === path;

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/shop', label: 'SHOP' },
    { path: '/products', label: 'PRODUCTS' },
    { path: '/blog', label: 'BLOG' },
    
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-20">
        <div className="flex justify-between items-center py-6 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-black tracking-wide">Demak</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium text-sm tracking-wide transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-black'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-800 hover:text-black transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center space-x-2 p-2 text-gray-800 hover:text-black transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-800 hover:text-black transition-colors duration-200 text-sm font-medium px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 text-gray-800 hover:text-black transition-colors duration-200 relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="p-2 text-gray-800 hover:text-black transition-colors duration-200 relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
              </svg>
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-800 hover:text-black transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}>
          {/* Backdrop with blur - only covers area below navbar */}
          <div 
            className="fixed inset-0 top-[88px] backdrop-blur-md transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Slide-in Menu - positioned below navbar */}
          <div className={`fixed top-[88px] right-0 bottom-0 w-[70%] bg-white shadow-2xl transition-transform duration-500 ease-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
              {/* Menu Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <span className="text-xl font-bold text-black">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-800 hover:text-black transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Navigation Links */}
                <div className="flex flex-col space-y-1 p-6">
                  {navLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`font-medium text-lg tracking-wide transition-colors duration-200 py-4 px-2 rounded-lg ${
                        isActive(link.path)
                          ? 'text-black bg-gray-50'
                          : 'text-gray-700 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mx-6" />

                {/* Action Items */}
                <div className="p-6 space-y-4">
                  {/* Search */}
                  <button className="flex items-center space-x-3 w-full p-3 text-gray-800 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-base font-medium">Search</span>
                  </button>

                  {/* User Profile for Mobile */}
                  {isAuthenticated ? (
                    <button 
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full p-3 text-gray-800 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-base font-medium">
                        {user?.name?.split(' ')[0] || 'Profile'}
                      </span>
                    </button>
                  ) : (
                    <Link 
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 w-full p-3 text-gray-800 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-base font-medium">Login</span>
                    </Link>
                  )}

                  {/* Wishlist */}
                  <Link 
                    to="/wishlist" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 w-full p-3 text-gray-800 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200 relative"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-base font-medium">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* Cart */}
                  <Link 
                    to="/cart" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 w-full p-3 text-gray-800 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200 relative"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                    </svg>
                    <span className="text-base font-medium">Cart</span>
                    {getCartItemsCount() > 0 && (
                      <span className="ml-auto bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Authentication Section for Mobile - Only show if not authenticated */}
                {!isAuthenticated && (
                  <>
                    <div className="border-t border-gray-100 mx-6" />
                    <div className="p-6 space-y-3">
                      <Link
                        to="/register"
                        className="block w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-base font-medium text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  </>
                )}

                {/* Footer space */}
                <div className="flex-1" />
              </div>
            </div>
          </div>
        </div>

      {/* Profile Sidebar */}
      <ProfileSidebar 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;

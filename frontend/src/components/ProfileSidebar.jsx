import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const ProfileSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
      isOpen ? 'visible opacity-100' : 'invisible opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isOpen ? ' bg-opacity-25' : 'bg-black bg-opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`absolute top-0 right-0 h-full w-full sm:w-96 lg:w-[420px] bg-white shadow-2xl z-10 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 transform transition-all duration-400 ease-out ${
            isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`} style={{ transitionDelay: isOpen ? '150ms' : '0ms' }}>
            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Profile Info */}
          <div className={`p-6 border-b border-gray-200 transform transition-all duration-400 ease-out ${
            isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`} style={{ transitionDelay: isOpen ? '250ms' : '0ms' }}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105">
                <span className="text-white text-xl font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</h3>
                <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            
            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="text-lg font-semibold text-gray-900">0</div>
                <div className="text-xs text-gray-600">Orders</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="text-lg font-semibold text-gray-900">0</div>
                <div className="text-xs text-gray-600">Wishlist</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="text-lg font-semibold text-gray-900">0</div>
                <div className="text-xs text-gray-600">Reviews</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className={`flex-1 p-6 transform transition-all duration-400 ease-out ${
            isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`} style={{ transitionDelay: isOpen ? '350ms' : '0ms' }}>
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 hover:shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                <span className="text-gray-700 font-medium">Dashboard</span>
              </Link>

         

              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 hover:shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-gray-700 font-medium">Wishlist</span>
              </Link>

              <Link
                to="/profile/settings"
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 hover:shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700 font-medium">Account Settings</span>
              </Link>

              <Link
                to="/support"
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 hover:shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 12a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" />
                </svg>
                <span className="text-gray-700 font-medium">Help & Support</span>
              </Link>
            </nav>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t border-gray-200 transform transition-all duration-400 ease-out ${
            isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`} style={{ transitionDelay: isOpen ? '450ms' : '0ms' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Member since {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;

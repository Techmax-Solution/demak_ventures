import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useUser } from '../context/UserContext';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your wishlist.</p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors text-center block"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center block"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding items you love to your wishlist!</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Wishlist Items */
          <>
            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={clearWishlist}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all items
              </button>
              <Link
                to="/shop"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                  <Link to={`/product/${item._id}`} className="block">
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={item.images?.[0]?.url || '/api/placeholder/300/300'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300';
                        }}
                      />
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/product/${item._id}`} className="block">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 capitalize">{item.category?.name}</p>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <>
                            <span className="font-semibold text-orange-600">₵{item.price}</span>
                            <span className="text-sm text-gray-500 line-through">₵{item.originalPrice}</span>
                          </>
                        ) : (
                          <span className="font-semibold text-gray-900">₵{item.price}</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove from wishlist"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {item.totalStock === 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

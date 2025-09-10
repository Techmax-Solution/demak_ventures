import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    
    // For products with sizes, redirect to product details page
    if (product.sizes && product.sizes.length > 0) {
      window.location.href = `/product/${product._id}`;
      return;
    }
    
    // Add to cart with default options
    addToCart(product, 1);
    
    // Show success feedback
    const button = e.target;
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.classList.add('bg-green-600');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('bg-green-600');
    }, 1000);
  };

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative overflow-hidden">
          <img 
            src={product.images?.[0]?.url || '/api/placeholder/300/400'} 
            alt={product.images?.[0]?.alt || product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.totalStock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
          {product.featured && (
            <div className="absolute top-2 left-2">
              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            </div>
          )}
          {product.onSale && product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2 right-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Sale
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 capitalize">{product.category}</p>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {product.originalPrice && product.originalPrice > product.price ? (
              <>
                <span className="text-lg font-bold text-blue-600">${product.price}</span>
                <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-800">${product.price}</span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.totalStock === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              product.totalStock > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.totalStock === 0 
              ? 'Out of Stock' 
              : product.sizes && product.sizes.length > 0 
                ? 'Select Options' 
                : isInCart(product._id)
                  ? 'Added to Cart'
                  : 'Add to Cart'
            }
          </button>
        </div>

        {/* Rating */}
        {product.averageRating && (
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              ({product.averageRating.toFixed(1)}) {product.numReviews && `• ${product.numReviews} reviews`}
            </span>
          </div>
        )}

        {/* Available Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Available sizes:</p>
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((sizeObj, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {sizeObj.size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{product.sizes.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch product details. Please try again later.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      alert('Please select a size');
      return;
    }
    if (!selectedColor && product?.colors?.length > 0) {
      alert('Please select a color');
      return;
    }
    
    setAddingToCart(true);
    
    try {
      addToCart(product, quantity, {
        size: selectedSize,
        color: selectedColor
      });
      
      // Show success message
      alert(`${quantity} item(s) added to cart!`);
      
      // Optional: redirect to cart or show success state
      // navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Product not found'}
          </div>
          <button 
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="btn-secondary mb-6"
        >
          ← Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="card">
            <img 
              src={product.images?.[0]?.url || '/api/placeholder/600/600'} 
              alt={product.images?.[0]?.alt || product.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-blue-600">${product.price}</p>
              <p className="text-gray-600 mt-2">{product.category}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeObj, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      disabled={sizeObj.quantity === 0}
                      className={`px-4 py-2 border rounded-lg ${
                        selectedSize === sizeObj.size 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : sizeObj.quantity === 0
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {sizeObj.size}
                      {sizeObj.quantity === 0 && (
                        <span className="block text-xs">Out of Stock</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((colorObj, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(colorObj.color)}
                      className={`px-4 py-2 border rounded-lg capitalize ${
                        selectedColor === colorObj.color 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ 
                        backgroundColor: selectedColor === colorObj.color ? undefined : colorObj.hexCode + '20',
                        borderColor: selectedColor === colorObj.color ? undefined : colorObj.hexCode
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: colorObj.hexCode }}
                        ></span>
                        {colorObj.color}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn-secondary w-10 h-10 flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn-secondary w-10 h-10 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                product.totalStock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.totalStock > 0 ? `${product.totalStock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Current cart quantity */}
            {getItemQuantity(product._id, selectedSize, selectedColor) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <span className="font-medium">
                    {getItemQuantity(product._id, selectedSize, selectedColor)} 
                  </span> of this item already in your cart
                </p>
              </div>
            )}

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={product.totalStock === 0 || addingToCart}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                product.totalStock > 0 && !addingToCart
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {addingToCart 
                ? 'Adding to Cart...' 
                : product.totalStock > 0 
                  ? 'Add to Cart' 
                  : 'Out of Stock'
              }
            </button>

            {/* Continue Shopping / View Cart buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/shop')}
                className="flex-1 btn-secondary"
              >
                Continue Shopping
              </button>
              <button 
                onClick={() => navigate('/cart')}
                className="flex-1 btn-primary"
              >
                View Cart ({getItemQuantity(product._id, selectedSize, selectedColor) || 0})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

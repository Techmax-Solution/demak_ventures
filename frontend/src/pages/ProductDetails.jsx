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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  const images = product.images || [product.image || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600'];
  const currentImage = images[selectedImageIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 py-4 text-sm">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              HOME
            </button>
            <span className="text-gray-400">/</span>
        <button 
              onClick={() => navigate('/shop')}
              className="text-gray-500 hover:text-gray-700"
        >
              SHOP
        </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500 uppercase">{product.category?.name}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium uppercase">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Product Images */}
          <div className="flex flex-col-reverse lg:flex-row">
            {/* Thumbnail Images */}
            <div className="mt-4 lg:mt-0 lg:mr-4 flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-black' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={image.url || image} 
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300';
                    }}
                  />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="relative flex-1">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={currentImage?.url || currentImage || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800'} 
                  alt={currentImage?.alt || product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800';
                  }}
                />
              </div>
              
              {/* Image Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                    className="absolute left-4 top-1/3 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/3 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:pl-8">
            {/* Product Title and Price */}
            <div className="mb-8">
              <h1 className="text-4xl font-light text-black mb-4">{product.name}</h1>
              
              {/* Price Section */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {product.originalPrice && (
                    <span className="text-xl text-gray-400 line-through">₵{product.originalPrice}</span>
                  )}
                  <span className="text-2xl font-medium text-black">₵{product.price}</span>
                </div>
                {product.onSale && (
                  <span className="bg-black text-white px-3 py-1 text-sm font-medium">
                    25% Off
                  </span>
                )}
              </div>

              {/* People Viewing */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>38 People are viewing this right now</span>
              </div>

              {/* Product Description */}
              <div className="text-gray-600 leading-relaxed mb-8">
                <p>{product.description || "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}</p>
                </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">Color: <span className="font-normal text-gray-600">{selectedColor || 'Black'}</span></h3>
            </div>

              <div className="flex items-center gap-3">
                {/* Helper function to get color hex codes */}
                {(() => {
                  const getColorHex = (colorName) => {
                    const colorMap = {
                      'black': '#000000',
                      'white': '#FFFFFF',
                      'red': '#DC2626',
                      'blue': '#2563EB',
                      'green': '#16A34A',
                      'yellow': '#EAB308',
                      'pink': '#EC4899',
                      'purple': '#9333EA',
                      'orange': '#EA580C',
                      'gray': '#6B7280',
                      'grey': '#6B7280',
                      'brown': '#A3754F',
                      'beige': '#F5F5DC',
                      'navy': '#1E3A8A',
                      'maroon': '#7F1D1D',
                      'teal': '#0D9488',
                      'lime': '#65A30D',
                      'cyan': '#0891B2',
                      'indigo': '#4F46E5',
                      'rose': '#F43F5E',
                      'amber': '#F59E0B',
                      'emerald': '#059669',
                      'violet': '#7C3AED',
                      'fuchsia': '#C026D3',
                      'sky': '#0EA5E9',
                      'slate': '#475569'
                    };
                    return colorMap[colorName.toLowerCase()] || '#6B7280';
                  };

                  // Default colors if none provided
                  if (!product.colors || product.colors.length === 0) {
                    const defaultColors = ['Black', 'Pink', 'White'];
                    return defaultColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color || (!selectedColor && color === 'Black')
                            ? (color === 'White' ? 'border-gray-400 border-4' : 'border-black border-4')
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: getColorHex(color) }}
                        title={color}
                      />
                    ));
                  }

                  // Product has colors - handle both string array and object array
                  return product.colors.map((colorItem, index) => {
                    const colorName = typeof colorItem === 'string' ? colorItem : colorItem.color || colorItem.name;
                    const hexCode = typeof colorItem === 'object' ? colorItem.hexCode || colorItem.hex : null;
                    const backgroundColor = hexCode || getColorHex(colorName);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(colorName)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === colorName 
                            ? (colorName.toLowerCase() === 'white' ? 'border-gray-400 border-4' : 'border-black border-4')
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor }}
                        title={colorName}
                      />
                    );
                  });
                })()}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">Size: <span className="font-normal text-gray-600">{selectedSize || 'L'}</span></h3>
                <button className="text-sm text-gray-600 underline hover:text-black">Size Guide</button>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Default sizes if none provided */}
                {(!product.sizes || product.sizes.length === 0) ? (
                  <>
                    {['L', 'M', 'XL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-full min-w-[50px] text-sm font-medium transition-all ${
                          selectedSize === size || (size === 'L' && !selectedSize)
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </>
                ) : (
                  product.sizes.map((sizeObj, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      disabled={sizeObj.quantity === 0}
                      className={`px-4 py-2 border rounded-full min-w-[50px] text-sm font-medium transition-all ${
                        selectedSize === sizeObj.size 
                          ? 'border-black bg-black text-white' 
                          : sizeObj.quantity === 0
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {sizeObj.size}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Price Display */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">₵{product.originalPrice}</span>
                )}
                <span className="text-2xl font-medium text-black">₵{product.price}</span>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-lg font-medium hover:bg-gray-50 transition-colors"
                >
                    −
                </button>
                  <span className="px-6 py-3 text-lg font-medium border-l border-r border-gray-300">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
                
            <button 
              onClick={handleAddToCart}
              disabled={product.totalStock === 0 || addingToCart}
                  className={`flex-1 py-3 px-8 text-white font-medium text-lg transition-all ${
                product.totalStock > 0 && !addingToCart
                      ? 'bg-black hover:bg-gray-800'
                      : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {addingToCart 
                    ? 'ADDING...' 
                : product.totalStock > 0 
                      ? 'ADD TO CART' 
                      : 'OUT OF STOCK'
              }
            </button>
              </div>

              {/* Buy Now Button */}
              <button 
                onClick={() => navigate('/checkout')}
                disabled={product.totalStock === 0}
                className={`w-full py-3 px-8 border-2 font-medium text-lg transition-all ${
                  product.totalStock > 0
                    ? 'border-black text-black hover:bg-black hover:text-white'
                    : 'border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                BUY NOW
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-8 py-6 border-t border-gray-200">
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <svg className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Add to wishlist</span>
              </button>
              
              <button className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Compare</span>
              </button>
              
              <button className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

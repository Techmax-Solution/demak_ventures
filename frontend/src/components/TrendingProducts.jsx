import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getTrendingProducts } from '../services/api';

const TrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        const products = await getTrendingProducts(4);
        setTrendingProducts(products);
      } catch (err) {
        console.error('Error fetching trending products:', err);
        setError('Failed to load trending products');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  // Helper function to calculate discount percentage
  const calculateDiscount = (originalPrice, price) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Helper function to get the first image URL
  const getProductImage = (product) => {
    return product.images && product.images.length > 0 
      ? product.images[0].url 
      : '/placeholder-image.jpg';
  };

  // Helper function to get color hex codes
  const getProductColors = (product) => {
    return product.colors && product.colors.length > 0
      ? product.colors.map(color => color.hexCode).filter(Boolean)
      : [];
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-light text-gray-900 mb-2">Trending Products</h2>
              <p className="text-gray-600 text-lg">Fashion Is Not Just About Clothes But Also</p>
            </div>
            <Link 
              to="/shop"
              className="px-8 py-3 border border-orange-300 text-orange-600 font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200 text-sm tracking-wide uppercase"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-[4/5] mb-4 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-light text-gray-900 mb-2">Trending Products</h2>
              <p className="text-gray-600 text-lg">Fashion Is Not Just About Clothes But Also</p>
            </div>
            <Link 
              to="/shop"
              className="px-8 py-3 border border-orange-300 text-orange-600 font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200 text-sm tracking-wide uppercase"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-light text-gray-900 mb-2">Trending Products</h2>
            <p className="text-gray-600 text-lg">Fashion Is Not Just About Clothes But Also</p>
          </div>
          <Link 
            to="/shop"
            className="px-8 py-3 border border-orange-300 text-orange-600 font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200 text-sm tracking-wide uppercase"
          >
            VIEW ALL
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => {
            const discount = calculateDiscount(product.originalPrice, product.price);
            const productImage = getProductImage(product);
            const productColors = getProductColors(product);
            
            return (
              <Link key={product._id} to={`/product/${product._id}`} className="group cursor-pointer block">
                {/* Product Image Container */}
                <div className="relative mb-4 bg-gray-100 overflow-hidden aspect-[4/5]">
                  {/* Discount Badge */}
                  {(discount > 0 || product.featured) && (
                    <div className="absolute top-4 left-4 z-20">
                      {product.featured ? (
                        <div className="flex flex-col gap-2">
                          <span className="bg-red-500 text-white px-3 py-1 text-sm font-medium rounded">
                            Hot
                          </span>
                          {discount > 0 && (
                            <span className="bg-black text-white px-3 py-1 text-sm font-medium rounded">
                              {discount}%
                            </span>
                          )}
                        </div>
                      ) : discount > 0 ? (
                        <span className="bg-black text-white px-3 py-1 text-sm font-medium rounded">
                          {discount}%
                        </span>
                      ) : null}
                    </div>
                  )}

                  {/* Product Image */}
                  <img 
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  {/* Category */}
                  <p className="text-gray-500 text-sm uppercase tracking-wide">{product.category?.name}</p>
                  
                  {/* Product Name */}
                  <h3 className="text-gray-900 font-medium text-lg leading-tight group-hover:text-gray-700 transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-3">
                    {product.originalPrice && product.originalPrice !== product.price ? (
                      <>
                        <span className="text-gray-400 line-through text-sm">
                          ₵{product.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-orange-600 font-semibold text-lg">
                          ₵{product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-orange-500 font-semibold text-lg">
                        ₵{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Color Swatches */}
                  {productColors.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {productColors.map((color, index) => (
                        <div
                          key={index}
                          className="w-5 h-5 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
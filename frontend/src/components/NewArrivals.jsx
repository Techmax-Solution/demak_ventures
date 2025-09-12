import { Link } from 'react-router-dom';
import { useState } from 'react';

const NewArrivals = () => {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  const newArrivalsProducts = [
    {
      id: 1,
      name: "Sharp Patent Slingbacks",
      category: "Accessory",
      minPrice: 40.00,
      maxPrice: 90.00,
      discount: 25,
      originalPrice: 120.00,
      image: "https://i.pinimg.com/736x/7c/77/ce/7c77ce449fa6448e8d0bcd8be5be920e.jpg",
      hoverImage: "https://i.pinimg.com/1200x/86/c2/d2/86c2d2b12369cc94ca3d5cf8ee9dcf9b.jpg",
      colors: ['#FCD34D', '#EF4444'],
      rating: 4.8,
      reviews: 127
    },
    {
      id: 2,
      name: "Long Sleeve Tee Knit Straw",
      category: "Men's",
      minPrice: 70.00,
      maxPrice: 90.00,
      discount: 25,
      originalPrice: 120.00,
      isHot: true,
      image: "https://i.pinimg.com/736x/a3/63/87/a36387ffe3736c9dfd9a691fe7e45025.jpg",
      hoverImage: "https://i.pinimg.com/736x/33/2e/4e/332e4efac03e109718245d7b2faff9c2.jpg",
      colors: ['#C084FC', '#F8BBD9', '#BEF264'],
      rating: 4.9,
      reviews: 203
    },
    {
      id: 3,
      name: "Square Sunglasses Light Havana",
      category: "Tops",
      minPrice: 70.00,
      maxPrice: 135.00,
      discount: 22,
      originalPrice: 175.00,
      image: "https://i.pinimg.com/736x/c8/bb/3e/c8bb3e36740b0b456f9e7774532c4e9f.jpg",
      hoverImage: "https://i.pinimg.com/736x/34/f7/f9/34f7f941cb4f137b59aaa7196b022479.jpg",
      colors: ['#F59E0B', '#F8BBD9', '#C084FC'],
      rating: 4.7,
      reviews: 89
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Fresh Collection</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6">
            New Arrivals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Fashion Is Not Just About Clothes But Also About Self-Expression
          </p>
        </div>

        {/* Products Grid */}
        <div className="max-w-5xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-end">
             {newArrivalsProducts.map((product, index) => (
               <div 
                 key={product.id} 
                 className={`group cursor-pointer ${index === 1 ? 'transform scale-y-90 -translate-y-2' : ''}`}
                 onMouseEnter={() => setHoveredProduct(product.id)}
                 onMouseLeave={() => setHoveredProduct(null)}
               >
                {/* Enhanced Product Card */}
                <div className="bg-white  overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  
                  {/* Product Image Container */}
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden aspect-[4/5]">
                    
                    {/* Enhanced Badges */}
                    <div className="absolute top-4 left-4 z-20 space-y-2">
                      {product.isHot && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                          🔥 Hot
                        </span>
                      )}
                      <span className="inline-flex items-center bg-black/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold rounded-full">
                        -{product.discount}%
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
                      <svg className="w-5 h-5 text-gray-700 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Product Images with Hover Effect */}
                    <div className="relative w-full h-full">
                      <img 
                        src={product.image}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                          hoveredProduct === product.id ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
                        }`}
                      />
                      <img 
                        src={product.hoverImage}
                        alt={`${product.name} alternate view`}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                          hoveredProduct === product.id ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                        }`}
                      />
                    </div>

                    {/* Quick Add Button */}
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <button className="w-full bg-white/95 backdrop-blur-sm text-gray-900 py-3 px-6 rounded-xl font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:shadow-lg">
                        Quick Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Compact Product Info */}
                  <div className="p-4 space-y-3">
                    {/* Category & Rating - Simplified */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                      </div>
                    </div>
                    
                    {/* Product Name */}
                    <h3 className="text-base font-semibold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Compact Price Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.minPrice.toFixed(2)}
                        </span>
                        <span className="text-gray-400 text-sm">–</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${product.maxPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Compact Color Swatches */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {product.colors.map((color, index) => (
                          <button
                            key={index}
                            className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: color }}
                            title={`Color option ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Explore Collection Button - Centered below products */}
          <div className="text-center mt-16">
            <Link 
              to="/shop"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-12 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <span className="text-sm tracking-wide uppercase">Explore Full Collection</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-gray-500 text-sm mt-4">Discover hundreds more styles in our complete collection</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
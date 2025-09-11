import { Link } from 'react-router-dom';

const TrendingProducts = () => {
  // Sample trending products data matching the image
  const trendingProducts = [
    {
      id: 1,
      name: "Crew Neck Cashmere Knit",
      category: "Shoes",
      originalPrice: 125.00,
      price: 100.00,
      discount: 20,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
      colors: []
    },
    {
      id: 2,
      name: "Long Sleeve Tee Knit Straw",
      category: "Men's",
      originalPrice: 70.00,
      price: 90.00,
      discount: 25,
      isHot: true,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
      colors: ['#E6B3FF', '#FFB3BA', '#BAFFC9']
    },
    {
      id: 3,
      name: "Suede Lace Up Boots Desert",
      category: "Bag",
      originalPrice: 100.00,
      price: 90.00,
      discount: 10,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop",
      colors: ['#000000', '#D2B48C']
    },
    {
      id: 4,
      name: "Croco Embossed Heeled Flip",
      category: "Shoes",
      originalPrice: 70.00,
      price: 110.00,
      discount: 22,
      isHot: true,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
      colors: ['#000000', '#8B4513']
    }
  ];

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
            className="px-8 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 text-sm tracking-wide uppercase"
          >
            VIEW ALL
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              {/* Product Image Container */}
              <div className="relative mb-4 bg-gray-100 overflow-hidden aspect-[4/5]">
                {/* Discount Badge */}
                <div className="absolute top-4 left-4 z-20">
                  {product.isHot ? (
                    <div className="flex flex-col gap-2">
                      <span className="bg-red-500 text-white px-3 py-1 text-sm font-medium rounded">
                        Hot
                      </span>
                      <span className="bg-black text-white px-3 py-1 text-sm font-medium rounded">
                        {product.discount}%
                      </span>
                    </div>
                  ) : (
                    <span className="bg-black text-white px-3 py-1 text-sm font-medium rounded">
                      {product.discount}%
                    </span>
                  )}
                </div>

                {/* Product Image */}
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                {/* Category */}
                <p className="text-gray-500 text-sm uppercase tracking-wide">{product.category}</p>
                
                {/* Product Name */}
                <h3 className="text-gray-900 font-medium text-lg leading-tight group-hover:text-gray-700 transition-colors">
                  {product.name}
                </h3>
                
                {/* Price */}
                <div className="flex items-center gap-3">
                  {product.originalPrice !== product.price ? (
                    <>
                      <span className="text-gray-400 line-through text-sm">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-gray-900 font-semibold text-lg">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-900 font-semibold text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Color Swatches */}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {product.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-5 h-5 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;

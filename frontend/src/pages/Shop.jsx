import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';

const Shop = () => {
  const [allProducts, setAllProducts] = useState([]); // Store all products from API
  const [products, setProducts] = useState([]); // Filtered products for display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categories: [], // Empty array means show all categories
    priceRange: [40, 210], // [min, max] for range slider
    colors: [], // Array for selected colors
    sizes: [], // Array for selected sizes
    sortBy: 'name'
  });
  
  const [priceSliderValue, setPriceSliderValue] = useState([40, 210]);

  // Fetch all products only once on component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Apply filters to products whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters, allProducts]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching all products...');
      const data = await getProducts({}); // Fetch all products without filters
      console.log('Received products data:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAllProducts(data);
        setProducts(data); // Initially show all products
        setError(null);
      } else {
        console.error('Products data is not an array:', data);
        setAllProducts([]);
        setProducts([]);
        setError('Invalid data format received from server.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setAllProducts([]);
      setProducts([]);
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
      } else if (err.response?.status === 404) {
        setError('Products endpoint not found. Please check the API configuration.');
      } else {
        setError(`Failed to fetch products: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (allProducts.length === 0) return;

    let filtered = [...allProducts];

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category?.toLowerCase())
      );
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(product => 
        product.price >= min && product.price <= max
      );
    }

    // Filter by colors (if product has color property)
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors && product.colors.some(color => 
          filters.colors.includes(color.toLowerCase())
        )
      );
    }

    // Filter by sizes (if product has sizes property)
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes && product.sizes.some(sizeObj => 
          filters.sizes.includes(sizeObj.size || sizeObj)
        )
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setProducts(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCategoryChange = (category, checked) => {
    if (category === 'all') {
      // If "All" is selected, clear all other categories
      setFilters(prev => ({
        ...prev,
        categories: checked ? [] : prev.categories
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        categories: checked 
          ? [...prev.categories, category.toLowerCase()]
          : prev.categories.filter(c => c !== category.toLowerCase())
      }));
    }
  };

  const handleColorChange = (color) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleSizeChange = (size) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handlePriceRangeChange = (event) => {
    const value = parseInt(event.target.value);
    const newRange = [40, value];
    setPriceSliderValue(newRange);
    setFilters(prev => ({
      ...prev,
      priceRange: newRange
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={fetchAllProducts}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-100 min-h-[200px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://orima.wpbingosite.com/wp-content/uploads/2025/07/bg-breadcrumb.jpg" 
            alt="Fashion Model" 
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay for better text readability */}
        </div>
        
        {/* Content positioned over the image */}
        <div className="relative z-10 flex items-center justify-center min-h-[200px] px-8">
          <div className="text-center">
            {/* Title with back arrow */}
            <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-wide flex items-center justify-center">
              <span className="mr-4">←</span>
              Shop
            </h1>
            
            {/* Breadcrumb */}
            <nav>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 uppercase tracking-wide">
                <span className="hover:text-gray-900 cursor-pointer">HOME</span>
                <span>/</span>
                <span className="text-gray-900 font-small">SHOP</span>
              </div>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-80 flex-shrink-0">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" 
                    checked={filters.categories.length === 0}
                    onChange={(e) => handleCategoryChange('all', e.target.checked)}
                  />
                  <span className="ml-3 text-sm text-gray-700">All Categories</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" 
                    checked={filters.categories.includes('accessories')}
                    onChange={(e) => handleCategoryChange('accessories', e.target.checked)}
                  />
                  <span className="ml-3 text-sm text-gray-700">Accessory (9)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    checked={filters.categories.includes('bag')}
                    onChange={(e) => handleCategoryChange('bag', e.target.checked)}
                  />
                  <span className="ml-3 text-sm text-gray-700">Bag (4)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    checked={filters.categories.includes('men')}
                    onChange={(e) => handleCategoryChange('men', e.target.checked)}
                  />
                  <span className="ml-3 text-sm text-gray-700">Men's (6)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    checked={filters.categories.includes('shoes')}
                    onChange={(e) => handleCategoryChange('shoes', e.target.checked)}
                  />
                  <span className="ml-3 text-sm text-gray-700">Shoes (6)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    checked={filters.categories.includes('tops')}
                    onChange={(e) => handleCategoryChange('tops', e.target.checked)}
                  />
                  <span className="ml-3 text-sm text-gray-700">Tops (4)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    checked={filters.categories.includes('women')}
                    onChange={(e) => handleCategoryChange('women', e.target.checked)}
                  />
                  <span className="ml-3 text-sm text-gray-700">Women's (4)</span>
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Price</h3>
              <div className="px-2">
                <input 
                  type="range" 
                  min="40" 
                  max="210" 
                  value={priceSliderValue[1]}
                  onChange={handlePriceRangeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Range: $40.00 - ${priceSliderValue[1]}.00</span>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Color</h3>
              <div className="flex flex-wrap gap-2">
                <div 
                  className={`w-8 h-8 rounded-full bg-yellow-100 border-2 cursor-pointer hover:border-gray-400 ${
                    filters.colors.includes('beige') ? 'border-black ring-2 ring-black' : 'border-gray-200'
                  }`}
                  onClick={() => handleColorChange('beige')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-full bg-black border-2 cursor-pointer hover:border-gray-400 ${
                    filters.colors.includes('black') ? 'border-white ring-2 ring-gray-400' : 'border-gray-200'
                  }`}
                  onClick={() => handleColorChange('black')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-full bg-gray-600 border-2 cursor-pointer hover:border-gray-400 ${
                    filters.colors.includes('gray') ? 'border-black ring-2 ring-black' : 'border-gray-200'
                  }`}
                  onClick={() => handleColorChange('gray')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-full bg-yellow-400 border-2 cursor-pointer hover:border-gray-400 ${
                    filters.colors.includes('yellow') ? 'border-black ring-2 ring-black' : 'border-gray-200'
                  }`}
                  onClick={() => handleColorChange('yellow')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-full bg-pink-200 border-2 cursor-pointer hover:border-gray-400 ${
                    filters.colors.includes('pink') ? 'border-black ring-2 ring-black' : 'border-gray-200'
                  }`}
                  onClick={() => handleColorChange('pink')}
                ></div>
                <div 
                  className={`w-8 h-8 rounded-full bg-red-600 border-2 cursor-pointer hover:border-gray-400 ${
                    filters.colors.includes('red') ? 'border-black ring-2 ring-black' : 'border-gray-200'
                  }`}
                  onClick={() => handleColorChange('red')}
                ></div>
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button 
                    key={size}
                    className={`px-3 py-2 text-sm border rounded hover:border-gray-400 transition-colors ${
                      filters.sizes.includes(size) 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">Showing all {products.length} results</p>
              
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded">
                  <button className="p-2 hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-gray-100">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
                
                {/* Sort Dropdown */}
              <select 
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              >
                  <option value="name">Default Sorting</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
                  <div key={product._id} className="group relative overflow-hidden transition-shadow">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img 
                        src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'} 
                        alt={product.images?.[0]?.alt || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Discount Badge */}
                      {product.discount && (
                        <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 text-xs rounded">
                          -{product.discount}%
                        </div>
                      )}
                      
                      {/* Hot Badge */}
                      {product.isHot && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs rounded">
                          Hot
                        </div>
                      )}
                      
                      {/* Sale Badge */}
                      {product.onSale && (
                        <div className="absolute top-3 right-3 bg-black text-white px-2 py-1 text-xs rounded">
                          22%
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <p className="text-sm text-gray-500 mb-1">{product.category || 'Accessory'}</p>
                      <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        {product.originalPrice && (
                          <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                        )}
                        <span className="text-gray-900 font-medium">${product.price}</span>
                        {product.priceRange && (
                          <span className="text-gray-600">– ${product.maxPrice}</span>
                        )}
                      </div>
                      
                      {/* Color Options */}
                      {product.colors && (
                        <div className="flex gap-1 mt-3">
                          {product.colors.map((color, index) => (
                            <div 
                              key={index}
                              className={`w-6 h-6 rounded-full border-2 border-gray-200 cursor-pointer ${
                                color === 'black' ? 'bg-black' : 
                                color === 'pink' ? 'bg-pink-200' : 
                                'bg-gray-300'
                              }`}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

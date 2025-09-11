import { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts, getProductFilters } from '../services/api';

const Shop = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]); // Store all products from API
  const [products, setProducts] = useState([]); // Filtered products for display
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: { minPrice: 40, maxPrice: 210 }
  });
  const [filters, setFilters] = useState({
    categories: [], // Empty array means show all categories
    priceRange: [40, 210], // [min, max] for range slider
    colors: [], // Array for selected colors
    sizes: [], // Array for selected sizes
    sortBy: 'name'
  });
  
  const [priceSliderValue, setPriceSliderValue] = useState([40, 210]);

  // Define callback functions first
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching all products...');
      const data = await getProducts({}); // Fetch all products without filters
      console.log('Received products data:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAllProducts(data);
        setError(null);
      } else {
        console.error('Products data is not an array:', data);
        setAllProducts([]);
        setError('Invalid data format received from server.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setAllProducts([]);
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
      } else if (err.response?.status === 404) {
        setError('Products endpoint not found. Please check the API configuration.');
      } else {
        setError(`Failed to fetch products: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  const fetchAvailableFilters = useCallback(async () => {
    try {
      console.log('Fetching available filters...');
      const filterData = await getProductFilters();
      console.log('Received filter data:', filterData);
      
      const newFilters = {
        categories: filterData.categories || [],
        colors: filterData.colors || [],
        sizes: filterData.sizes || [],
        priceRange: filterData.priceRange || { minPrice: 40, maxPrice: 210 }
      };
      
      setAvailableFilters(newFilters);

      // Update initial price range based on backend data
      const { minPrice, maxPrice } = newFilters.priceRange;
      const newPriceRange = [minPrice, maxPrice];
      
      // Batch state updates to prevent multiple re-renders
      setFilters(prev => ({
        ...prev,
        priceRange: newPriceRange
      }));
      setPriceSliderValue(newPriceRange);
      
    } catch (err) {
      console.error('Error fetching filters:', err);
      // Use default values if filters fetch fails
      const defaultFilters = {
        categories: ['accessories', 'bag', 'men', 'shoes', 'tops', 'women'],
        colors: ['beige', 'black', 'gray', 'yellow', 'pink', 'red'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        priceRange: { minPrice: 40, maxPrice: 210 }
      };
      setAvailableFilters(defaultFilters);
    }
  }, []);

  // Fetch all products and filters on component mount
  useEffect(() => {
    fetchAllProducts();
    fetchAvailableFilters();
  }, [fetchAllProducts, fetchAvailableFilters]);

  // Memoized filter application to prevent unnecessary re-renders
  const filteredProducts = useMemo(() => {
    if (allProducts.length === 0) return [];

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

    return filtered;
  }, [allProducts, filters.categories, filters.priceRange, filters.colors, filters.sizes, filters.sortBy]);

  // Update products state only when filteredProducts changes (non-urgent update)
  useEffect(() => {
    startTransition(() => {
      setProducts(filteredProducts);
    });
  }, [filteredProducts]);

  const handleFilterChange = useCallback((filterType, value) => {
    startTransition(() => {
      setFilters(prev => ({
        ...prev,
        [filterType]: value
      }));
    });
  }, []);

  const handleCategoryChange = useCallback((category, checked) => {
    startTransition(() => {
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
    });
  }, []);

  const handleColorChange = useCallback((color) => {
    startTransition(() => {
      setFilters(prev => ({
        ...prev,
        colors: prev.colors.includes(color)
          ? prev.colors.filter(c => c !== color)
          : [...prev.colors, color]
      }));
    });
  }, []);

  const handleSizeChange = useCallback((size) => {
    startTransition(() => {
      setFilters(prev => ({
        ...prev,
        sizes: prev.sizes.includes(size)
          ? prev.sizes.filter(s => s !== size)
          : [...prev.sizes, size]
      }));
    });
  }, []);

  const handlePriceRangeChange = useCallback((event) => {
    const value = parseInt(event.target.value);
    const minPrice = availableFilters.priceRange.minPrice || 40;
    const newRange = [minPrice, value];
    
    // Update slider value immediately for responsive UI
    setPriceSliderValue(newRange);
    
    // Use startTransition for filter update to prevent blocking
    startTransition(() => {
      setFilters(prev => ({
        ...prev,
        priceRange: newRange
      }));
    });
  }, [availableFilters.priceRange.minPrice]);

  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  // Show full-page loader only on initial load
  if (initialLoading) {
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
              <span 
                className="mr-4 cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => navigate(-1)}
              >
                ←
              </span>
              Shop
            </h1>
            
            {/* Breadcrumb */}
            <nav>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 uppercase tracking-wide">
                <span 
                  className="hover:text-gray-900 cursor-pointer transition-colors"
                  onClick={() => navigate('/')}
                >
                  HOME
                </span>
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
                {availableFilters.categories.map(category => {
                  const categoryCount = allProducts.filter(product => 
                    product.category?.toLowerCase() === category.toLowerCase()
                  ).length;
                  
                  return (
                    <label key={category} className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" 
                        checked={filters.categories.includes(category.toLowerCase())}
                        onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  />
                      <span className="ml-3 text-sm text-gray-700">
                        {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCount})
                      </span>
                </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Price</h3>
              <div className="px-2">
                <input 
                  type="range" 
                  min={availableFilters.priceRange.minPrice || 40} 
                  max={availableFilters.priceRange.maxPrice || 210} 
                  value={priceSliderValue[1]}
                  onChange={handlePriceRangeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Range: ₵{availableFilters.priceRange.minPrice || 40}.00 - ₵{priceSliderValue[1]}.00</span>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Color</h3>
              <div className="flex flex-wrap gap-2">
                {availableFilters.colors.map(color => {
                  const getColorClass = (colorName) => {
                    const colorMap = {
                      beige: 'bg-yellow-100',
                      black: 'bg-black',
                      gray: 'bg-gray-600',
                      grey: 'bg-gray-600',
                      yellow: 'bg-yellow-400',
                      pink: 'bg-pink-200',
                      red: 'bg-red-600',
                      blue: 'bg-blue-500',
                      green: 'bg-green-500',
                      white: 'bg-white',
                      brown: 'bg-amber-700',
                      purple: 'bg-purple-500',
                      orange: 'bg-orange-500'
                    };
                    return colorMap[colorName.toLowerCase()] || 'bg-gray-300';
                  };

                  return (
                    <div 
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer hover:border-gray-400 ${getColorClass(color)} ${
                        filters.colors.includes(color.toLowerCase()) 
                          ? (color.toLowerCase() === 'black' ? 'border-white ring-2 ring-gray-400' : 'border-black ring-2 ring-black')
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleColorChange(color.toLowerCase())}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                ></div>
                  );
                })}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {availableFilters.sizes.map(size => (
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading Skeleton */}
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
                  <div 
                    key={product._id} 
                    className="group relative overflow-hidden transition-shadow cursor-pointer hover:shadow-lg"
                    onClick={() => handleProductClick(product._id)}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img 
                        src={
                          product.images?.[0]?.url || 
                          product.images?.[0] ||
                          product.image ||
                          'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
                        } 
                        alt={product.images?.[0]?.alt || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300';
                        }}
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
                          <span className="text-gray-400 line-through text-sm">₵{product.originalPrice}</span>
                        )}
                        <span className="text-gray-900 font-medium">₵{product.price}</span>
                        {product.priceRange && (
                          <span className="text-gray-600">– ₵{product.maxPrice}</span>
                        )}
                      </div>
                      
                      {/* Color Options */}
                      {product.colors && (
                        <div className="flex gap-1 mt-3">
                          {product.colors.map((color, index) => {
                            // Helper function to get color hex codes
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

                            // Handle both string and object color formats
                            const colorName = typeof color === 'string' ? color : color.color || color.name;
                            const hexCode = typeof color === 'object' ? color.hexCode || color.hex : null;
                            const backgroundColor = hexCode || getColorHex(colorName);

                            return (
                              <div 
                                key={index}
                                className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                                  colorName.toLowerCase() === 'white' ? 'border-gray-300' : 'border-gray-200'
                                }`}
                                style={{ backgroundColor }}
                                title={colorName}
                              ></div>
                            );
                          })}
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

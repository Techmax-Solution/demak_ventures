import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ShopByCategory = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const categories = [
    {
      id: 1,
      name: "MEN'S",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      link: "/shop?category=men"
    },
    {
      id: 2,
      name: "WOMEN'S",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      link: "/shop?category=women"
    },
    {
      id: 3,
      name: "BAG",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      link: "/shop?category=bags"
    },
    {
      id: 4,
      name: "SHOES",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      link: "/shop?category=shoes"
    }
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get max slides based on screen size
  const getMaxSlides = () => {
    if (isMobile) {
      return categories.length - 1; // Show 1 at a time on mobile
    }
    return Math.max(1, categories.length - 3); // Show 4 at a time on desktop
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (getMaxSlides() + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (getMaxSlides() + 1)) % (getMaxSlides() + 1));
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl lg:text-4xl font-light text-gray-900">Shop By Category</h2>
          
          {/* Navigation Arrows - Only show on mobile */}
          {isMobile && (
            <div className="flex items-center gap-4">
              <button
                onClick={prevSlide}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors duration-200"
                aria-label="Previous categories"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors duration-200"
                aria-label="Next categories"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: isMobile ? `translateX(-${currentIndex * 100}%)` : 'translateX(0%)' 
            }}
          >
            {categories.map((category) => (
              <div 
                key={category.id}
                className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-3"
              >
                <Link 
                  to={category.link}
                  className="group block relative overflow-hidden bg-gray-100 aspect-[4/5] hover:shadow-lg transition-all duration-300"
                >
                  {/* Category Image */}
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Category Overlay */}
                  
                  {/* Category Name */}
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-xl lg:text-2xl font-light text-gray-900 bg-white px-4 py-2 tracking-wide">
                      {category.name}
                    </h3>
                  </div>

                  {/* Special Badge for BAG category */}
                  {category.name === "BAG" && (
                    <div className="absolute top-4 left-4">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Category Indicators - Only show on mobile */}
        {isMobile && (
          <div className="flex justify-center items-center mt-8 gap-2">
            {Array.from({ length: getMaxSlides() + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-gray-900 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByCategory;

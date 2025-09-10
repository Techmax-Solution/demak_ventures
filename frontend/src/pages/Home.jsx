import { Link } from 'react-router-dom';
import { useState } from 'react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');
  
  const slides = [
    {
      id: 1,
      tagline: "Made From Cotton",
      title: "Soft Wine Red",
      subtitle: "Sweatshirt",
      bgColor: "from-slate-800 via-slate-700 to-slate-900",
      placeholderIcon: (
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      placeholderText: "Sweatshirt"
    },
    {
      id: 2,
      tagline: "Premium Denim",
      title: "Classic Blue",
      subtitle: "Jeans",
      bgColor: "from-blue-900 via-blue-800 to-slate-900",
      placeholderIcon: (
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      placeholderText: "Denim Jeans"
    },
    {
      id: 3,
      tagline: "Summer Collection",
      title: "Elegant White",
      subtitle: "Dress",
      bgColor: "from-green-900 via-green-800 to-slate-900",
      placeholderIcon: (
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      placeholderText: "Summer Dress"
    }
  ];

  const nextSlide = () => {
    setSlideDirection('right');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setSlideDirection('left');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className={`relative h-[600px] bg-gradient-to-br ${currentSlideData.bgColor} overflow-hidden transition-all duration-700 ease-in-out`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.2),transparent_70%)]"></div>
        
        {/* Main Content */}
        <div className="relative z-10 flex items-center h-full">
          <div className="container mx-auto px-4 lg:px-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <div key={`content-${currentSlideData.id}`} className={`text-white space-y-8 ${slideDirection === 'right' ? 'slide-enter-right' : 'slide-enter-left'}`}>
                <div className="space-y-2">
                  <p className="text-sm font-medium tracking-wider text-slate-300 uppercase transition-all duration-500">
                    {currentSlideData.tagline}
                  </p>
                  <h1 className="text-5xl lg:text-7xl font-light leading-tight transition-all duration-500">
                    {currentSlideData.title}
                    <br />
                    <span className="font-normal">{currentSlideData.subtitle}</span>
                  </h1>
                </div>
                
                <div className="pt-4">
                  <Link 
                    to="/shop" 
                    className="group inline-flex items-center space-x-2 text-white border-b border-white pb-1 hover:border-slate-300 transition-colors duration-300"
                  >
                    <span className="text-sm font-medium tracking-wider uppercase">Shop Collection</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Right Content - Product Image */}
              <div className="relative flex justify-center lg:justify-end">
                {/* Circular Background */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 lg:w-[440px] lg:h-[440px] bg-gradient-to-br from-slate-200 via-slate-100 to-white rounded-full opacity-90 hero-float"></div>
                
                {/* Product Image Placeholder */}
                <div key={`product-${currentSlideData.id}`} className={`relative z-10 w-80 h-80 lg:w-96 lg:h-96 flex items-center justify-center hero-float ${slideDirection === 'right' ? 'slide-enter-right' : 'slide-enter-left'}`}>
                  <div className="w-64 h-80 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 transform">
                    <div className="text-center text-gray-500 space-y-2">
                      {currentSlideData.placeholderIcon}
                      <p className="text-sm font-medium">{currentSlideData.placeholderText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scroll Indicator - Center Bottom */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="flex flex-col items-center space-y-2 animate-bounce">
            <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Slide Indicators - Vertical Right Bottom */}
        <div className="absolute bottom-8 right-8 flex flex-col space-y-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white h-8' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">High-quality materials and craftsmanship in every piece</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Quick and reliable delivery to your doorstep</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Satisfaction</h3>
              <p className="text-gray-600">30-day return policy and excellent customer service</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Update Your Wardrobe?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of satisfied customers</p>
          <Link 
            to="/shop" 
            className="btn-primary text-lg px-8 py-3 inline-block"
          >
            Browse Collection
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

const TopBanner = () => {
  const promoMessages = [
    "Autumn Collection. A New Season. A New Perspective. Buy Now!",
    "Free Shipping on Orders Over ₵100 • Fast Delivery Nationwide",
    "New Arrivals Daily • Up to 50% Off Selected Items",
    "Premium Quality Fashion • Satisfaction Guaranteed"
  ];

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between py-2.5 text-sm">
          {/* Left - Phone Number */}
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="font-medium">Call Us: +233 24 408 6787</span>
          </div>
          
          {/* Center - Scrolling Promotional Messages */}
          <div className="hidden lg:block flex-1 mx-8 overflow-hidden">
            <div className="promo-scroll flex items-center gap-16 whitespace-nowrap">
              {/* First set of messages */}
              {promoMessages.map((message, index) => (
                <span key={index} className="font-medium text-gray-700 flex-shrink-0">
                  {message}
                </span>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {promoMessages.map((message, index) => (
                <span key={`duplicate-${index}`} className="font-medium text-gray-700 flex-shrink-0">
                  {message}
                </span>
              ))}
              
              {/* Third set for extra smoothness */}
              {promoMessages.map((message, index) => (
                <span key={`triple-${index}`} className="font-medium text-gray-700 flex-shrink-0">
                  {message}
                </span>
              ))}
            </div>
          </div>
          
          {/* Right - Email */}
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">info@demak.shop.com</span>
          </div>
        </div>
        
        {/* Mobile Promotional Message - Also scrolling */}
        <div className="lg:hidden border-t border-gray-200 py-1 overflow-hidden">
          <div className="promo-scroll-mobile flex items-center gap-12 whitespace-nowrap">
            {/* Mobile messages */}
            {promoMessages.map((message, index) => (
              <span key={`mobile-${index}`} className="text-xs font-medium text-gray-700 flex-shrink-0">
                {message}
              </span>
            ))}
            
            {/* Duplicate for seamless loop */}
            {promoMessages.map((message, index) => (
              <span key={`mobile-duplicate-${index}`} className="text-xs font-medium text-gray-700 flex-shrink-0">
                {message}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;

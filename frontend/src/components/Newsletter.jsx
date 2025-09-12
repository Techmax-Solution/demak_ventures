import { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your backend
      console.log('Subscribing email:', email);
      setIsSubscribed(true);
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }
  };

  return (
    <section className="relative bg-gray-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 min-h-[400px] lg:min-h-[500px]">
          
          {/* Left Side - Newsletter Content */}
          <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:px-16 lg:py-16">
            <div className="max-w-md w-full">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-gray-900 mb-4 sm:mb-6 tracking-wide text-center lg:text-left">
                OUR NEWSLETTER
              </h2>
              
              <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed text-center lg:text-left">
                It only takes a second to be the first to find out about our latest news
              </p>
              
              {/* Newsletter Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email..."
                    className="flex-1 px-4 py-3 sm:px-6 sm:py-4 text-gray-700 bg-white border-0 focus:outline-none focus:ring-0 text-base sm:text-lg placeholder-gray-500 w-full"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 sm:px-8 sm:py-4 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors duration-300 text-xs sm:text-sm tracking-wider uppercase w-full sm:w-auto"
                  >
                    SUBSCRIBE
                  </button>
                </div>
                
                {/* Success Message */}
                {isSubscribed && (
                  <div className="text-green-600 text-sm font-medium">
                    ✓ Thank you for subscribing to our newsletter!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Side - Model Image */}
          <div className="relative bg-gray-200 flex items-center justify-center order-first lg:order-last h-64 sm:h-80 lg:h-auto">
            {/* Background overlay for better image blending */}
            <div className="absolute inset-0 bg-gradient-to-l from-gray-300 to-gray-200"></div>
            
            {/* Model Image */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=500&fit=crop&crop=center"
                alt="Woman holding brown bag"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  // Fallback to another fashion image
                  e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=500&fit=crop&crop=center";
                }}
              />
            </div>
            
            {/* Subtle overlay for text readability if needed */}
            <div className="absolute inset-0 bg-black bg-opacity-5"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

import { Link } from 'react-router-dom';

const SignatureSection = () => {
  const circularProducts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center",
      alt: "Leather Belt"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center",
      alt: "Green Bag"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop&crop=center",
      alt: "Man in Shirt"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop&crop=center",
      alt: "Beige Shoes"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=200&h=200&fit=crop&crop=center",
      alt: "Denim Cap"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop&crop=center",
      alt: "White Sweater"
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Main Hero Section */}
      <div className="relative min-h-[600px] flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 lg:pr-12">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-tight text-gray-900">
                  Your Signature
                  <br />
                  <span className="font-normal">Look Starts Here</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-md">
                  Buy Now Absorbent Men's T-Shirts, Elegant Men's
                </p>
                
                <div className="pt-4">
                  <Link 
                    to="/shop" 
                    className="inline-block bg-gray-900 text-white px-8 py-4 font-medium hover:bg-gray-800 transition-colors duration-300 text-sm tracking-wide uppercase"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Content - Model Image */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Decorative Elements */}
              <div className="absolute top-12 right-12 w-4 h-4 bg-white rounded-full shadow-lg pulse-glow"></div>
              <div className="absolute top-32 left-8 w-3 h-3 bg-gray-900 rounded-full float-up"></div>
              <div className="absolute bottom-32 right-24 w-5 h-5 bg-white rounded-full shadow-lg pulse-glow" style={{ animationDelay: '1s' }}></div>
              
              {/* Main Model Image */}
              <div className="relative fade-in-scale">
                 <img 
                   src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=600&fit=crop&crop=center"
                   alt="Woman in yellow jacket"
                   className="w-80 h-96 lg:w-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
                   onError={(e) => {
                     // Fallback to a placeholder or different image
                     e.target.src = "https://via.placeholder.com/500x600/FCD34D/000000?text=Fashion+Model";
                   }}
                 />
                
                {/* Image overlay gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Circular Products Section */}
      <div className="pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 max-w-4xl">
              {circularProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group cursor-pointer fade-in-scale"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <div className="relative">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 border-4 border-white">
                      <img 
                        src={product.image}
                        alt={product.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    
                    {/* Floating ring effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-all duration-500"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-yellow-200 to-yellow-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-blue-200 to-blue-100 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </section>
  );
};

export default SignatureSection;

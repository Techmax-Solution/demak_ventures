import { Link } from 'react-router-dom';

const CollectionCards = () => {
  const collections = [
    {
      id: 1,
      category: "New Collection",
      title: "Walk In Confidence",
      bgColor: "#A7D8D0", // Mint/teal base color
      customGradient: "linear-gradient(90deg, hsla(0, 0%, 100%, 0) 0%, hsla(0, 0%, 100%, .2) 100%)",
      textColor: "text-gray-900",
      image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Stylish fashion collection - Walk in confidence"
    },
    {
      id: 2,
      category: "New Drop",
      title: "Own Your Style",
      bgColor: "bg-gradient-to-br from-amber-100 to-orange-200",
      textColor: "text-gray-900",
      image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Premium fashion accessories - Own your style"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {collections.map((collection, index) => (
            <div 
              key={collection.id}
              className={`relative overflow-hidden h-[400px] group cursor-pointer ${typeof collection.bgColor === 'string' && collection.bgColor.startsWith('bg-') ? collection.bgColor : ''}`}
              style={collection.bgColor && !collection.bgColor.startsWith('bg-') ? { backgroundColor: collection.bgColor } : {}}
            >
              {/* Background Image - Full Coverage */}
              <div className="absolute inset-0">
                <img 
                  src={collection.image}
                  alt={collection.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 contrast-105 saturate-75"
                  onError={(e) => {
                    // Fallback to high-quality fashion images
                    if (collection.id === 1) {
                      e.target.src = "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop";
                    } else {
                      e.target.src = "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop";
                    }
                  }}
                />
                
                {/* Subtle dark overlay for color harmony */}
                <div className="absolute inset-0 bg-slate-800 bg-opacity-10"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-30 h-full flex flex-col justify-center p-8 lg:p-12">
                <div className="max-w-xs">
                  <p className="text-sm font-medium tracking-wider uppercase text-gray-100 mb-2 opacity-90">
                    {collection.category}
                  </p>
                  
                  <h3 className="text-3xl lg:text-4xl font-light leading-tight text-white mb-8 drop-shadow-sm">
                    {collection.title}
                  </h3>
                  
                  <Link 
                    to="/shop"
                    className="inline-block px-6 py-3 border border-gray-100 text-gray-100 font-medium hover:bg-gray-100 hover:text-slate-900 transition-all duration-300 text-sm tracking-wide uppercase backdrop-blur-sm bg-white/5"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>

              {/* Custom Gradient Overlay */}
              {collection.customGradient && (
                <div 
                  className="absolute inset-0 z-20" 
                  style={{ background: collection.customGradient }}
                ></div>
              )}
              
              {/* Subtle gradient overlay for text readability */}
              <div className="absolute inset-0 z-25 bg-gradient-to-r from-slate-900/15 via-slate-800/5 to-transparent"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionCards;

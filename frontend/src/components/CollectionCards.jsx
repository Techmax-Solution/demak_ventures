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
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=400&fit=crop&crop=center",
      alt: "Multiple sunglasses on mint background"
    },
    {
      id: 2,
      category: "New Drop",
      title: "Own Your Style",
      bgColor: "bg-gradient-to-br from-amber-100 to-orange-200",
      textColor: "text-gray-900",
      image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=400&fit=crop&crop=center",
      alt: "Stacked woven hats on beige background"
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback images
                    if (collection.id === 1) {
                      e.target.src = "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop&crop=center";
                    } else {
                      e.target.src = "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=600&h=400&fit=crop&crop=center";
                    }
                  }}
                />
              </div>

              {/* Content Overlay */}
              <div className="relative z-30 h-full flex flex-col justify-center p-8 lg:p-12">
                <div className="max-w-xs">
                  <p className="text-sm font-medium tracking-wider uppercase text-gray-800 mb-2">
                    {collection.category}
                  </p>
                  
                  <h3 className="text-3xl lg:text-4xl font-light leading-tight text-gray-900 mb-8">
                    {collection.title}
                  </h3>
                  
                  <Link 
                    to="/shop"
                    className="inline-block px-6 py-3 border-2 border-gray-800 text-gray-800 font-medium hover:bg-gray-800 hover:text-white transition-all duration-300 text-sm tracking-wide uppercase"
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
              
              {/* Subtle Overlay for Text Readability */}
              <div className="absolute inset-0 bg-white bg-opacity-10"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionCards;

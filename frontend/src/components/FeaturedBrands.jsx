const FeaturedBrands = () => {
  const brands = [
    {
      id: 1,
      name: "ARITZIA",
      style: "font-light tracking-wider text-2xl"
    },
    {
      id: 2,
      name: "BOUTIQUE",
      subtitle: "CLOTHING STORE",
      style: "font-light tracking-wider text-2xl"
    },
    {
      id: 3,
      name: "EVERLANE",
      style: "font-bold tracking-wider text-2xl"
    },
    {
      id: 4,
      name: "Fashion",
      subtitle: "BEAUTY CARE",
      style: "font-light italic text-2xl"
    },
    {
      id: 5,
      name: "MANGO",
      style: "font-light tracking-widest text-2xl"
    }
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100 overflow-hidden">
      <div className="relative">
        <div className="brands-scroll flex items-center gap-16 lg:gap-24 whitespace-nowrap">
          {/* First set of brands */}
          {brands.map((brand) => (
            <div 
              key={brand.id}
              className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:opacity-70 flex-shrink-0"
            >
              <div className={`text-gray-800 ${brand.style} mb-1`}>
                {brand.name}
              </div>
              {brand.subtitle && (
                <div className="text-xs text-gray-500 tracking-wider font-medium">
                  {brand.subtitle}
                </div>
              )}
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {brands.map((brand) => (
            <div 
              key={`duplicate-${brand.id}`}
              className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:opacity-70 flex-shrink-0"
            >
              <div className={`text-gray-800 ${brand.style} mb-1`}>
                {brand.name}
              </div>
              {brand.subtitle && (
                <div className="text-xs text-gray-500 tracking-wider font-medium">
                  {brand.subtitle}
                </div>
              )}
            </div>
          ))}
          
          {/* Third set for extra smoothness */}
          {brands.map((brand) => (
            <div 
              key={`triple-${brand.id}`}
              className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:opacity-70 flex-shrink-0"
            >
              <div className={`text-gray-800 ${brand.style} mb-1`}>
                {brand.name}
              </div>
              {brand.subtitle && (
                <div className="text-xs text-gray-500 tracking-wider font-medium">
                  {brand.subtitle}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBrands;

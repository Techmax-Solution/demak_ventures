import { useState } from 'react';

const Testimonial = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "The Customer Service At This Store Is Truly Exceptional. The Staff Is Always Friendly & Attentive,Providing Personalized Recommendations Based On My Style Preferences.I Appreciate How They Take...",
      rating: 4,
      name: "STEVE JOBS",
      title: "PHOTOGRAPHER"
    },
    {
      id: 2,
      text: "Amazing quality and fast delivery! The clothes fit perfectly and the fabric feels premium. I've been shopping here for months and never been disappointed. Highly recommend this store to everyone!",
      rating: 5,
      name: "SARAH WILSON",
      title: "FASHION BLOGGER"
    },
    {
      id: 3,
      text: "Outstanding customer experience from start to finish. The team helped me find exactly what I was looking for and provided excellent styling advice. Will definitely be coming back for more!",
      rating: 5,
      name: "MICHAEL CHEN",
      title: "CREATIVE DIRECTOR"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentData = testimonials[currentTestimonial];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Section Title */}
          <h2 className="text-4xl font-light text-gray-900 mb-16">Testimonial</h2>
          
          {/* Testimonial Content */}
          <div className="relative">
            
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-300 -ml-12"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-300 -mr-12"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Testimonial Text */}
            <div className="mb-12">
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed font-light max-w-3xl mx-auto">
                "{currentData.text}"
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center items-center mb-8">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-6 h-6 mx-1 ${
                    index < currentData.rating
                      ? 'text-gray-900 fill-current'
                      : 'text-gray-300'
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            {/* Customer Info */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {currentData.name}
              </h4>
              <p className="text-gray-500 text-sm tracking-wider uppercase">
                — {currentData.title}
              </p>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center items-center mt-12 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTestimonial
                    ? 'bg-gray-900 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;

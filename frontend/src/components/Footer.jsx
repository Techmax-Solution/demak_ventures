import { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter subscription:', email);
      setEmail('');
      // Add success feedback here
    }
  };

  return (
    <footer className="bg-orange-50 border-t border-orange-100">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* EXPLORE Section */}
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-6 tracking-wide">EXPLORE</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/shop?category=men" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/shop?category=women" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/shop?category=kids" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Kids
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shoes" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bags" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Bags
                </Link>
              </li>
            </ul>
          </div>

          {/* FOLLOW US Section */}
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-6 tracking-wide">FOLLOW US</h3>
            <ul className="space-y-4">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  YouTube
                </a>
              </li>
              <li>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Pinterest
                </a>
              </li>
            </ul>
          </div>

          {/* CATEGORIES Section */}
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-6 tracking-wide">CATEGORIES</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/shop?category=t-shirts" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shirts" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=pants" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Pants
                </Link>
              </li>
              <li>
                <Link to="/shop?category=dresses" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Dresses
                </Link>
              </li>
              <li>
                <Link to="/shop?category=tops" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Tops
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bottoms" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  Bottoms
                </Link>
              </li>
            </ul>
          </div>

          {/* OUR NEWSLETTER Section */}
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-6 tracking-wide">OUR NEWSLETTER</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              It only takes a second to be the first to find out about our latest news
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email..."
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors duration-200"
                required
              />
              <button
                type="submit"
                className="w-full bg-orange-100 text-orange-600 py-3 px-6 font-medium hover:bg-orange-200 transition-colors duration-200 tracking-wide uppercase"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-orange-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Copyright */}
            <div className="text-gray-600 text-sm">
              © 2025 — Demak. All Rights Reserved.
            </div>

            {/* Brand Name */}
            <div className="text-center">
              <h2 className="text-2xl font-light tracking-wider text-orange-600">Demak.</h2>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-3">
              {/* American Express */}
              <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">AMEX</span>
              </div>
              
              {/* Mastercard */}
              <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center">
                <div className="flex">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full -ml-1"></div>
                </div>
              </div>
              
              {/* Visa */}
              <div className="w-10 h-6 bg-blue-700 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              
              {/* PayPal */}
              <div className="w-10 h-6 bg-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">PP</span>
              </div>
              
              {/* Shop Pay */}
              <div className="w-10 h-6 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">SP</span>
              </div>
              
              {/* Klarna */}
              <div className="w-10 h-6 bg-pink-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors duration-200 shadow-lg"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
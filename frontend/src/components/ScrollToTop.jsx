import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Reset scroll position immediately before any DOM updates
    // This ensures the page starts from the top, not scrolls to it
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.pageYOffset = 0;
  }, [pathname]);

  return null;
};

export default ScrollToTop;

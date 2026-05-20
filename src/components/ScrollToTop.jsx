import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the window to top
    window.scrollTo(0, 0);
    
    // Also scroll the root/body in case they are the scrolling containers
    document.body.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    
    // Find any active page container and scroll it to top
    const pageContainers = document.querySelectorAll('[class$="-page"]');
    pageContainers.forEach(container => {
      container.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
}

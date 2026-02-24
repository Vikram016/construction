// src/components/ScrollToTop.jsx
// Global scroll-to-top on route change
// Fixes the bug where navigating loads page at bottom instead of top

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls window to top on every route change.
 * Works on all devices: desktop, laptop, tablet, mobile.
 * 
 * Usage: Place inside <Router> but before <Routes>
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly on route change
    // behavior: "auto" = instant (no smooth scroll)
    // This ensures immediate scroll on all devices
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  }, [pathname]); // Trigger on pathname change

  return null; // This component renders nothing
};

export default ScrollToTop;

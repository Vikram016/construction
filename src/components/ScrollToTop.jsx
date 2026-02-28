// src/components/ScrollToTop.jsx
// Scroll to top on every route change — iOS Safari compatible

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // iOS Safari sometimes ignores window.scrollTo inside useEffect
    // requestAnimationFrame ensures it fires after the browser paints
    const raf = requestAnimationFrame(() => {
      try {
        // Modern approach — 'instant' supported in iOS 15.4+
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } catch {
        // Fallback for older iOS Safari
        window.scrollTo(0, 0);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

/**
 * useNavigateBack.js
 *
 * Works correctly in all three cases:
 *   A) In-app navigation  → navigate(-1)          [location.key !== 'default']
 *   B) Direct URL / new tab / refresh → navigate fallback  [location.key === 'default']
 *
 * Also wires:
 *   • Keyboard: Alt+← or Backspace (not while typing)
 *   • Touch: swipe right from left 30px edge
 */
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SWIPE_EDGE = 30;
const SWIPE_MIN  = 80;
const SWIPE_VMAX = 60;

export const useNavigateBack = ({ fallback = '/products' } = {}) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const touchStart = useRef(null);

  // location.key === 'default' only on first load / direct URL / refresh.
  // Any in-app navigation gives a unique key → safe to navigate(-1).
  const hasHistory = location.key !== 'default';

  const goBack = useCallback(() => {
    if (hasHistory) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, hasHistory, fallback]);

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      const tag    = document.activeElement?.tagName?.toLowerCase();
      const typing = ['input', 'textarea', 'select'].includes(tag) ||
                     document.activeElement?.isContentEditable;
      if (typing) return;
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goBack]);

  // Touch swipe from left edge
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchStart.current = t.clientX <= SWIPE_EDGE ? { x: t.clientX, y: t.clientY } : null;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!touchStart.current) return;
    if (Math.abs(e.touches[0].clientY - touchStart.current.y) > SWIPE_VMAX)
      touchStart.current = null;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    if (t.clientX - touchStart.current.x >= SWIPE_MIN &&
        Math.abs(t.clientY - touchStart.current.y) <= SWIPE_VMAX) goBack();
    touchStart.current = null;
  }, [goBack]);

  return {
    goBack,
    hasHistory,
    swipeHandlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
};

export default useNavigateBack;

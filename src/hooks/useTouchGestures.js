import { useState, useRef, useCallback } from 'react';

export function useTouchGestures({ onZoom, onPan }) {
  const lastTouchDist = useRef(null);
  const lastTouchPos = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastTouchDist.current) {
        const scale = dist / lastTouchDist.current;
        onZoom?.(scale);
      }
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && lastTouchPos.current) {
      const dx = e.touches[0].clientX - lastTouchPos.current.x;
      const dy = e.touches[0].clientY - lastTouchPos.current.y;
      onPan?.({ dx, dy });
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, [onZoom, onPan]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
    lastTouchPos.current = null;
  }, []);

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}

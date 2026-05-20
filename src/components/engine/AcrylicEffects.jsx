'use client';

/**
 * AcrylicEffects
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium acrylic / glass visual effects rendered via CSS + Framer Motion.
 * Used in product cards, detail pages, and editor previews.
 */

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useCallback } from 'react';

// ── Animated acrylic shine (moving highlight bar) ─────────────────────────────
export function AcrylicShine({ className = '', style = {}, children }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {children}
      {/* Animated diagonal shine stripe */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
          width: '200%',
          left: '-100%',
        }}
        animate={{ left: ['−100%', '100%'] }}
        transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
      />
    </div>
  );
}

// ── Depth shadow for mounted acrylic ─────────────────────────────────────────
export function AcrylicDepthShadow({ intensity = 1, color = '99,102,241' }) {
  return (
    <div
      className="absolute inset-0 rounded-[inherit] pointer-events-none"
      style={{
        boxShadow: [
          `0 2px 0 rgba(255,255,255,0.12) inset`,                          // top edge highlight
          `0 -1px 0 rgba(0,0,0,0.3) inset`,                               // bottom edge shadow
          `0 20px 60px -10px rgba(0,0,0,${0.6 * intensity})`,             // main drop shadow
          `0 40px 100px -20px rgba(0,0,0,${0.4 * intensity})`,            // soft diffuse shadow
          `0 0 0 1px rgba(255,255,255,0.07)`,                             // outer rim
          `0 0 40px rgba(${color},${0.15 * intensity})`,                  // colored glow
        ].join(', '),
        zIndex: 5,
      }}
    />
  );
}

// ── Glass reflection layer ────────────────────────────────────────────────────
export function GlassReflection({ angle = 135 }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden"
      style={{ zIndex: 4 }}
    >
      {/* Primary gloss */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(${angle}deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)`,
        }}
      />
      {/* Secondary micro-specular */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}

// ── 3-D tilt card (mouse-tracking parallax) ───────────────────────────────────
export function TiltCard({ children, className = '', style = {}, intensity = 15 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-1, 1], [intensity, -intensity]);
  const rotateY = useTransform(x, [-1, 1], [-intensity, intensity]);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width * 2 - 1;
    const ny = (e.clientY - rect.top) / rect.height * 2 - 1;
    x.set(nx);
    y.set(ny);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Floating hover animation wrapper ─────────────────────────────────────────
export function FloatingCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { HiArrowRight, HiSparkles } from 'react-icons/hi';

const HERO_PRODUCTS = [
  { id: 1, name: 'Circle Acrylic', shape: 'circle', color: 'from-violet-500 to-purple-600', delay: 0 },
  { id: 2, name: 'Hexagon Clock', shape: 'hexagon', color: 'from-blue-500 to-indigo-600', delay: 0.2 },
  { id: 3, name: 'Circle Acrylic', shape: 'circle', color: 'from-orange-500 to-amber-600', delay: 0 },
  { id: 4, name: 'Heart Frame', shape: 'heart', color: 'from-pink-500 to-rose-600', delay: 0.4 },
];

function ShapePreview({ shape, color, delay, name }) {
  const shapes = {
    circle: (
      <div className={`w-full h-full rounded-full bg-gradient-to-br ${color} acrylic-shine relative overflow-hidden`}>
        <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
      </div>
    ),
    hexagon: (
      <div className="w-full h-full flex items-center justify-center">
        <div className={`w-5/6 h-5/6 bg-gradient-to-br ${color} acrylic-shine`}
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        />
      </div>
    ),
    heart: (
      <div className="w-full h-full flex items-center justify-center relative">
        <svg width="0" height="0" className="absolute">
          <defs>
            <clipPath id="hero-heart-clip" clipPathUnits="objectBoundingBox">
              <path d="M0.5,0.95 C0.5,0.95 0.05,0.65 0.05,0.35 C0.05,0.15 0.2,0 0.35,0 C0.45,0 0.5,0.1 0.5,0.1 C0.5,0.1 0.55,0 0.65,0 C0.8,0 0.95,0.15 0.95,0.35 C0.95,0.65 0.5,0.95 0.5,0.95 Z"></path>
            </clipPath>
          </defs>
        </svg>
        <div className={`w-6/6 h-5/6 bg-gradient-to-br ${color} acrylic-shine relative`}
          style={{ clipPath: 'url(#hero-heart-clip)' }}
        />
      </div>
    ),
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      className="floating"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="w-32 h-32 sm:w-40 sm:h-40 shadow-premium">
        {shapes[shape]}
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero noise-bg">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent-500/15 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-3xl"
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 text-primary-300 text-sm font-medium mb-6"
            >
              <HiSparkles className="w-4 h-4" />
              Premium Acrylic Photo Products
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              Turn Memories Into{' '}
              <span className="text-gradient">
                Stunning
              </span>{' '}
              Wall Art
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/60 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg"
            >
              Premium custom acrylic prints in unique shapes — circles, hexagons, triangles, and more. Museum-quality prints delivered to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl gradient-primary text-white font-bold text-lg hover:opacity-90 transition-all glow group"
              >
                Start Designing
                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
              >
                View All Products
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="flex items-center gap-8 mt-10 pt-10 border-t border-white/10"
            >
              {[
                { value: '50,000+', label: 'Happy Customers' },
                { value: '4.9★', label: 'Average Rating' },
                { value: '2-5 Days', label: 'Delivery' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Product Shapes Grid */}
          <div className="flex flex-wrap justify-center gap-6">
            {HERO_PRODUCTS.map((p) => (
              <ShapePreview key={p.id} {...p} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30" />
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-white/50"
        />
      </motion.div>
    </section>
  );
}

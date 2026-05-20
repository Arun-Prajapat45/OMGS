'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// Placeholder image for the shapes. You can customize these per shape if you want.
import shapeImage from '@/assets/hero-acrylic.png';

const SHAPES = [
  { id: 'circle', label: 'Circle', href: '/products?shape=circle', clipPath: 'circle(50%)', image: shapeImage },
  { id: 'oval', label: 'Oval', href: '/products?category=oval', clipPath: 'ellipse(35% 50% at 50% 50%)', image: shapeImage },
  { id: 'square', label: 'Square', href: '/products?shape=square', clipPath: 'inset(0% round 16px)', image: shapeImage },
  { id: 'triangle', label: 'Triangle', href: '/products?shape=triangle', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', image: shapeImage },
  { id: 'hexagon', label: 'Hexagon', href: '/products?shape=hexagon', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', image: shapeImage },
  { id: 'heart', label: 'Heart', href: '/products?category=heart', clipPath: 'url(#heart-clip)', image: shapeImage },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

export default function ShapeCategories() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">

      {/* SVG Definitions for custom shapes like Heart to enable responsive scaling */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.95 C0.5,0.95 0.05,0.65 0.05,0.35 C0.05,0.15 0.2,0 0.35,0 C0.45,0 0.5,0.1 0.5,0.1 C0.5,0.1 0.55,0 0.65,0 C0.8,0 0.95,0.15 0.95,0.35 C0.95,0.65 0.5,0.95 0.5,0.95 Z"></path>
          </clipPath>
        </defs>
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase mb-3 block">Shop by Shape</span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
          Choose Your{' '}
          <span className="text-gradient">Perfect Style</span>
        </h2>
        <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
          From classic rectangles to stunning hexagons – we print on any shape you love.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 justify-center"
      >
        {SHAPES.map((shape) => (
          <motion.div key={shape.id} variants={itemVariants} className="flex justify-center">
            <Link href={shape.href} className="group block">
              <div className="flex flex-col items-center gap-4">
                {/* Shape Visual with Dynamic Image Masking */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 relative flex items-center justify-center">
                  <div
                    className="w-full h-full relative group-hover:scale-110 transition-transform duration-300"
                    style={{
                      clipPath: shape.clipPath,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Image
                      src={shape.image}
                      alt={shape.label}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 96px, 112px"
                    />
                    {/* Glass shine overlay on top of image */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
                  </div>
                </div>
                <span className="text-white/70 group-hover:text-white text-sm font-medium transition-colors">{shape.label}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

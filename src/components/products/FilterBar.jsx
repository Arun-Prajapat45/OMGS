'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiFilter, HiX } from 'react-icons/hi';
import { cn } from '@/lib/utils';

const SHAPES = [
  { id: 'all', label: 'All Shapes' },
  { id: 'portrait', label: 'Portrait', icon: '📷' },
  { id: 'landscape', label: 'Landscape', icon: '🏞️' },
  { id: 'circle', label: 'Circle', icon: '⭕' },
  { id: 'oval', label: 'Oval', icon: '🟠' },
  { id: 'egg', label: 'Egg', icon: '🥚' },
  { id: 'heart', label: 'Heart', icon: '❤️' },
  { id: 'cloud', label: 'Cloud', icon: '☁️' },
  { id: 'square', label: 'Square', icon: '▪' },
  { id: 'hexagon', label: 'Hexagon', icon: '⬡' },
  { id: 'triangle', label: 'Triangle', icon: '△' },
  { id: 'collage', label: 'Collage', icon: '🎨' },
  { id: 'clock', label: 'Clock', icon: '🕐' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'acrylic-wall-photo', label: 'Acrylic Wall Photos' },
  { id: 'circle-acrylic', label: 'Circle Acrylic' },
  { id: 'hexagon-clock', label: 'Hexagon Clocks' },
  { id: 'triangle-clock', label: 'Triangle Clocks' },
  { id: 'acrylic-clock', label: 'Acrylic Wall Clocks' },
  { id: 'collage-frame', label: 'Collage Frames' },
  { id: 'couple-gift', label: 'Couple Gifts' },
  { id: 'baby-frame', label: 'Baby Frames' },
];

const PRICE_RANGES = [
  { id: 'all', label: 'Any Price' },
  { id: '0-999', label: 'Under ₹999' },
  { id: '1000-1999', label: '₹1,000 – ₹1,999' },
  { id: '2000-2999', label: '₹2,000 – ₹2,999' },
  { id: '3000+', label: '₹3,000+' },
];

export default function FilterBar({ searchParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentShape = searchParams?.shape || 'all';
  const currentCategory = searchParams?.category || 'all';
  const currentPrice = searchParams?.price || 'all';

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const hasFilters = currentShape !== 'all' || currentCategory !== 'all' || currentPrice !== 'all';

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-accent-400 hover:text-accent-300 transition-colors font-medium"
        >
          <HiX className="w-4 h-4" /> Clear all filters
        </button>
      )}

      {/* Shape Filter */}
      <div>
        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Shape</h3>
        <div className="space-y-1">
          {SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => updateFilter('shape', shape.id)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                currentShape === shape.id
                  ? 'bg-primary-600/30 text-primary-300 font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {shape.icon && <span>{shape.icon}</span>}
              {shape.label}
              {currentShape === shape.id && (
                <motion.div layoutId="shape-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Category</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.id)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                currentCategory === cat.id
                  ? 'bg-primary-600/30 text-primary-300 font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Price Range</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => updateFilter('price', range.id)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                currentPrice === range.id
                  ? 'bg-primary-600/30 text-primary-300 font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-3 glass rounded-2xl p-5 border border-white/10"
      >
        <FilterContent />
      </motion.div>
    </>
  );
}

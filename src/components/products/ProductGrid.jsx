'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  HiOutlineHeart, HiHeart, HiOutlineStar, HiStar,
  HiOutlineShoppingCart,
  HiChevronDown, HiOutlineFire, HiOutlineSparkles,
} from 'react-icons/hi2';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist, selectIsWishlisted } from '@/store/slices/wishlistSlice';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import ProductShapePreview from '@/components/engine/ProductShapePreview';
import { AcrylicDepthShadow, GlassReflection, FloatingCard } from '@/components/engine/AcrylicEffects';
import { Edit2 } from 'lucide-react';
import secondaryImage from '../../assets/secondary_image.png';

const getImageDimensions = (shape) => {
  switch (shape?.toLowerCase()) {
    case 'portrait': return 'w-[70%] h-[92%]';
    case 'landscape': return 'w-[92%] h-[70%]';
    case 'square': return 'w-[82%] h-[82%]';
    case 'hexagon': return 'w-[85%] h-[85%]';
    case 'circle': return 'w-[80%] aspect-square rounded-full';
    case 'oval': return 'w-[85%] h-[76%]';
    case 'egg': return 'w-[88%] h-[88%]';
    case 'heart': return 'w-[90%] h-[90%]';
    case 'cloud': return 'w-[96%] h-[82%]';
    default: return 'w-[80%] h-[80%]';
  }
};

const OVAL_CLIP_PATH =
  'ellipse(50% 40% at 50% 50%)';

const EGG_CLIP_PATH =
  'path("M50 1 C82 1 99 28 99 58 C99 84 78 99 50 99 C22 99 1 84 1 58 C1 28 18 1 50 1Z")';

const HEART_CLIP_PATH =
  'path("M50 95 L15 60 C-5 35 10 5 35 5 C48 5 50 18 50 18 C50 18 52 5 65 5 C90 5 105 35 85 60 Z")';

const CLOUD_CLIP_PATH =
  'path("M20 80 C5 80 0 68 0 55 C0 40 10 28 25 28 C28 12 42 0 58 0 C76 0 90 14 92 32 C97 32 100 32 100 32 C112 32 120 42 120 55 C120 69 110 80 96 80 Z")';


function getShapeClipPath(shape) {
  const lower = shape?.toLowerCase();
  if (!lower) return undefined;
  if (lower === 'circle') return 'circle(50% at 50% 50%)';
  if (lower === 'hexagon') return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
  if (lower === 'triangle') return 'polygon(50% 0%, 100% 100%, 0% 100%)';
  if (lower === 'heart') return HEART_CLIP_PATH;
  if (lower === 'oval') return OVAL_CLIP_PATH;
  if (lower === 'egg') return EGG_CLIP_PATH;
  if (lower === 'cloud') return CLOUD_CLIP_PATH;
  return undefined;
}

function pointsToClipPath(region, template) {
  const points = Array.isArray(region.points) ? region.points : undefined;
  if (!points?.length) return undefined;

  const canvasW = template?.canvas?.width || 1000;
  const canvasH = template?.canvas?.height || 1000;
  const left = region.x || 0;
  const top = region.y || 0;

  const radiusSize = typeof region.radius === 'number' ? region.radius * 2 : undefined;
  const regionWidth = region.width || radiusSize || Math.max(...points.map(([x]) => x)) - Math.min(...points.map(([x]) => x)) || canvasW;
  const regionHeight = region.height || radiusSize || Math.max(...points.map(([, y]) => y)) - Math.min(...points.map(([, y]) => y)) || canvasH;
  const width = regionWidth || 1;
  const height = regionHeight || 1;

  const values = points.map(([x, y]) => {
    const px = ((x - left) / width) * 100;
    const py = ((y - top) / height) * 100;
    return `${px.toFixed(2)}% ${py.toFixed(2)}%`;
  });

  return values.length ? `polygon(${values.join(', ')})` : undefined;
}

function getRegionClipPath(region, template) {
  const type = region?.type?.toLowerCase();
  if (!type) return undefined;

  if (type === 'circle') return 'circle(50% at 50% 50%)';
  if (type === 'hexagon') return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  if (type === 'triangle') return 'polygon(50% 0%, 0% 100%, 100% 100%)';
  if (type === 'oval') return OVAL_CLIP_PATH;
  if (type === 'egg') return EGG_CLIP_PATH;
  if (type === 'heart') return HEART_CLIP_PATH;
  if (type === 'cloud') return CLOUD_CLIP_PATH;
  if (['polygon', 'custom'].includes(type)) return pointsToClipPath(region, template);
  return undefined;
}

// ── Resolve template for a product ───────────────────────────────────────────
function resolveTemplate(product) {
  if (product?.template?.templateJson) {
    try {
      return typeof product.template.templateJson === 'string'
        ? JSON.parse(product.template.templateJson)
        : product.template.templateJson;
    } catch { }
  }
  return {
    shape: product?.shape || 'rectangle',
    canvas: { width: 1000, height: 1000, backgroundColor: '#ffffff' },
    editableRegions: []
  };
}

// ── Star rating display ───────────────────────────────────────────────────────
function StarRating({ rating = 0, count = 0, small = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={small ? 'text-[10px]' : 'text-xs'}>
          {s <= Math.round(rating)
            ? <HiStar className="inline text-amber-400" />
            : <HiOutlineStar className="inline text-white/20" />}
        </span>
      ))}
      {count > 0 && (
        <span className={`text-white/40 ${small ? 'text-[10px]' : 'text-xs'} ml-0.5`}>
          ({count})
        </span>
      )}
    </div>
  );
}

// ── Feature chips ─────────────────────────────────────────────────────────────
function FeatureChips({ features }) {
  if (!features) return null;
  const list = Array.isArray(features) ? features : [];
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {list.slice(0, 2).map((f, i) => (
        <span
          key={i}
          className="px-1.5 py-0.5 rounded-md text-[9px] font-medium text-white/60 border border-white/10"
        >
          {f}
        </span>
      ))}
    </div>
  );
}

// ── Wishlist button ───────────────────────────────────────────────────────────
function WishlistBtn({ productId }) {
  const dispatch = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(productId));
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleWishlist(productId));
      }}
      className="w-8 h-8 rounded-xl glass flex items-center justify-center transition-all hover:scale-110 z-20"
      aria-label="Toggle wishlist"
    >
      {isWishlisted
        ? <HiHeart className="w-4 h-4 text-red-400" />
        : <HiOutlineHeart className="w-4 h-4 text-white/60" />}
    </motion.button>
  );
}

// ── Product sizes preview strip ───────────────────────────────────────────────
function SizeStrip({ template }) {
  const sizes = template?.printSizes || [];
  if (!sizes.length) return null;
  return (
    <div className="flex gap-1 mt-2 flex-wrap">
      {sizes.slice(0, 3).map((s, i) => (
        <span
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-white/5 text-white/40 text-[9px] border border-white/8"
        >
          {s.label}
        </span>
      ))}
      {sizes.length > 3 && (
        <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-white/30 text-[9px]">
          +{sizes.length - 3} more
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Card Image Block for Single Shapes & Collages
// ─────────────────────────────────────────────────────────────────────────────
function CardImageBlock({ product, template, isCollage, shape, isCircle, primaryImage, showSecondary }) {
  let regionImages = [];
  try {
    regionImages = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
  } catch (e) { }

  const clipPath = getShapeClipPath(shape);
  const isHeart = shape === 'heart';

  const dropShadowFilter = isHeart
    ? 'drop-shadow(0 0 1px rgba(255,255,255,0.3)) drop-shadow(0 15px 30px rgba(255, 90, 145, 0.25)) drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
    : 'drop-shadow(0 0 1px rgba(255,255,255,0.15)) drop-shadow(6px 4px 6px rgba(0, 0, 0, 0.6))';

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-[1.02] ${isCollage ? 'w-[90%] aspect-square' : getImageDimensions(shape)}`}
      style={{
        filter: dropShadowFilter,
        // Add overflow space for scaled shapes and shadows
        padding: shape === 'heart' ? '8px' : shape === 'cloud' ? '6px' : shape === 'egg' ? '4px' : '0'
      }}
    >
      <div
        className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center"
        style={{
          borderRadius: isCircle && !isCollage ? '50%' : clipPath ? '0' : '6px',
          clipPath: clipPath,
          WebkitClipPath: clipPath,
          // Use transform only if necessary, otherwise skip for clean centering
          transform:
            shape === 'heart'
              ? 'scale(1.05)'
              : shape === 'cloud'
                ? 'scale(1.02)'
                : shape === 'egg'
                  ? 'scale(1.01)'
                  : 'scale(1)',
          transformOrigin: 'center',
        }}
      >
        {isCollage ? (
          <div className="absolute inset-0" style={{ background: template?.canvas?.backgroundColor || '#111118' }}>
            {template.editableRegions?.map((region, i) => {
              const regionImg = regionImages[i] || primaryImage;
              const canvasW = template.canvas?.width || 1000;
              const canvasH = template.canvas?.height || 1000;
              const left = (region.x / canvasW) * 100;
              const top = (region.y / canvasH) * 100;
              const width = ((region.width || region.radius * 2) / canvasW) * 100;
              const height = ((region.height || region.radius * 2) / canvasH) * 100;

              const regionClip = getRegionClipPath(region, template);

              return (
                <div
                  key={region.id || i}
                  className="absolute overflow-hidden"
                  style={{
                    left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`,
                    borderRadius: region.cornerRadius ? `${(region.cornerRadius / canvasW) * 100}%` : undefined,
                    border: '1px solid rgba(255,255,255,0.1)',
                    clipPath: regionClip,
                    WebkitClipPath: regionClip,
                  }}
                >
                  <img src={regionImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <img
                    alt=""
                    src={secondaryImage.src || secondaryImage}
                    style={{
                      transform: showSecondary ? 'translateX(0)' : 'translateX(-100%)',
                      transition: 'transform 600ms linear'
                    }}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <img
              alt={product.name || 'Product Image'}
              loading="lazy"
              src={primaryImage}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <img
              alt={`${product.name} alternate`}
              loading="lazy"
              src={secondaryImage.src || secondaryImage}
              style={{
                transform: showSecondary ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 600ms linear'
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
          </>
        )}

        <div className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute inset-0 opacity-50 mix-blend-overlay"
            style={{
              background: 'radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(120% 120% at 50% 100%, rgba(0,0,0,0.8) 0%, transparent 50%)'
            }}
          ></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full"></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductCard — template-driven card
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ product, index, showSecondary }) {
  const template = useMemo(() => resolveTemplate(product), [product]);
  const shape = template?.shape || product?.shape || 'rectangle';
  const isCircle = shape?.toLowerCase() === 'circle';
  const isCollage = (template?.editableRegions?.length || 0) > 1;

  const primaryImage = product.featuredImage || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80';

  return (
    <Link
      href={`/products/${product.slug}`}
      id={`product-card-${product.id}`}
      className="product-card border-[3px] border-white/10 text-left w-full group relative block overflow-hidden bg-dark-800 rounded shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/20 hover:-translate-y-2 transition-all duration-500"
    >
      <div className="relative overflow-hidden bg-dark-900/60 rounded-t-xl border-b border-white/5">
        <div className="aspect-square w-full relative flex items-center justify-center p-3">
          <CardImageBlock
            product={product}
            template={template}
            isCollage={isCollage}
            shape={shape}
            isCircle={isCircle}
            primaryImage={primaryImage}
            showSecondary={showSecondary}
          />
        </div>
      </div>

      <div className="p-3 pb-4">
        <p className="text-sm font-semibold text-white truncate whitespace-nowrap text-center mb-3">
          {product.name}
        </p>

        <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-[#cc0000]/40 bg-[#cc0000]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#ff4444] group-hover:bg-[#cc0000] group-hover:text-white transition-colors duration-300">
          <Edit2 size={12} strokeWidth={2.5} />
          Customise
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sort & filter bar
// ─────────────────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'trending', label: 'Trending' },
];

function SortBar({ total, sort, onSort, viewMode, onViewMode }) {
  return (
    <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="text-white/40 text-sm">
          <span className="text-white font-semibold">{total}</span> products
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Grid/List toggle */}
        <div className="flex items-center glass rounded-xl border border-white/10 overflow-hidden">
          <button
            id="view-grid-btn"
            onClick={() => onViewMode('grid')}
            className={`px-3 py-2 text-sm transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-white/40 hover:text-white'}`}
            aria-label="Grid view"
          >
            ⊞
          </button>
          <button
            id="view-list-btn"
            onClick={() => onViewMode('list')}
            className={`px-3 py-2 text-sm transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-white/40 hover:text-white'}`}
            aria-label="List view"
          >
            ☰
          </button>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            id="product-sort-select"
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 glass rounded-xl text-white/70 text-sm border border-white/10 bg-transparent cursor-pointer outline-none focus:border-primary-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-dark-800 text-white">
                {o.label}
              </option>
            ))}
          </select>
          <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shape filter pills (quick horizontal scroll)
// ─────────────────────────────────────────────────────────────────────────────
const SHAPE_PILLS = [
  { value: 'all', label: 'All', icon: '🔳' },
  { value: 'circle', label: 'Circle', icon: '⭕' },
  { value: 'hexagon', label: 'Hexagon', icon: '⬡' },
  { value: 'square', label: 'Square', icon: '⬜' },
  { value: 'portrait', label: 'Portrait', icon: '🖼' },
  { value: 'landscape', label: 'Landscape', icon: '🌄' },
  { value: 'triangle', label: 'Triangle', icon: '🔺' },
  { value: 'oval', label: 'Oval', icon: '🟠' },
  { value: 'egg', label: 'Egg', icon: '🥚' },
  { value: 'heart', label: 'Heart', icon: '❤️' },
  { value: 'cloud', label: 'Cloud', icon: '☁️' },
  { value: 'custom', label: 'Custom', icon: '✨' },
];

function ShapePills({ active, onChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-hide snap-x snap-mandatory">
      {SHAPE_PILLS.map((pill) => (
        <button
          key={pill.value}
          id={`shape-pill-${pill.value}`}
          onClick={() => onChange(pill.value)}
          className={`flex-shrink-0 snap-start inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold border transition-all duration-200 ${active === pill.value
            ? 'bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-900/30'
            : 'glass border-white/10 text-white/70 hover:text-white hover:border-white/20'
            }`}
        >
          <span>{pill.icon}</span>
          {pill.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List view card (horizontal layout)
// ─────────────────────────────────────────────────────────────────────────────
function ProductListCard({ product, index, showSecondary }) {
  const template = useMemo(() => resolveTemplate(product), [product]);
  const shape = template?.shape || product?.shape || 'rectangle';
  const isCircle = shape?.toLowerCase() === 'circle';
  const isCollage = (template?.editableRegions?.length || 0) > 1;

  const primaryImage = product.featuredImage || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link
        href={`/products/${product.slug}`}
        id={`product-list-${product.id}`}
        className="flex gap-4 bg-dark-800 rounded-2xl border-[3px] border-white/10 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="w-32 h-32 flex-shrink-0 bg-dark-900/60 rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-white/5">
          <CardImageBlock
            product={product}
            template={template}
            isCollage={isCollage}
            shape={shape}
            isCircle={isCircle}
            primaryImage={primaryImage}
            showSecondary={showSecondary}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center py-2">
          <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-[#ff4444] transition-colors">
            {product.name}
          </h3>
          <p className="text-white/40 text-sm line-clamp-2 mb-3">{product.shortDescription || product.description}</p>

          <div className="flex items-center gap-3">
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-[#cc0000]/40 bg-[#cc0000]/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#ff4444] group-hover:bg-[#cc0000] group-hover:text-white transition-colors duration-300">
              <Edit2 size={14} strokeWidth={2.5} />
              Customise
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-32 text-center gap-4"
    >
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-2"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        🔍
      </div>
      <h3 className="text-xl font-semibold text-white">No products found</h3>
      <p className="text-white/40 text-sm max-w-xs">
        Try adjusting your shape or category filters to discover more products.
      </p>
      <button
        onClick={onReset}
        className="mt-2 px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all"
      >
        Clear Filters
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductGrid — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductGrid({ searchParams, products = [] }) {
  const [sort, setSort] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [activeShape, setActiveShape] = useState(searchParams?.shape || 'all');
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSecondary((prev) => !prev);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...products];

    // Shape filter
    if (activeShape && activeShape !== 'all') {
      result = result.filter((p) => {
        const tmpl = resolveTemplate(p);
        return (tmpl?.shape || p?.shape) === activeShape;
      });
    }

    // Category filter (from URL searchParams)
    const cat = searchParams?.category;
    if (cat && cat !== 'all') {
      result = result.filter(
        (p) =>
          p.category?.slug === cat ||
          p.category?.name?.toLowerCase() === cat?.toLowerCase()
      );
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => parseFloat(a.discountPrice || a.basePrice) - parseFloat(b.discountPrice || b.basePrice));
        break;
      case 'price-desc':
        result.sort((a, b) => parseFloat(b.discountPrice || b.basePrice) - parseFloat(a.discountPrice || a.basePrice));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        result.sort((a, b) => {
          const ra = a.reviews?.reduce((s, r) => s + r.rating, 0) / (a.reviews?.length || 1);
          const rb = b.reviews?.reduce((s, r) => s + r.rating, 0) / (b.reviews?.length || 1);
          return rb - ra;
        });
        break;
      case 'trending':
        result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      default: // featured
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [products, activeShape, sort, searchParams?.category]);

  const handleResetFilters = useCallback(() => {
    setActiveShape('all');
    setSort('featured');
  }, []);

  return (
    <div>
      {/* Quick shape pills */}
      <ShapePills active={activeShape} onChange={setActiveShape} />

      {/* Sort / view bar */}
      <SortBar
        total={filtered.length}
        sort={sort}
        onSort={setSort}
        viewMode={viewMode}
        onViewMode={setViewMode}
      />

      {/* Product grid / list */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState onReset={handleResetFilters} />
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} showSecondary={showSecondary} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {filtered.map((product, i) => (
              <ProductListCard key={product.id} product={product} index={i} showSecondary={showSecondary} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

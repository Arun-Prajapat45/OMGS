'use client';

/**
 * ProductShapePreview
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure CSS + SVG renderer that displays a product's shape preview in the card.
 * No canvas required — uses CSS clip-path, inline SVG masks, or border-radius.
 * This keeps the product grid fast (no react-konva on list pages).
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { CLIP_PATHS, SVG_PATHS, SHAPE_META } from './shapeRegistry';

// ── Gradient palette (cycled by product index) ────────────────────────────────
const GRADIENTS = [
  ['#6366f1', '#8b5cf6'],
  ['#06b6d4', '#3b82f6'],
  ['#f97316', '#ef4444'],
  ['#10b981', '#06b6d4'],
  ['#ec4899', '#8b5cf6'],
  ['#f59e0b', '#f97316'],
  ['#8b5cf6', '#ec4899'],
  ['#3b82f6', '#10b981'],
];

// ── Acrylic gloss overlay as inline SVG ───────────────────────────────────────
function GlossOverlay({ width, height }) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="gloss-tl" x1="0%" y1="0%" x2="60%" y2="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="gloss-br" x1="100%" y1="100%" x2="40%" y2="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#gloss-tl)" />
      <rect width={width} height={height} fill="url(#gloss-br)" />
    </svg>
  );
}

// ── Multi-photo collage thumbnail ─────────────────────────────────────────────
function CollagePreview({ template, images, gradient }) {
  const regions = template?.editableRegions || [];
  const { canvas } = template;
  const scale = 1 / Math.max(canvas.width, canvas.height) * 100; // % of 100px

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        width: '100%',
        paddingBottom: `${(canvas.height / canvas.width) * 100}%`,
        background: canvas.backgroundColor || '#111118',
      }}
    >
      <div className="absolute inset-0">
        {regions.map((region, i) => {
          const regionImg = images?.[i];
          const left   = (region.x / canvas.width) * 100;
          const top    = (region.y / canvas.height) * 100;
          const width  = ((region.width || region.radius * 2) / canvas.width) * 100;
          const height = ((region.height || region.radius * 2) / canvas.height) * 100;

          return (
            <div
              key={region.id}
              className="absolute overflow-hidden"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                borderRadius: region.cornerRadius ? `${region.cornerRadius / canvas.width * 100}%` : undefined,
                clipPath: getRegionClip(region),
                transform: region.rotation ? `rotate(${region.rotation}deg)` : undefined,
                background: regionImg
                  ? undefined
                  : `linear-gradient(135deg, ${gradient[0]}22, ${gradient[1]}44)`,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {regionImg ? (
                <img src={regionImg} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/20 text-[8px]">{region.placeholder}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getRegionClip(region) {
  if (region.type === 'circle')  return 'circle(50%)';
  if (region.type === 'hexagon') return CLIP_PATHS.hexagon;
  if (region.type === 'triangle') return CLIP_PATHS.triangle;
  if (region.type === 'oval') return CLIP_PATHS.oval;
  if (region.type === 'star') return CLIP_PATHS.star;
  if (region.type === 'diamond') return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
  return undefined;
}

// ── Single-photo shape preview ────────────────────────────────────────────────
function SingleShapePreview({ shape, image, gradient, hasGloss, overlays = [] }) {
  const clipPath = CLIP_PATHS[shape] || 'none';
  const svgPath  = SVG_PATHS[shape];
  const isCircular = ['circle', 'oval', 'egg', 'hexagon', 'triangle', 'star', 'heart', 'cloud'].includes(shape);

  const isClockProduct = overlays.some(o => o.type === 'clock-hands');

  if (svgPath) {
    // SVG mask approach for heart/wave/cloud — fills container exactly like clip-path shapes
    return (
      <div
        className="relative"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.6))',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id={`svg-clip-${shape}`} clipPathUnits="userSpaceOnUse">
              <path d={svgPath} />
            </clipPath>
            <linearGradient id={`grad-${shape}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
            {hasGloss && (
              <linearGradient id="glossSvg" x1="0%" y1="0%" x2="50%" y2="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            )}
          </defs>
          {image ? (
            <image
              href={image}
              x="0" y="0" width="100" height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#svg-clip-${shape})`}
            />
          ) : (
            <path d={svgPath} fill={`url(#grad-${shape})`} />
          )}
          {hasGloss && (
            <path d={svgPath} fill="url(#glossSvg)" clipPath={`url(#svg-clip-${shape})`} />
          )}
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden acrylic-shine"
      style={{
        width: '100%',
        height: '100%',
        clipPath: clipPath !== 'none' ? clipPath : undefined,
        borderRadius:
          !isCircular && shape !== 'triangle'
            ? shape === 'square' || shape === 'rectangle'
              ? '12px'
              : '10px'
            : undefined,
        background: image
          ? undefined
          : `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      {image && (
        <img src={image} alt="Product preview" className="w-full h-full object-cover" />
      )}

      {/* Clock overlay */}
      {isClockProduct && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ClockHandsSVG />
        </div>
      )}

      {/* Acrylic gloss */}
      {hasGloss && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}

// ── Clock hands SVG ───────────────────────────────────────────────────────────
function ClockHandsSVG() {
  const now = new Date();
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hourDeg   = h * 30 + m * 0.5;
  const minuteDeg = m * 6;
  const secondDeg = s * 6;

  return (
    <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-80">
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 50 + 44 * Math.sin(angle);
        const y1 = 50 - 44 * Math.cos(angle);
        const x2 = 50 + 40 * Math.sin(angle);
        const y2 = 50 - 40 * Math.cos(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />;
      })}
      {/* Hour hand */}
      <line
        x1="50" y1="50"
        x2={50 + 25 * Math.sin((hourDeg * Math.PI) / 180)}
        y2={50 - 25 * Math.cos((hourDeg * Math.PI) / 180)}
        stroke="white" strokeWidth="3" strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1="50" y1="50"
        x2={50 + 35 * Math.sin((minuteDeg * Math.PI) / 180)}
        y2={50 - 35 * Math.cos((minuteDeg * Math.PI) / 180)}
        stroke="white" strokeWidth="2" strokeLinecap="round"
      />
      {/* Second hand */}
      <line
        x1="50" y1="50"
        x2={50 + 38 * Math.sin((secondDeg * Math.PI) / 180)}
        y2={50 - 38 * Math.cos((secondDeg * Math.PI) / 180)}
        stroke="#ef4444" strokeWidth="1" strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="2.5" fill="white" />
    </svg>
  );
}

// ── Product type badge ────────────────────────────────────────────────────────
const TYPE_BADGES = {
  'acrylic-wall-photo': { label: 'Acrylic Print', color: '#6366f1' },
  'acrylic-clock':      { label: 'Wall Clock',    color: '#f97316' },
  'hexagon-clock':      { label: 'Hex Clock',     color: '#06b6d4' },
  'hexagon-collage':    { label: 'Hex Collage',   color: '#06b6d4' },
  'triangle-clock':     { label: 'Triangle',      color: '#10b981' },
  'circle-acrylic':     { label: 'Circle Art',    color: '#8b5cf6' },
  'collage-frame':      { label: 'Collage',        color: '#f59e0b' },
  'couple-gift':        { label: 'Couple Gift',   color: '#ec4899' },
  'baby-frame':         { label: 'Baby Frame',    color: '#f97316' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main export: ProductShapePreview
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductShapePreview({
  template,      // template JSON object
  product,       // product DB object
  images,        // array of preview image URLs
  index = 0,
  compact = false,
}) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const shape = template?.shape || product?.shape || 'rectangle';
  const isCollage = (template?.editableRegions?.length || 0) > 1;
  const hasGloss  = template?.overlays?.some(o => o.type === 'gloss');
  const meta = SHAPE_META[shape] || SHAPE_META.rectangle;
  const productType = template?.productType || product?.productType || '';
  const badge = TYPE_BADGES[productType];

  const previewImages = useMemo(() => {
    const imgs = product?.images ? (Array.isArray(product.images) ? product.images : JSON.parse(product.images)) : [];
    return imgs;
  }, [product?.images]);

  const firstImage = previewImages?.[0] || null;

  // Determine container height based on aspect ratio
  const containerStyle = compact
    ? { height: '140px' }
    : { paddingBottom: `${(1 / meta.aspectRatio) * 100}%`, position: 'relative' };

  return (
    <div className="w-full relative" style={compact ? { height: '140px' } : {}}>
      {/* Outer container with aspect-ratio padding trick */}
      <div style={containerStyle}>
        <div
          className={compact ? 'absolute inset-0 flex items-center justify-center p-3' : 'absolute inset-0 flex items-center justify-center p-4'}
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          {isCollage ? (
            <div className="w-full" style={{ maxHeight: compact ? '120px' : '200px' }}>
              <CollagePreview
                template={template}
                images={previewImages}
                gradient={gradient}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                width: compact ? '120px' : '150px',
                height: compact ? '120px' : '150px',
              }}
            >
              <SingleShapePreview
                shape={shape}
                image={firstImage}
                gradient={gradient}
                hasGloss={hasGloss}
                overlays={template?.overlays || []}
              />
            </div>
          )}
        </div>
      </div>

      {/* Product type badge */}
      {badge && (
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-white text-[10px] font-semibold tracking-wide"
          style={{ background: badge.color + 'dd' }}
        >
          {badge.label}
        </div>
      )}
    </div>
  );
}

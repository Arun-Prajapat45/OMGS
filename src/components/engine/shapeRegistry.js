/**
 * Shape Registry — Single source of truth for all product shapes.
 * Each shape exposes:
 *   - clipPath (CSS clip-path string)
 *   - svgPath  (SVG <path d="…"> for complex shapes)
 *   - getClipFunc (Konva canvas clip function)
 *   - aspectRatio (w/h ratio hint for card preview sizing)
 */

// ─── CSS clip-path strings ───────────────────────────────────────────────────
export const CLIP_PATHS = {
  rectangle: 'none',
  square:    'none',
  portrait:  'none',
  landscape: 'none',
  circle:    'circle(50% at 50% 50%)',
  oval:      'ellipse(50% 40% at 50% 50%)',
  egg:       'ellipse(46% 50% at 50% 54%)',
  hexagon:   'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
  triangle:  'polygon(50% 0%, 100% 100%, 0% 100%)',
  star:      'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
  heart:     null, // SVG-only
  wave:      null, // SVG-only
  cloud:     null, // SVG-only
  custom:    null, // uses svgPath from template
  'rounded-rectangle': null, // handled via borderRadius
};

// ─── SVG paths (viewBox 0 0 100 100) ─────────────────────────────────────────
// Each path is optimized to fill the viewBox and center properly
export const SVG_PATHS = {
  heart: 'M50 88 C15 65 5 45 5 32 C5 18 15 8 28 8 C38 8 46 14 50 22 C54 14 62 8 72 8 C85 8 95 18 95 32 C95 45 85 65 50 88Z',
  egg:   'M50 8 C78 8 92 28 92 52 C92 78 73 92 50 92 C27 92 8 78 8 52 C8 28 22 8 50 8Z',
  cloud: 'M20 50 C10 50 4 44 4 35 C4 26 10 19 20 19 C22 14 28 10 36 10 C46 10 54 16 56 25 C57 25 59 25 60 25 C70 25 78 33 78 43 C78 52 71 59 60 59 H20Z',
  wave:  'M0 50 Q15 20 30 50 Q45 80 60 50 Q75 20 90 50 Q95 65 100 50 L100 100 L0 100Z',
  blob:  'M50 5 C75 8 95 28 90 55 C85 80 68 95 45 95 C20 95 5 75 8 50 C11 28 28 2 50 5Z',
};

// ─── Konva canvas clip functions ──────────────────────────────────────────────
export function getKonvaClipFunc(shape, region) {
  const { width = 200, height = 200, radius = 100, cornerRadius = 0, points } = region;

  return (ctx) => {
    ctx.beginPath();

    switch (shape) {
      case 'circle':
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        break;

      case 'oval':
        ctx.ellipse(width / 2, height / 2, width / 2, height * 0.4, 0, 0, Math.PI * 2);
        break;

      case 'egg':
        ctx.ellipse(width / 2, height * 0.54, width * 0.46, height * 0.5, 0, 0, Math.PI * 2);
        break;

      case 'hexagon': {
        const r = radius;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = r + r * Math.cos(angle);
          const y = r + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        break;
      }

      case 'triangle':
        if (points) {
          points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        } else {
          ctx.moveTo(width / 2, 0);
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
        }
        break;

      case 'star': {
        const cx = width / 2, cy = height / 2;
        const outerR = Math.min(width, height) / 2;
        const innerR = outerR * 0.4;
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const r2 = i % 2 === 0 ? outerR : innerR;
          const x = cx + r2 * Math.cos(angle);
          const y = cy + r2 * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        break;
      }

      case 'heart': {
        const cx = width / 2, cy = height / 2;
        const s = Math.min(width, height) / 2;
        ctx.moveTo(cx, cy + s * 0.35);
        ctx.bezierCurveTo(cx - s * 1.1, cy - s * 0.4, cx - s * 1.8, cy + s * 0.4, cx, cy + s);
        ctx.bezierCurveTo(cx + s * 1.8, cy + s * 0.4, cx + s * 1.1, cy - s * 0.4, cx, cy + s * 0.35);
        break;
      }

      case 'cloud': {
        const w = width;
        const h = height;
        ctx.moveTo(w * 0.18, h * 0.55);
        ctx.bezierCurveTo(w * 0.05, h * 0.55, w * 0.05, h * 0.35, w * 0.18, h * 0.35);
        ctx.bezierCurveTo(w * 0.18, h * 0.2, w * 0.35, h * 0.1, w * 0.5, h * 0.15);
        ctx.bezierCurveTo(w * 0.6, h * 0.05, w * 0.75, h * 0.1, w * 0.8, h * 0.2);
        ctx.bezierCurveTo(w * 0.95, h * 0.2, w * 0.95, h * 0.35, w * 0.8, h * 0.35);
        ctx.bezierCurveTo(w * 0.95, h * 0.35, w * 0.95, h * 0.55, w * 0.8, h * 0.55);
        ctx.lineTo(w * 0.18, h * 0.55);
        break;
      }

      default: {
        // Rounded rectangle
        const r = cornerRadius || 0;
        ctx.moveTo(r, 0);
        ctx.lineTo(width - r, 0);
        ctx.quadraticCurveTo(width, 0, width, r);
        ctx.lineTo(width, height - r);
        ctx.quadraticCurveTo(width, height, width - r, height);
        ctx.lineTo(r, height);
        ctx.quadraticCurveTo(0, height, 0, height - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        break;
      }
    }
    ctx.closePath();
  };
}

// ─── Shape metadata ───────────────────────────────────────────────────────────
export const SHAPE_META = {
  rectangle: { label: 'Rectangle', aspectRatio: 1.33 },
  square:    { label: 'Square',    aspectRatio: 1 },
  portrait:  { label: 'Portrait',  aspectRatio: 0.75 },
  landscape: { label: 'Landscape', aspectRatio: 1.4 },
  circle:    { label: 'Circle',    aspectRatio: 1 },
  oval:      { label: 'Oval',      aspectRatio: 0.8 },
  egg:       { label: 'Egg',       aspectRatio: 0.9 },
  hexagon:   { label: 'Hexagon',   aspectRatio: 1 },
  triangle:  { label: 'Triangle',  aspectRatio: 1.1 },
  star:      { label: 'Star',      aspectRatio: 1 },
  heart:     { label: 'Heart',     aspectRatio: 1 },
  cloud:     { label: 'Cloud',     aspectRatio: 1.2 },
  wave:      { label: 'Wave',      aspectRatio: 2 },
  custom:    { label: 'Custom',    aspectRatio: 1 },
};

export default { CLIP_PATHS, SVG_PATHS, getKonvaClipFunc, SHAPE_META };

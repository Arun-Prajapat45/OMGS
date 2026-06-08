'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Group, Rect, Image, Text, Circle, RegularPolygon, Shape, Transformer, Path } from 'react-konva';
import useImage from 'use-image';

// ─── Clip functions for all mask shapes ────────────────────────────────────────
function buildClipFunc(mask, width, height) {
  const type = mask?.type || 'rectangle';
  return (ctx) => {
    ctx.beginPath();
    switch (type) {
      case 'circle': {
        const r = Math.min(width, height) / 2;
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
        break;
      }
      case 'oval':
        ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
        break;
      case 'hexagon': {
        const r = Math.min(width, height) / 2;
        const cx = width / 2, cy = height / 2;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        break;
      }
      case 'triangle':
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        break;
      case 'rounded_rectangle': {
        const r = Math.min(width, height) * 0.1;
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
      case 'diamond': {
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width, height / 2);
        ctx.lineTo(width / 2, height);
        ctx.lineTo(0, height / 2);
        break;
      }
      case 'star': {
        const cx = width / 2, cy = height / 2;
        const outerR = Math.min(width, height) / 2;
        const innerR = outerR * 0.4;
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        break;
      }
      case 'heart': {
  const w = width;
  const h = height;

  ctx.moveTo(w / 2, h * 0.95);

  // Bottom-left outer curve
  ctx.bezierCurveTo(
    w * 0.10, h * 0.75,
    w * 0.00, h * 0.45,
    w * 0.1, h * 0.22
  );

  // Upper-left lobe (more rounded)
  ctx.bezierCurveTo(
    w * 0.25, h * 0.02,
    w * 0.46, h * 0.02,
    w / 2, h * 0.20
  );

  // Upper-right lobe (more rounded)
  ctx.bezierCurveTo(
    w * 0.54, h * 0.02,
    w * 0.75, h * 0.02,
    w * 0.90, h * 0.2
  );

  // Bottom-right outer curve
  ctx.bezierCurveTo(
    w * 1.00, h * 0.45,
    w * 0.90, h * 0.75,
    w / 2, h * 0.95
  );

  ctx.closePath();
  break;
}
      case 'egg':
        // Offset ellipse — taller top half, shorter bottom
        ctx.ellipse(width / 2, height * 0.54, width * 0.46, height * 0.5, 0, 0, Math.PI * 2);
        break;
      case 'cloud': {
        const w = width, h = height;
        ctx.moveTo(w * 0.18, h * 0.55);
        ctx.bezierCurveTo(w * 0.05, h * 0.55, w * 0.05, h * 0.35, w * 0.18, h * 0.35);
        ctx.bezierCurveTo(w * 0.18, h * 0.2,  w * 0.35, h * 0.1,  w * 0.5,  h * 0.15);
        ctx.bezierCurveTo(w * 0.6,  h * 0.05, w * 0.75, h * 0.1,  w * 0.8,  h * 0.2);
        ctx.bezierCurveTo(w * 0.95, h * 0.2,  w * 0.95, h * 0.35, w * 0.8,  h * 0.35);
        ctx.bezierCurveTo(w * 0.95, h * 0.35, w * 0.95, h * 0.55, w * 0.8,  h * 0.55);
        ctx.lineTo(w * 0.18, h * 0.55);
        break;
      }
      case 'svg': {
        // SVG paths are handled via Path components with destination-in
        // rather than clipFunc, so just draw a rect fallback here
        ctx.rect(0, 0, width, height);
        break;
      }
      default:
        ctx.rect(0, 0, width, height);
    }
    ctx.closePath();
  };
}

// Compute cover-fit scale and position for an image inside a region
function coverFit(imgW, imgH, regionW, regionH, cropX = 0, cropY = 0, cropScale = 1) {
  const scale = Math.max(regionW / imgW, regionH / imgH) * cropScale;
  const scaledW = imgW * scale;
  const scaledH = imgH * scale;
  const x = (regionW - scaledW) / 2 + cropX;
  const y = (regionH - scaledH) / 2 + cropY;
  return { x, y, width: scaledW, height: scaledH };
}

function BackgroundElement({ element, onClick, offsetX = 0, offsetY = 0 }) {
  const [bgImage] = useImage(element.src || '', 'anonymous');
  return (
    <Group x={offsetX} y={offsetY} onClick={onClick} onTap={onClick}>
      <Rect
        x={0} y={0}
        width={element.width}
        height={element.height}
        fill={element.backgroundColor || '#ffffff'}
        stroke={element.stroke || undefined}
        strokeWidth={element.strokeWidth || 0}
        cornerRadius={element.cornerRadius || 0}
      />
      {bgImage && (
        <Group
          clipFunc={(ctx) => {
            const r = element.cornerRadius || 0;
            const w = element.width;
            const h = element.height;
            ctx.beginPath();
            if (r > 0) {
              ctx.moveTo(r, 0);
              ctx.lineTo(w - r, 0);
              ctx.quadraticCurveTo(w, 0, w, r);
              ctx.lineTo(w, h - r);
              ctx.quadraticCurveTo(w, h, w - r, h);
              ctx.lineTo(r, h);
              ctx.quadraticCurveTo(0, h, 0, h - r);
              ctx.lineTo(0, r);
              ctx.quadraticCurveTo(0, 0, r, 0);
            } else {
              ctx.rect(0, 0, w, h);
            }
            ctx.closePath();
          }}
        >
          <Image
            image={bgImage}
            x={0} y={0}
            width={element.width}
            height={element.height}
          />
        </Group>
      )}
    </Group>
  );
}

// ─── Photo effects helpers ──────────────────────────────────────────────────────

/**
 * Build a CSS filter string from photoEffects color params.
 * Used on an offscreen <canvas> or <img> element via ctx.filter.
 */
function buildCssFilter(fx = {}) {
  const parts = [];
  if (fx.brightness) parts.push(`brightness(${1 + fx.brightness / 100})`);
  if (fx.contrast)   parts.push(`contrast(${1 + fx.contrast / 100})`);
  if (fx.saturation) parts.push(`saturate(${1 + fx.saturation / 100})`);
  if (fx.hue)        parts.push(`hue-rotate(${fx.hue}deg)`);
  return parts.length ? parts.join(' ') : 'none';
}

/**
 * Deterministic pseudo-random from a seed string.
 * Returns a seeded PRNG that gives consistent positions every render.
 */
function seededRng(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function () {
    h = Math.imul(2246822519, h) ^ Math.imul(3266489917, h >> 16);
    return ((h >>> 0) / 4294967296);
  };
}

/** Draw a 4-point star sparkle at (cx,cy) with given radius */
function drawSparkle(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    const radius = i % 2 === 0 ? r : r * 0.3;
    const x = cx + radius * Math.cos(angle - Math.PI / 2);
    const y = cy + radius * Math.sin(angle - Math.PI / 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// ─── Image Placeholder Element ─────────────────────────────────────────────────
function ImagePlaceholderElement({ element, userImage, placeholderImage, isSelected, isAdminMode, onClick, offsetX = 0, offsetY = 0 }) {
  const crop = element.crop || { cropX: 0, cropY: 0, cropScale: 1 };
  const fx = element.photoEffects || {};
  const imageRotation = crop.imageRotation || 0; // User-applied rotation in degrees

  // Load admin preview image if provided (builder only)
  const [adminPreviewImg] = useImage(element.adminPreviewImageUrl || '', 'anonymous');
  // Use user image, admin preview, or upload placeholder
  const activeImage = userImage || (isAdminMode ? adminPreviewImg : (placeholderImage || null));
  const isPlaceholder = !userImage && !isAdminMode && !!placeholderImage;

  const imgProps = activeImage
    ? coverFit(activeImage.width, activeImage.height, element.width, element.height, isPlaceholder ? 0 : crop.cropX, isPlaceholder ? 0 : crop.cropY, isPlaceholder ? 0.85 : crop.cropScale)
    : null;

  const softEdge = element.mask?.softEdge ?? 0;
  const useGroupClip = softEdge === 0 || isPlaceholder;

  // If there are no effects at all, render with fast direct path
  // (placeholder images never go through the effects pipeline)
  const hasEffects = !isPlaceholder && (
    softEdge > 0 ||
    fx.featherType && fx.featherType !== 'none' ||
    fx.brightness || fx.contrast || fx.saturation || fx.hue || fx.warmth ||
    (fx.photoBlendMode && fx.photoBlendMode !== 'source-over') ||
    fx.sparkleEnabled || fx.glassEnabled
  );

  return (
    <Group
      x={offsetX}
      y={offsetY}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      clipFunc={useGroupClip ? buildClipFunc(element.mask, element.width, element.height) : undefined}
      onClick={onClick}
      onTap={onClick}
    >
      {!!element.backgroundColor && (
        <Rect
          x={0}
          y={0}
          width={element.width}
          height={element.height}
          fill={element.backgroundColor}
          listening={false}
        />
      )}

      {/* Placeholder shape OR selection outline */}
      {(!activeImage || isSelected || isAdminMode) && (
        <Shape
          sceneFunc={(ctx, shape) => {
            buildClipFunc(element.mask, element.width, element.height)(ctx);
            if (!activeImage) {
              ctx.fillStyle = isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)';
              ctx.fill();
            }
            if (isSelected || (!activeImage && isAdminMode)) {
              ctx.strokeStyle = isSelected ? '#6366f1' : 'rgba(99,102,241,0.5)';
              ctx.lineWidth = isAdminMode ? 2 : 1.5;
              if (!activeImage) ctx.setLineDash([10, 6]);
              ctx.stroke();
            }
          }}
          listening={false}
        />
      )}

      {/* ── Image with effects pipeline ── */}
      {activeImage && imgProps && hasEffects && (
        <Shape
          sceneFunc={(ctx, shape) => {
            const w = element.width;
            const h = element.height;

            ctx.save();
            buildClipFunc(element.mask, w, h)(ctx);
            ctx.clip();

            // ── OFFSCREEN 1: draw image with CSS color filters ──
            const off1 = document.createElement('canvas');
            off1.width  = w;
            off1.height = h;
            const c1 = off1.getContext('2d');

            if (element.backgroundColor) {
              c1.fillStyle = element.backgroundColor;
              c1.fillRect(0, 0, w, h);
            }

            // Apply CSS color filters (brightness/contrast/saturation/hue)
            const cssFilter = buildCssFilter(fx);
            if (cssFilter !== 'none') c1.filter = cssFilter;

            // Opacity for the photo
            c1.globalAlpha = fx.photoBlendOpacity ?? 1;
            // Apply image rotation around the slot center
            if (imageRotation !== 0) {
              c1.save();
              c1.translate(w / 2, h / 2);
              c1.rotate((imageRotation * Math.PI) / 180);
              c1.translate(-w / 2, -h / 2);
              c1.drawImage(activeImage, imgProps.x, imgProps.y, imgProps.width, imgProps.height);
              c1.restore();
            } else {
              c1.drawImage(activeImage, imgProps.x, imgProps.y, imgProps.width, imgProps.height);
            }
            c1.filter = 'none';
            c1.globalAlpha = 1;

            // ── Warmth overlay ──
            if (fx.warmth && fx.warmth !== 0) {
              const warmth = fx.warmth / 100; // -1 to 1
              if (warmth > 0) {
                // Warm: orange tint
                c1.globalCompositeOperation = 'multiply';
                c1.fillStyle = `rgba(255,${Math.round(180 - warmth * 80)},${Math.round(80 - warmth * 80)},${warmth * 0.4})`;
              } else {
                // Cool: blue tint
                const cool = -warmth;
                c1.globalCompositeOperation = 'multiply';
                c1.fillStyle = `rgba(${Math.round(80 - cool * 50)},${Math.round(160 + cool * 30)},255,${cool * 0.35})`;
              }
              c1.fillRect(0, 0, w, h);
              c1.globalCompositeOperation = 'source-over';
            }

            // ── OFFSCREEN 2: apply feathering (destination-out mask) ──
            const featherType   = fx.featherType || 'none';
            const featherRadius = (fx.featherRadius ?? 0) / 100; // 0–1
            const edgeBlur      = fx.edgeBlur ?? 0;

            if (featherType !== 'none' && featherRadius > 0) {
              c1.globalCompositeOperation = 'destination-out';

              if (featherType === 'radial') {
                // Radial fade: opaque center, transparent edges
                const innerR = Math.min(w, h) * 0.5 * (1 - featherRadius);
                const outerR = Math.max(w, h) * 0.75;
                const grad = c1.createRadialGradient(w / 2, h / 2, innerR, w / 2, h / 2, outerR);
                grad.addColorStop(0,   'rgba(0,0,0,0)');
                grad.addColorStop(0.6, `rgba(0,0,0,${featherRadius * 0.5})`);
                grad.addColorStop(1,   'rgba(0,0,0,1)');
                c1.fillStyle = grad;
                c1.fillRect(0, 0, w, h);

              } else if (featherType === 'vignette') {
                // Dark vignette corners
                const gr = c1.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
                gr.addColorStop(0,   'rgba(0,0,0,0)');
                gr.addColorStop(1 - featherRadius * 0.7, 'rgba(0,0,0,0)');
                gr.addColorStop(1,   `rgba(0,0,0,${featherRadius})`);
                c1.fillStyle = gr;
                c1.fillRect(0, 0, w, h);

              } else if (featherType === 'linear-top') {
                const grad = c1.createLinearGradient(0, 0, 0, h * featherRadius * 1.2);
                grad.addColorStop(0, 'rgba(0,0,0,1)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                c1.fillStyle = grad;
                c1.fillRect(0, 0, w, h);

              } else if (featherType === 'linear-bottom') {
                const startY = h * (1 - featherRadius * 1.2);
                const grad = c1.createLinearGradient(0, startY, 0, h);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,1)');
                c1.fillStyle = grad;
                c1.fillRect(0, 0, w, h);

              } else if (featherType === 'linear-left') {
                const grad = c1.createLinearGradient(0, 0, w * featherRadius * 1.2, 0);
                grad.addColorStop(0, 'rgba(0,0,0,1)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                c1.fillStyle = grad;
                c1.fillRect(0, 0, w, h);

              } else if (featherType === 'linear-right') {
                const startX = w * (1 - featherRadius * 1.2);
                const grad = c1.createLinearGradient(startX, 0, w, 0);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,1)');
                c1.fillStyle = grad;
                c1.fillRect(0, 0, w, h);
              }

              c1.globalCompositeOperation = 'source-over';
            }

            // ── Apply edge blur (filter on offscreen) ──
            // We draw off1 → off2 with blur applied
            let finalCanvas = off1;
            if (edgeBlur > 0) {
              const off2 = document.createElement('canvas');
              off2.width  = w;
              off2.height = h;
              const c2 = off2.getContext('2d');
              c2.filter = `blur(${edgeBlur}px)`;
              c2.drawImage(off1, 0, 0);
              c2.filter = 'none';
              finalCanvas = off2;
            }

            // ── OFFSCREEN 3: Apply Soft Edge Mask ──
            if (softEdge > 0) {
              const maskCanvas = document.createElement('canvas');
              maskCanvas.width = w;
              maskCanvas.height = h;
              const mCtx = maskCanvas.getContext('2d');
              
              mCtx.filter = `blur(${softEdge}px)`;
              mCtx.fillStyle = 'black';
              buildClipFunc(element.mask, w, h)(mCtx);
              mCtx.fill();
              
              const fcCtx = finalCanvas.getContext('2d');
              fcCtx.globalCompositeOperation = 'destination-in';
              fcCtx.drawImage(maskCanvas, 0, 0);
              fcCtx.globalCompositeOperation = 'source-over';
            }

            // ── Composite final image canvas to main ctx ──
            if (fx.photoBlendMode && fx.photoBlendMode !== 'source-over') {
              ctx.globalCompositeOperation = fx.photoBlendMode;
            }
            ctx.drawImage(finalCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';

            // ── SPARKLE EFFECT ──
            if (fx.sparkleEnabled && fx.sparkleCount > 0) {
              const rng = seededRng(element.id + 'sparkle');
              const count     = fx.sparkleCount ?? 8;
              const size      = fx.sparkleSize ?? 14;
              const opacity   = fx.sparkleOpacity ?? 0.9;
              const color     = fx.sparkleColor || '#ffffff';
              const glowHalo  = fx.sparkleGlow !== false;

              for (let i = 0; i < count; i++) {
                const sx = rng() * w;
                const sy = rng() * h;
                const sr = size * (0.5 + rng() * 0.7);

                ctx.save();
                ctx.globalAlpha = opacity * (0.6 + rng() * 0.4);

                // Glow halo (soft blur ring)
                if (glowHalo) {
                  const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 2.5);
                  grad.addColorStop(0,   color + 'ff');
                  grad.addColorStop(0.4, color + '88');
                  grad.addColorStop(1,   color + '00');
                  ctx.fillStyle = grad;
                  ctx.beginPath();
                  ctx.arc(sx, sy, sr * 2.5, 0, Math.PI * 2);
                  ctx.fill();
                }

                // Star shape
                ctx.fillStyle = color;
                drawSparkle(ctx, sx, sy, sr);
                ctx.fill();

                // Bright center dot
                ctx.beginPath();
                ctx.arc(sx, sy, sr * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                ctx.restore();
              }
            }

            // ── GLASS REFLECTION ──
            if (fx.glassEnabled) {
              const glassOpacity = fx.glassOpacity ?? 0.28;
              const angleDeg     = fx.glassAngle ?? 135;
              const shineWidth   = fx.glassWidth ?? 0.3;
              const glassColor   = fx.glassColor || '#ffffff';
              const angleRad     = (angleDeg * Math.PI) / 180;

              // Compute gradient start/end points across the diagonal
              const cx = w / 2, cy = h / 2;
              const dist = Math.max(w, h);
              const gx1  = cx - Math.cos(angleRad) * dist;
              const gy1  = cy - Math.sin(angleRad) * dist;
              const gx2  = cx + Math.cos(angleRad) * dist;
              const gy2  = cy + Math.sin(angleRad) * dist;

              const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
              const half = shineWidth / 2;
              const mid  = 0.5;

              grad.addColorStop(0,              glassColor + '00');
              grad.addColorStop(mid - half * 1.2, glassColor + '00');
              grad.addColorStop(mid - half,       glassColor + Math.round(glassOpacity * 120).toString(16).padStart(2, '0'));
              grad.addColorStop(mid,              glassColor + Math.round(glassOpacity * 255).toString(16).padStart(2, '0'));
              grad.addColorStop(mid + half * 0.4, glassColor + Math.round(glassOpacity * 80).toString(16).padStart(2, '0'));
              grad.addColorStop(mid + half,       glassColor + '00');
              grad.addColorStop(1,                glassColor + '00');

              ctx.save();
              ctx.globalCompositeOperation = 'screen';
              ctx.globalAlpha = 1;
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, w, h);
              ctx.restore();
            }

            ctx.restore();
            ctx.fillStrokeShape(shape);
          }}
          width={element.width}
          height={element.height}
          listening={false}
        />
      )}

      {/* ── Fast path: image with no effects (includes placeholder) ── */}
      {activeImage && imgProps && !hasEffects && (
        imageRotation !== 0 ? (
          <Group
            x={element.width / 2}
            y={element.height / 2}
            rotation={imageRotation}
            offsetX={element.width / 2}
            offsetY={element.height / 2}
          >
            <Image
              image={activeImage}
              x={imgProps.x}
              y={imgProps.y}
              width={imgProps.width}
              height={imgProps.height}
              opacity={isPlaceholder ? 0.55 : 1}
            />
          </Group>
        ) : (
          <Image
            image={activeImage}
            x={imgProps.x}
            y={imgProps.y}
            width={imgProps.width}
            height={imgProps.height}
            opacity={isPlaceholder ? 0.55 : 1}
          />
        )
      )}

      {/* Placeholder label (admin mode — no image) */}
      {isAdminMode && !activeImage && (
        <Text
          x={element.width / 2 - 60}
          y={element.height / 2 - 24}
          width={120}
          text={`Photo Slot ${element.uploadSlot || 1}`}
          fontSize={13}
          fill="rgba(99,102,241,0.8)"
          align="center"
        />
      )}
      {/* Tap-to-upload hint (only when no placeholder image) */}
      {!isAdminMode && !userImage && !placeholderImage && (
        <Text
          x={element.width / 2 - 60}
          y={element.height / 2 - 10}
          width={120}
          text="Click to upload"
          fontSize={12}
          fill="rgba(255,255,255,0.45)"
          align="center"
        />
      )}
    </Group>
  );
}

// ─── Overlay / Sticker / Frame / Texture / Shadow ─────────────────────────────
function ImageElement({ element, onClick, offsetX = 0, offsetY = 0, isAdminMode = false }) {
  const [img] = useImage(element.src || '', 'anonymous');

  // Overlays, frames, textures, shadows should NOT intercept clicks in user editor
  // Only stickers are user-interactive
  const isPassThrough = !isAdminMode && ['overlay', 'frame', 'texture', 'shadow'].includes(element.type);

  if (!element.src && !img) {
    // Admin placeholder for empty overlay/sticker
    return (
      <Group x={offsetX} y={offsetY} rotation={element.rotation || 0} opacity={element.opacity ?? 1} onClick={onClick} onTap={onClick} listening={isAdminMode}>
        <Rect
          x={0} y={0}
          width={element.width}
          height={element.height}
          fill="rgba(255,100,0,0.1)"
          stroke="rgba(255,100,0,0.5)"
          strokeWidth={1.5}
          dash={[8, 4]}
          strokeScaleEnabled={false}
          listening={false}
        />
        <Text
          x={element.width / 2 - 50}
          y={element.height / 2 - 10}
          width={100}
          text={element.name || element.type}
          fontSize={11}
          fill="rgba(255,150,50,0.8)"
          align="center"
          listening={false}
        />
      </Group>
    );
  }

  // Center-transparent overlay: use centerOpacity to punch a radial hole
  // centerOpacity = 0 means fully transparent center, 1 = no hole (normal)
  const hasCenterHole = element.type === 'overlay' && typeof element.centerOpacity === 'number' && element.centerOpacity < 1;

  return (
    <Group
      x={offsetX}
      y={offsetY}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      globalCompositeOperation={element.blendMode !== 'source-over' ? element.blendMode : undefined}
      onClick={isPassThrough ? undefined : onClick}
      onTap={isPassThrough ? undefined : onClick}
      listening={!isPassThrough}
    >
      {img && !hasCenterHole && (
        <Image
          image={img}
          x={0} y={0}
          width={element.width}
          height={element.height}
          listening={false}
        />
      )}
      {/* Center-transparent overlay: punch hole on offscreen canvas so it doesn't clear the main canvas */}
      {img && hasCenterHole && (
        <Shape
          sceneFunc={(ctx, shape) => {
            const w = element.width;
            const h = element.height;
            const cx = w / 2;
            const cy = h / 2;

            // 1) Create offscreen canvas
            const offscreen = document.createElement('canvas');
            offscreen.width = w;
            offscreen.height = h;
            const octx = offscreen.getContext('2d');

            // 2) Draw the overlay image on offscreen
            octx.drawImage(img, 0, 0, w, h);

            // 3) Punch out the hole on offscreen
            octx.globalCompositeOperation = 'destination-out';
            const centerOpacity = typeof element.centerOpacity === 'number' ? element.centerOpacity : 1;
            octx.fillStyle = `rgba(0,0,0,${1 - centerOpacity})`;

            const hShape = element.holeShape || 'radial';
            const hScale = element.holeSize || 0.5; // defaults to 50%
            const hw = w * hScale;
            const hh = h * hScale;

            if (hShape === 'radial') {
              const outerR = Math.max(hw, hh);
              const innerR = Math.min(hw, hh) * 0.3;
              const grad = octx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
              grad.addColorStop(0, `rgba(0,0,0,${1 - centerOpacity})`);
              grad.addColorStop(1, 'rgba(0,0,0,0)');
              octx.fillStyle = grad;
              octx.fillRect(0, 0, w, h);
            } else {
              octx.beginPath();
              if (hShape === 'circle') {
                octx.arc(cx, cy, Math.min(hw, hh) / 2, 0, Math.PI * 2);
              } else if (hShape === 'oval') {
                octx.ellipse(cx, cy, hw / 2, hh / 2, 0, 0, Math.PI * 2);
              } else if (hShape === 'rectangle') {
                octx.rect(cx - hw / 2, cy - hh / 2, hw, hh);
              } else if (hShape === 'rounded_rectangle') {
                const r = Math.min(hw, hh) * 0.1;
                const rx = cx - hw / 2;
                const ry = cy - hh / 2;
                octx.moveTo(rx + r, ry);
                octx.lineTo(rx + hw - r, ry);
                octx.quadraticCurveTo(rx + hw, ry, rx + hw, ry + r);
                octx.lineTo(rx + hw, ry + hh - r);
                octx.quadraticCurveTo(rx + hw, ry + hh, rx + hw - r, ry + hh);
                octx.lineTo(rx + r, ry + hh);
                octx.quadraticCurveTo(rx, ry + hh, rx, ry + hh - r);
                octx.lineTo(rx, ry + r);
                octx.quadraticCurveTo(rx, ry, rx + r, ry);
              } else if (hShape === 'hexagon') {
                const r = Math.min(hw, hh) / 2;
                for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i - Math.PI / 6;
                  const x = cx + r * Math.cos(angle);
                  const y = cy + r * Math.sin(angle);
                  i === 0 ? octx.moveTo(x, y) : octx.lineTo(x, y);
                }
              } else {
                // fallback to rectangle
                octx.rect(cx - hw / 2, cy - hh / 2, hw, hh);
              }
              octx.closePath();
              octx.fill();
            }

            // 4) Draw offscreen onto main context
            ctx.drawImage(offscreen, 0, 0, w, h);
            ctx.fillStrokeShape(shape);
          }}
          width={element.width}
          height={element.height}
          listening={false}
        />
      )}
    </Group>
  );
}


// ─── Text Element ──────────────────────────────────────────────────────────────
function TextElement({ element, onClick, offsetX = 0, offsetY = 0 }) {
  return (
    <Text
      x={offsetX}
      y={offsetY}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      text={element.text || ''}
      fontFamily={element.fontFamily || 'Inter'}
      fontSize={element.fontSize || 48}
      fontStyle={element.fontStyle || 'normal'}
      fill={element.fill || '#ffffff'}
      align={element.align || 'left'}
      letterSpacing={element.letterSpacing || 0}
      onClick={onClick}
      onTap={onClick}
    />
  );
}

// ─── Text-Mask Element ─────────────────────────────────────────────────────────
// Image renders INSIDE the text shape using fillPatternImage
function TextMaskElement({ element, userImage, isAdminMode, onClick, offsetX = 0, offsetY = 0 }) {
  const crop = element.crop || { cropX: 0, cropY: 0, cropScale: 1 };
  
  const imgProps = userImage
    ? coverFit(userImage.width, userImage.height, element.width, element.height, crop.cropX, crop.cropY, crop.cropScale)
    : null;

  return (
    <Group
      x={offsetX}
      y={offsetY}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      onClick={onClick}
      onTap={onClick}
      width={element.width}
      height={element.height}
    >
      <Text
        x={0} y={0}
        width={element.width}
        height={element.height}
        text={element.text || 'M'}
        fontFamily={element.fontFamily || 'Montserrat'}
        fontSize={element.fontSize || 400}
        fontStyle={element.fontStyle || 'normal'}
        letterSpacing={element.letterSpacing || 0}
        
        fill={!userImage ? (element.fill || (isAdminMode ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.1)')) : undefined}
        
        fillPatternImage={userImage || undefined}
        fillPatternX={imgProps ? imgProps.x : 0}
        fillPatternY={imgProps ? imgProps.y : 0}
        fillPatternScaleX={userImage ? imgProps.width / userImage.width : 1}
        fillPatternScaleY={userImage ? imgProps.height / userImage.height : 1}
        fillPatternRepeat="no-repeat"
        
        align="left"
        verticalAlign="top"
        listening={false}
      />
      
      {/* Admin: outline the text for visibility */}
      {isAdminMode && (
        <Text
          x={0} y={0}
          width={element.width}
          height={element.height}
          text={element.text || 'M'}
          fontFamily={element.fontFamily || 'Montserrat'}
          fontSize={element.fontSize || 400}
          fontStyle={element.fontStyle || 'normal'}
          letterSpacing={element.letterSpacing || 0}
          stroke="rgba(99,102,241,0.6)"
          strokeWidth={2}
          align="left"
          verticalAlign="top"
          listening={false}
        />
      )}
    </Group>
  );
}

// ─── Shape Element ─────────────────────────────────────────────────────────────
function ShapeElement({ element, onClick, offsetX = 0, offsetY = 0 }) {
  const st = element.shapeType || 'rectangle';
  const sharedProps = {
    fill: element.fill || 'rgba(99,102,241,0.4)',
    stroke: element.stroke || undefined,
    strokeWidth: element.strokeWidth || 0,
    opacity: element.opacity ?? 1,
    rotation: element.rotation || 0,
    onClick,
    onTap: onClick,
  };

  if (st === 'circle') {
    const r = Math.min(element.width, element.height) / 2;
    return <Circle x={offsetX + r} y={offsetY + r} radius={r} {...sharedProps} />;
  }
  if (st === 'hexagon') {
    const r = Math.min(element.width, element.height) / 2;
    return <RegularPolygon x={offsetX + r} y={offsetY + r} radius={r} sides={6} {...sharedProps} />;
  }
  if (st === 'triangle') {
    const r = Math.min(element.width, element.height) / 2;
    return <RegularPolygon x={offsetX + r} y={offsetY + r} radius={r} sides={3} {...sharedProps} />;
  }
  return (
    <Rect
      x={offsetX} y={offsetY}
      width={element.width}
      height={element.height}
      cornerRadius={element.cornerRadius || 0}
      {...sharedProps}
    />
  );
}

// ─── SVG Mask Element ──────────────────────────────────────────────────────────
function SvgMaskElement({ element, userImage, onClick, offsetX = 0, offsetY = 0 }) {
  const groupRef = useRef(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.clearCache();
      groupRef.current.cache();
      groupRef.current.getLayer()?.batchDraw();
    }
  }, [element.svgPath, element.width, element.height, userImage]);

  return (
    <Group
      ref={groupRef}
      x={offsetX}
      y={offsetY}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      onClick={onClick}
      onTap={onClick}
      width={element.width}
      height={element.height}
    >
      {/* Base: user photo or placeholder */}
      {userImage ? (
        <Image image={userImage} x={0} y={0} width={element.width} height={element.height} />
      ) : (
        <Rect
          x={0} y={0}
          width={element.width}
          height={element.height}
          fill="rgba(99,102,241,0.3)"
        />
      )}
      
      {/* SVG Mask clips the image via destination-in */}
      <Path
        data={element.svgPath || ''}
        fill="white"
        globalCompositeOperation="destination-in"
        listening={false}
      />

      {/* Admin outline */}
      {!userImage && (
        <Path
          data={element.svgPath || ''}
          stroke="rgba(99,102,241,0.6)"
          strokeWidth={2}
          listening={false}
        />
      )}
    </Group>
  );
}

// ─── Selection Rect (admin mode highlight) ─────────────────────────────────────
function SelectionRect({ element, offsetX = 0, offsetY = 0 }) {
  return (
    <Rect
      x={offsetX - 1}
      y={offsetY - 1}
      width={(element.width || 0) + 2}
      height={(element.height || 0) + 2}
      rotation={element.rotation || 0}
      fill="transparent"
      stroke="#6366f1"
      strokeWidth={2}
      dash={[6, 3]}
      strokeScaleEnabled={false}
      listening={false}
    />
  );
}

// ─── Main Element Renderer ─────────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {object} props.element       — element config from templateJson.elements[]
 * @param {object|null} props.userImage — pre-loaded Konva-compatible image object (for image-placeholder / text-mask / svg-mask)
 * @param {boolean} props.isSelected   — whether this element is selected in admin builder
 * @param {boolean} props.isAdminMode  — render admin mode visuals (dashed borders, labels, etc.)
 * @param {function} props.onClick     — called when element is clicked
 * @param {boolean} props.useElementPosition — if true, use element.x/y; if false (builder canvas), use 0/0 (outer Group handles positioning)
 */
export default function ElementRenderer({ element, userImage, placeholderImage, isSelected, isAdminMode = false, onClick, useElementPosition = true }) {
  if (!element.visible) return null;

  const handleClick = (e) => {
    if (element.locked && !isAdminMode) return;
    e?.cancelBubble && (e.cancelBubble = true);
    onClick?.(element.id);
  };

  // In the builder canvas, an outer Group at element.x/y handles positioning.
  // In user editor / preview, we use element.x/y directly.
  const ox = useElementPosition ? element.x : 0;
  const oy = useElementPosition ? element.y : 0;

  let node = null;

  switch (element.type) {
    case 'background':
      node = <BackgroundElement element={element} onClick={handleClick} offsetX={ox} offsetY={oy} />;
      break;

    case 'image-placeholder':
      node = (
        <ImagePlaceholderElement
          element={element}
          userImage={userImage}
          placeholderImage={placeholderImage}
          isSelected={isSelected}
          isAdminMode={isAdminMode}
          onClick={handleClick}
          offsetX={ox}
          offsetY={oy}
        />
      );
      break;

    case 'overlay':
    case 'sticker':
    case 'frame':
    case 'texture':
    case 'shadow':
      node = <ImageElement element={element} onClick={handleClick} offsetX={ox} offsetY={oy} isAdminMode={isAdminMode} />;
      break;

    case 'text':
      node = <TextElement element={element} onClick={handleClick} offsetX={ox} offsetY={oy} />;
      break;

    case 'text-mask':
      node = (
        <TextMaskElement
          element={element}
          userImage={userImage}
          isAdminMode={isAdminMode}
          onClick={handleClick}
          offsetX={ox}
          offsetY={oy}
        />
      );
      break;

    case 'shape':
      node = <ShapeElement element={element} onClick={handleClick} offsetX={ox} offsetY={oy} />;
      break;

    case 'svg-mask':
      node = <SvgMaskElement element={element} userImage={userImage} onClick={handleClick} offsetX={ox} offsetY={oy} />;
      break;

    default:
      node = null;
  }

  return (
    <>
      {node}
      {isSelected && isAdminMode && element.type !== 'background' && (
        <SelectionRect element={element} offsetX={ox} offsetY={oy} />
      )}
    </>
  );
}

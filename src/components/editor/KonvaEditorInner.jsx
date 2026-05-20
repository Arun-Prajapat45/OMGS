'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Image, Rect, Circle, RegularPolygon, Line, Group, Transformer, Text, Shape } from 'react-konva';
import useImage from 'use-image';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  selectLayers, selectZoom,
  setTemplate, setLayerImage, updateLayer, setSelectedLayer, setZoom, pushHistory,
} from '@/store/slices/editorSlice';
import { calculateImageQuality } from '@/lib/utils';
import EditorToolbar from './EditorToolbar';
import QualityIndicator from './QualityIndicator';
import { getKonvaClipFunc } from '@/components/engine/shapeRegistry';

const CANVAS_SCALE = 0.45; // Display scale for canvas

// Shape clip functions for Konva
function getClipFunc(region) {
  return (ctx) => {
    const { type, width, height, radius, cornerRadius, points } = region;
    ctx.beginPath();
    if (type === 'circle') {
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    } else if (type === 'hexagon') {
      const r = radius;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = r + r * Math.cos(angle);
        const y = r + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    } else if (type === 'triangle' && points) {
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    } else {
      // Rectangle with optional corner radius
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
    }
    ctx.closePath();
  };
}

// Individual editable region component
function EditableRegion({ region, layer, isSelected, onSelect, onUploadClick }) {
  const imageRef = useRef(null);
  const groupRef = useRef(null);
  const transformerRef = useRef(null);
  const [konvaImage] = useImage(layer?.imageUrl || '', 'anonymous');

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const regionWidth = region.width || (region.radius ? region.radius * 2 : 200);
  const regionHeight = region.height || (region.radius ? region.radius * 2 : 200);
  const groupX = region.x - (region.radius || 0);
  const groupY = region.y - (region.radius || 0);

  const handleClick = () => {
    onSelect(region.id);
    if (!layer?.imageUrl) {
      onUploadClick?.(region.id);
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={groupX}
        y={groupY}
        clipFunc={getClipFunc(region)}
        onClick={handleClick}
        onTap={handleClick}
      >
        {/* Placeholder background */}
        <Rect
          x={0} y={0}
          width={regionWidth} height={regionHeight}
          fill={isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}
          strokeWidth={2}
          stroke={isSelected ? '#6366f1' : 'rgba(255,255,255,0.2)'}
          dash={konvaImage ? [] : [8, 4]}
        />

        {/* User's image */}
        {konvaImage && (
          <Image
            alt="Uploaded layer"
            ref={imageRef}
            image={konvaImage}
            x={layer.x ?? 0}
            y={layer.y ?? 0}
            scaleX={layer.scaleX ?? 1}
            scaleY={layer.scaleY ?? 1}
            rotation={layer.rotation ?? 0}
            draggable
            onDragEnd={(e) => {
              // Keep drag within bounds approximately
            }}
          />
        )}

        {/* Placeholder text */}
        {!konvaImage && (
          <Text
            x={regionWidth / 2 - 60}
            y={regionHeight / 2 - 10}
            width={120}
            text={region.placeholder || 'Click to upload'}
            fontSize={12}
            fill="rgba(255,255,255,0.45)"
            align="center"
          />
        )}
      </Group>

      {/* Transformer */}
      {isSelected && konvaImage && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => newBox}
        />
      )}
    </>
  );
}

// Glass/acrylic overlay effect
function AcrylicOverlay({ width, height }) {
  return (
    <Group>
      {/* Top-left shine */}
      <Rect
        x={0} y={0}
        width={width * 0.4} height={height * 0.4}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width * 0.4, y: height * 0.4 }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.15)', 1, 'rgba(255,255,255,0)']}
        listening={false}
      />
      {/* Bottom-right shadow */}
      <Rect
        x={width * 0.6} y={height * 0.6}
        width={width * 0.4} height={height * 0.4}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width * 0.4, y: height * 0.4 }}
        fillLinearGradientColorStops={[0, 'rgba(0,0,0,0)', 1, 'rgba(0,0,0,0.1)']}
        listening={false}
      />
    </Group>
  );
}

export default function KonvaEditorInner({ template, onExport, shape = 'rectangle', triggerExport, onHighResExport }) {
  const dispatch = useDispatch();
  const layers = useSelector(selectLayers);
  const zoom = useSelector(selectZoom);
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadRegionIdRef = useRef(null);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [uploadRegionId, setUploadRegionId] = useState(null);
  const [qualities, setQualities] = useState({});

  const { canvas, editableRegions = [], overlays = [] } = template;

  useEffect(() => {
    if (template && layers.length === 0) {
      dispatch(setTemplate(template));
    }
  }, [dispatch, template, layers.length]);
  const displayWidth = canvas.width * CANVAS_SCALE * zoom;
  const displayHeight = canvas.height * CANVAS_SCALE * zoom;

  const handleSelectRegion = (id) => {
    setSelectedRegionId(id === selectedRegionId ? null : id);
    dispatch(setSelectedLayer(id));
  };

  const handleImageUploaded = useCallback((regionId, imageUrl, img) => {
    dispatch(setLayerImage({ regionId, imageUrl, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }));

    // Quality check
    const region = template?.editableRegions?.find((r) => r.id === regionId);
    if (region) {
      const regionW = region.width || region.radius * 2;
      const regionH = region.height || region.radius * 2;
      const quality = calculateImageQuality(img.naturalWidth, img.naturalHeight, regionW / 100, regionH / 100);
      setQualities((prev) => ({ ...prev, [regionId]: quality }));
    }
  }, [dispatch, template]);

  const handleFileInputChange = useCallback((event) => {
    const file = event.target.files?.[0];
    const regionId = uploadRegionIdRef.current || uploadRegionId;
    if (!file || !regionId) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      const img = new window.Image();
      img.onload = () => {
        handleImageUploaded(regionId, url, img);
        setUploadRegionId(null);
        uploadRegionIdRef.current = null;
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }, [handleImageUploaded, uploadRegionId]);

  const openUploadPicker = useCallback((regionId) => {
    setUploadRegionId(regionId);
    uploadRegionIdRef.current = regionId;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!stageRef.current) return null;
    const stage = stageRef.current;
    // Export optimized resolution and format for cart thumbnail to avoid 413 Payload Too Large
    try {
      const uri = stage.toDataURL({ pixelRatio: 0.4, mimeType: 'image/webp', quality: 0.8 });
      if (onExport) onExport(uri);
      return uri;
    } catch (e) {
      console.error('Failed to export canvas preview:', e);
      return null;
    }
  }, [onExport]);

  // Auto-export preview when layers or zoom changes (Low res for UI)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleExport();
    }, 300);
    return () => clearTimeout(timer);
  }, [layers, zoom, handleExport]);

  // Generate high-res export when requested by parent (for cart/printing)
  useEffect(() => {
    if (triggerExport && stageRef.current && onHighResExport) {
      try {
        const uri = stageRef.current.toDataURL({ pixelRatio: 3, mimeType: 'image/webp', quality: 0.95 });
        onHighResExport(uri);
      } catch (e) {
        console.error('Failed to export high-res canvas:', e);
        onHighResExport(null);
      }
    }
  }, [triggerExport, onHighResExport]);

  if (!template) return null;

  const layerMap = {};
  layers.forEach((l) => { layerMap[l.regionId] = l; });

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <EditorToolbar stageRef={stageRef} onExport={handleExport} />

      {/* Quality indicators */}
      {Object.entries(qualities).map(([regionId, quality]) => (
        <QualityIndicator key={regionId} quality={quality} regionLabel={regionId} />
      ))}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
        Click an empty upload region directly on the template to add your photo.
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <motion.div
          className="relative"
          style={{ width: displayWidth, height: displayHeight, filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.8))' }}
          whileHover={{ scale: 1.01 }}
        >
          <Stage
            ref={stageRef}
            width={displayWidth}
            height={displayHeight}
            scaleX={CANVAS_SCALE * zoom}
            scaleY={CANVAS_SCALE * zoom}
            style={{ background: 'transparent' }}
          >
            <Layer>
              <Group clipFunc={getKonvaClipFunc(shape, { width: canvas.width, height: canvas.height, radius: Math.min(canvas.width, canvas.height) / 2 })}>
                {/* Background */}
                <Rect
                  x={0} y={0}
                  width={canvas.width}
                  height={canvas.height}
                  fill={canvas.backgroundColor || '#ffffff'}
                />

                {/* Editable regions */}
                {editableRegions.map((region) => (
                  <EditableRegion
                    key={region.id}
                    region={region}
                    layer={layerMap[region.id] || {}}
                    isSelected={selectedRegionId === region.id}
                    onSelect={handleSelectRegion}
                    onUploadClick={openUploadPicker}
                  />
                ))}

                {/* Acrylic overlay */}
                <AcrylicOverlay width={canvas.width} height={canvas.height} />
              </Group>

              {/* Edge highlight / Border outline */}
              <Shape
                sceneFunc={(ctx, shapeNode) => {
                  getKonvaClipFunc(shape, { width: canvas.width, height: canvas.height, radius: Math.min(canvas.width, canvas.height) / 2 })(ctx);
                  ctx.fillStrokeShape(shapeNode);
                }}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={4}
                listening={false}
              />
            </Layer>
          </Stage>
        </motion.div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => dispatch(setZoom(zoom - 0.1))}
          className="px-3 py-1.5 glass rounded-xl text-white/60 hover:text-white text-sm transition-all"
        >
          -
        </button>
        <span className="text-white/50 text-sm text-center" style={{ minWidth: '50px' }}>{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => dispatch(setZoom(zoom + 0.1))}
          className="px-3 py-1.5 glass rounded-xl text-white/60 hover:text-white text-sm transition-all"
        >
          +
        </button>
        <button
          onClick={() => dispatch(setZoom(1))}
          className="px-3 py-1.5 glass rounded-xl text-white/60 hover:text-white text-xs transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

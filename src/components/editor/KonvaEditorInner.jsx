'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Group, Shape, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  selectLayers, selectZoom, selectTextLayers, selectBorderColors, selectSelectedLayerId,
  setTemplate, setLayerImage, updateLayer, updateTextLayer, setSelectedLayer, setZoom,
} from '@/store/slices/editorSlice';
import { calculateImageQuality } from '@/lib/utils';
import EditorToolbar from './EditorToolbar';
import QualityIndicator from './QualityIndicator';
import { getKonvaClipFunc } from '@/components/engine/shapeRegistry';
import ElementRenderer from '@/components/engine/ElementRenderer';

const CANVAS_SCALE = 0.45;

// ── Draggable text layer with Transformer ─────────────────────────────────────
function TextLayerNode({ textLayer, isSelected, onSelect, dispatch }) {
  const textRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={textRef}
        x={textLayer.x ?? 100}
        y={textLayer.y ?? 100}
        text={textLayer.text || 'Your Text'}
        fontSize={textLayer.fontSize || 48}
        fontFamily={textLayer.fontFamily || 'Inter'}
        fontStyle={textLayer.fontStyle || 'normal'}
        fill={textLayer.color || '#ffffff'}
        rotation={textLayer.rotation || 0}
        draggable
        onClick={() => onSelect(textLayer.id)}
        onTap={() => onSelect(textLayer.id)}
        onDragEnd={(e) => {
          dispatch(updateTextLayer({ id: textLayer.id, x: e.target.x(), y: e.target.y() }));
        }}
        onTransformEnd={() => {
          const node = textRef.current;
          if (!node) return;
          dispatch(updateTextLayer({
            id: textLayer.id,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.max(8, (textLayer.fontSize || 48) * node.scaleX()),
          }));
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={['middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(old, next) => (next.width < 20 || next.height < 10 ? old : next)}
        />
      )}
    </>
  );
}

// ── Image slot — renders ElementRenderer + hit area for direct manipulation ────
function EditableRegion({
  region, layer, isSelected,
  onSelect, onUploadClick, placeholderImg,
  onSlotPointerDown, onSlotWheel, onSlotTouchStart,
}) {
  const [konvaImage] = useImage(layer?.imageUrl || '', 'anonymous');
  const hasImage = !!layer?.imageUrl;
  const slotW = region.width || (region.radius || 0) * 2;
  const slotH = region.height || (region.radius || 0) * 2;

  const syntheticElement = {
    ...region,
    type: 'image-placeholder',
    visible: true,
    locked: false,
    opacity: 1,
    backgroundColor: layer?.backgroundColor || region?.backgroundColor || undefined,
    crop: {
      cropX: layer?.x ?? 0,
      cropY: layer?.y ?? 0,
      cropScale: layer?.scaleX ?? 1,
      imageRotation: layer?.rotation ?? 0,
    },
    photoEffects: region.photoEffects || {},
    adminPreviewImageUrl: null,
  };

  const handleEmpty = () => {
    onSelect(region.id);
    onUploadClick?.(region.id);
  };

  return (
    <Group
      x={region.x - (region.radius || 0)}
      y={region.y - (region.radius || 0)}
      rotation={region.rotation || 0}
    >
      {/* Template element rendering */}
      <ElementRenderer
        element={syntheticElement}
        userImage={konvaImage || null}
        placeholderImage={(!konvaImage && placeholderImg) ? placeholderImg : null}
        isSelected={isSelected}
        isAdminMode={false}
        onClick={hasImage ? null : handleEmpty}
        useElementPosition={false}
      />

      {/* Hit rect — covers bounding box for interaction */}
      <Rect
        x={0} y={0}
        width={slotW} height={slotH}
        fill="rgba(0,0,0,0.001)"
        onClick={(e) => { e.cancelBubble = true; if (!hasImage) handleEmpty(); else onSelect(region.id); }}
        onTap={(e) => { e.cancelBubble = true; if (!hasImage) handleEmpty(); else onSelect(region.id); }}
        onMouseDown={hasImage ? (e) => { e.cancelBubble = true; onSlotPointerDown(region.id, e); } : undefined}
        onWheel={hasImage ? (e) => { e.cancelBubble = true; onSlotWheel(region.id, e); } : undefined}
        onTouchStart={hasImage ? (e) => { e.cancelBubble = true; onSlotTouchStart(region.id, e); } : undefined}
      />

      {/* Selection indicator */}
      {isSelected && hasImage && (
        <Rect
          x={-2} y={-2}
          width={slotW + 4} height={slotH + 4}
          stroke="#6366f1"
          strokeWidth={2 / CANVAS_SCALE}
          fill="transparent"
          dash={[8, 4]}
          strokeScaleEnabled={false}
          listening={false}
          cornerRadius={4}
        />
      )}
    </Group>
  );
}

// ── Acrylic overlay ────────────────────────────────────────────────────────────
function AcrylicOverlay({ width, height }) {
  return (
    <Group listening={false}>
      <Rect
        x={0} y={0} width={width * 0.4} height={height * 0.4}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width * 0.4, y: height * 0.4 }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.15)', 1, 'rgba(255,255,255,0)']}
      />
      <Rect
        x={width * 0.6} y={height * 0.6} width={width * 0.4} height={height * 0.4}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width * 0.4, y: height * 0.4 }}
        fillLinearGradientColorStops={[0, 'rgba(0,0,0,0)', 1, 'rgba(0,0,0,0.1)']}
      />
    </Group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function KonvaEditorInner({ template, onExport, shape = 'rectangle', triggerExport, onHighResExport }) {
  const dispatch = useDispatch();
  const layers   = useSelector(selectLayers);
  const textLayers   = useSelector(selectTextLayers);
  const borderColors = useSelector(selectBorderColors);
  const selectedLayerId = useSelector(selectSelectedLayerId);
  const zoom     = useSelector(selectZoom);

  const stageRef      = useRef(null);
  const fileInputRef  = useRef(null);
  const uploadRegionIdRef = useRef(null);

  // ── Direct-manipulation refs (no state to avoid re-renders mid-drag) ────────
  const activeDragIdRef = useRef(null);   // regionId currently being dragged
  const dragStartRef    = useRef({ stageX: 0, stageY: 0, cropX: 0, cropY: 0 });
  const pinchRef        = useRef(null);   // { regionId, dist, angle, startScale, startRotation }
  const hasDraggedRef   = useRef(false);  // distinguish click vs drag
  const zoomRef         = useRef(zoom);   // stable zoom for window handlers
  const layersRef       = useRef(layers); // stable layers for window handlers

  // Keep refs in sync
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { layersRef.current = layers; }, [layers]);

  const [isDragging, setIsDragging]     = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [uploadRegionId, setUploadRegionId]     = useState(null);
  const [qualities, setQualities]               = useState({});

  const [uploadPlaceholderImg] = useImage('/upload.png', 'anonymous');

  const { canvas } = template;
  const editableRegions = template.elements
    ? template.elements.filter(el => el.type === 'image-placeholder')
    : (template.editableRegions || []);

  useEffect(() => {
    if (template && layers.length === 0) dispatch(setTemplate(template));
  }, [dispatch, template, layers.length]);

  const displayWidth  = canvas.width  * CANVAS_SCALE * zoom;
  const displayHeight = canvas.height * CANVAS_SCALE * zoom;

  // Build regionId → layer map
  const layerMap = {};
  layers.forEach((l) => { layerMap[l.regionId] = l; });

  // ── Window-level mouse drag (works even outside canvas) ─────────────────────
  useEffect(() => {
    const getLayerById = (id) => layersRef.current.find(l => l.regionId === id || l.id === id);

    const onMouseMove = (e) => {
      if (!activeDragIdRef.current) return;
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.container().getBoundingClientRect();
      const stageX = e.clientX - rect.left;
      const stageY = e.clientY - rect.top;
      const scale  = CANVAS_SCALE * zoomRef.current;

      const dx = (stageX - dragStartRef.current.stageX) / scale;
      const dy = (stageY - dragStartRef.current.stageY) / scale;

      if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) hasDraggedRef.current = true;

      dispatch(updateLayer({
        id: activeDragIdRef.current,
        x: dragStartRef.current.cropX + dx,
        y: dragStartRef.current.cropY + dy,
      }));
    };

    const onMouseUp = () => {
      activeDragIdRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [dispatch]);

  // ── Slot mouse-down → start drag ────────────────────────────────────────────
  const handleSlotPointerDown = useCallback((regionId, konvaEvt) => {
    const layer = layerMap[regionId];
    if (!layer?.imageUrl) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    activeDragIdRef.current = regionId;
    hasDraggedRef.current   = false;
    dragStartRef.current    = {
      stageX: pos.x,
      stageY: pos.y,
      cropX:  layer.x || 0,
      cropY:  layer.y || 0,
    };
    setIsDragging(true);
    konvaEvt.evt.preventDefault?.();
  }, [layerMap]);

  // ── Scroll wheel → zoom image inside slot ───────────────────────────────────
  const handleSlotWheel = useCallback((regionId, konvaEvt) => {
    konvaEvt.evt.preventDefault();
    const layer = layerMap[regionId];
    if (!layer?.imageUrl) return;
    const delta    = -konvaEvt.evt.deltaY * 0.0015;
    const newScale = Math.max(0.3, Math.min(6, (layer.scaleX || 1) + delta));
    dispatch(updateLayer({ id: regionId, scaleX: newScale, scaleY: newScale }));
  }, [layerMap, dispatch]);

  // ── Touch start on a slot → 1 finger = drag, 2 finger = pinch ──────────────
  const handleSlotTouchStart = useCallback((regionId, konvaEvt) => {
    const layer = layerMap[regionId];
    if (!layer?.imageUrl) return;
    const pts = Array.from(konvaEvt.evt.touches || []);
    konvaEvt.evt.preventDefault?.();

    if (pts.length === 1) {
      const stage = stageRef.current;
      const pos   = stage?.getPointerPosition();
      activeDragIdRef.current = regionId;
      hasDraggedRef.current   = false;
      dragStartRef.current    = {
        stageX: pos?.x || 0,
        stageY: pos?.y || 0,
        cropX:  layer.x || 0,
        cropY:  layer.y || 0,
      };
      pinchRef.current = null;
    } else if (pts.length >= 2) {
      activeDragIdRef.current = null;
      const dx = pts[1].clientX - pts[0].clientX;
      const dy = pts[1].clientY - pts[0].clientY;
      pinchRef.current = {
        regionId,
        dist:          Math.sqrt(dx * dx + dy * dy),
        angle:         Math.atan2(dy, dx) * (180 / Math.PI),
        startScale:    layer.scaleX   || 1,
        startRotation: layer.rotation || 0,
      };
    }
  }, [layerMap]);

  // ── Stage touch move → drive active drag or pinch ───────────────────────────
  const handleStageTouchMove = useCallback((konvaEvt) => {
    const pts = Array.from(konvaEvt.evt.touches || []);
    konvaEvt.evt.preventDefault?.();

    if (pts.length === 1 && activeDragIdRef.current) {
      // 1-finger drag
      const stage = stageRef.current;
      const pos   = stage?.getPointerPosition();
      if (!pos) return;
      const scale = CANVAS_SCALE * zoomRef.current;
      const dx = (pos.x - dragStartRef.current.stageX) / scale;
      const dy = (pos.y - dragStartRef.current.stageY) / scale;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasDraggedRef.current = true;
      dispatch(updateLayer({
        id: activeDragIdRef.current,
        x: dragStartRef.current.cropX + dx,
        y: dragStartRef.current.cropY + dy,
      }));

    } else if (pts.length >= 2 && pinchRef.current) {
      // 2-finger pinch (zoom + rotate)
      const dx      = pts[1].clientX - pts[0].clientX;
      const dy      = pts[1].clientY - pts[0].clientY;
      const newDist  = Math.sqrt(dx * dx + dy * dy);
      const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      const scaleRatio  = newDist / pinchRef.current.dist;
      const angleDelta  = newAngle - pinchRef.current.angle;
      const newScale    = Math.max(0.3, Math.min(6, pinchRef.current.startScale * scaleRatio));

      dispatch(updateLayer({
        id:       pinchRef.current.regionId,
        scaleX:   newScale,
        scaleY:   newScale,
        rotation: pinchRef.current.startRotation + angleDelta,
      }));

    } else if (pts.length >= 2 && activeDragIdRef.current) {
      // Transitioned from 1-finger to 2-finger — switch to pinch
      const layer = layerMap[activeDragIdRef.current];
      if (layer) {
        const dx = pts[1].clientX - pts[0].clientX;
        const dy = pts[1].clientY - pts[0].clientY;
        pinchRef.current = {
          regionId:      activeDragIdRef.current,
          dist:          Math.sqrt(dx * dx + dy * dy),
          angle:         Math.atan2(dy, dx) * (180 / Math.PI),
          startScale:    layer.scaleX   || 1,
          startRotation: layer.rotation || 0,
        };
        activeDragIdRef.current = null;
      }
    }
  }, [dispatch, layerMap]);

  const handleStageTouchEnd = useCallback((konvaEvt) => {
    const pts = Array.from(konvaEvt.evt.touches || []);
    if (pts.length === 0) {
      activeDragIdRef.current = null;
      pinchRef.current        = null;
      setIsDragging(false);
    } else if (pts.length === 1 && pinchRef.current) {
      // Released one finger — restart single-touch drag
      const regionId = pinchRef.current.regionId;
      const layer    = layerMap[regionId];
      pinchRef.current = null;
      if (layer?.imageUrl) {
        const stage = stageRef.current;
        const pos   = stage?.getPointerPosition();
        activeDragIdRef.current = regionId;
        dragStartRef.current    = {
          stageX: pos?.x || 0,
          stageY: pos?.y || 0,
          cropX:  layer.x || 0,
          cropY:  layer.y || 0,
        };
      }
    }
  }, [layerMap]);

  // Non-passive wheel listener on canvas container (prevents page scroll)
  useEffect(() => {
    const container = stageRef.current?.container();
    if (!container) return;
    const handler = (e) => e.preventDefault();
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, []);

  // ── Region / text selection ──────────────────────────────────────────────────
  const handleSelectRegion = useCallback((id) => {
    if (hasDraggedRef.current) return; // ignore click after drag
    setSelectedRegionId(id === selectedRegionId ? null : id);
    dispatch(setSelectedLayer(id));
  }, [dispatch, selectedRegionId]);

  const handleSelectTextLayer = useCallback((id) => {
    setSelectedRegionId(null);
    dispatch(setSelectedLayer(id));
  }, [dispatch]);

  const handleStageClick = useCallback((e) => {
    if (hasDraggedRef.current) { hasDraggedRef.current = false; return; }
    if (e.target === e.target.getStage()) {
      setSelectedRegionId(null);
      dispatch(setSelectedLayer(null));
    }
  }, [dispatch]);

  // ── Image upload ─────────────────────────────────────────────────────────────
  const handleImageUploaded = useCallback((regionId, imageUrl, img) => {
    dispatch(setLayerImage({ regionId, imageUrl, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }));
    const region = editableRegions.find(r => r.id === regionId);
    if (region) {
      const rW = region.width || (region.radius || 0) * 2;
      const rH = region.height || (region.radius || 0) * 2;
      const q  = calculateImageQuality(img.naturalWidth, img.naturalHeight, rW / 100, rH / 100);
      setQualities(prev => ({ ...prev, [regionId]: q }));
    }
  }, [dispatch, editableRegions]);

  const handleFileInputChange = useCallback((e) => {
    const file     = e.target.files?.[0];
    const regionId = uploadRegionIdRef.current || uploadRegionId;
    if (!file || !regionId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      const img = new window.Image();
      img.onload = () => {
        handleImageUploaded(regionId, url, img);
        setUploadRegionId(null);
        uploadRegionIdRef.current = null;
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [handleImageUploaded, uploadRegionId]);

  const openUploadPicker = useCallback((regionId) => {
    setUploadRegionId(regionId);
    uploadRegionIdRef.current = regionId;
    fileInputRef.current?.click();
  }, []);

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!stageRef.current) return null;
    try {
      const uri = stageRef.current.toDataURL({ pixelRatio: 0.4, mimeType: 'image/webp', quality: 0.8 });
      if (onExport) onExport(uri);
      return uri;
    } catch (e) { return null; }
  }, [onExport]);

  useEffect(() => {
    const t = setTimeout(() => handleExport(), 300);
    return () => clearTimeout(t);
  }, [layers, textLayers, borderColors, zoom, handleExport]);

  useEffect(() => {
    if (triggerExport && stageRef.current && onHighResExport) {
      try {
        const uri = stageRef.current.toDataURL({ pixelRatio: 3, mimeType: 'image/webp', quality: 0.95 });
        onHighResExport(uri);
      } catch { onHighResExport(null); }
    }
  }, [triggerExport, onHighResExport]);

  if (!template) return null;

  return (
    <div className="flex flex-col gap-4">
      <EditorToolbar stageRef={stageRef} onExport={handleExport} />

      {/* {Object.entries(qualities).map(([regionId, quality]) => (
        <QualityIndicator key={regionId} quality={quality} regionLabel={regionId} />
      ))} */}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />


      {/* Canvas */}
      <div className="flex justify-center">
        <motion.div
          className="relative select-none"
          style={{
            width: displayWidth,
            height: displayHeight,
            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.8))',
            cursor: isDragging ? 'grabbing' : 'default',
            touchAction: 'none', // prevent browser scroll/zoom on mobile
          }}
          whileHover={{ scale: 1.005 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Stage
            ref={stageRef}
            width={displayWidth}
            height={displayHeight}
            scaleX={CANVAS_SCALE * zoom}
            scaleY={CANVAS_SCALE * zoom}
            style={{ background: 'transparent' }}
            onClick={handleStageClick}
            onTap={handleStageClick}
            onTouchMove={handleStageTouchMove}
            onTouchEnd={handleStageTouchEnd}
          >
            <Layer>
              <Group clipFunc={getKonvaClipFunc(shape, {
                width: canvas.width,
                height: canvas.height,
                radius: Math.min(canvas.width, canvas.height) / 2,
              })}>
                <Rect x={0} y={0} width={canvas.width} height={canvas.height} fill={canvas.backgroundColor || 'transparent'} />

                {/* Render all elements (sorted by zIndex) */}
                {(template.elements
                  ? [...template.elements]
                  : editableRegions.map(r => ({ ...r, type: 'image-placeholder' }))
                )
                  .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
                  .map((el) => {
                    if (el.type === 'image-placeholder' || el.uploadSlot != null) {
                      return (
                        <EditableRegion
                          key={el.id}
                          region={el}
                          layer={layerMap[el.id] || {}}
                          isSelected={selectedRegionId === el.id}
                          onSelect={handleSelectRegion}
                          onUploadClick={openUploadPicker}
                          placeholderImg={uploadPlaceholderImg}
                          onSlotPointerDown={handleSlotPointerDown}
                          onSlotWheel={handleSlotWheel}
                          onSlotTouchStart={handleSlotTouchStart}
                        />
                      );
                    }
                    // Non-editable element with optional border color override
                    const elWithOverride = borderColors[el.id]
                      ? { ...el, fill: borderColors[el.id], stroke: borderColors[el.id] }
                      : el;
                    return (
                      <ElementRenderer
                        key={el.id}
                        element={elWithOverride}
                        userImage={null}
                        isAdminMode={false}
                      />
                    );
                  })}

                <AcrylicOverlay width={canvas.width} height={canvas.height} />
              </Group>

              {/* Border outline */}
              <Shape
                sceneFunc={(ctx, shapeNode) => {
                  getKonvaClipFunc(shape, {
                    width: canvas.width,
                    height: canvas.height,
                    radius: Math.min(canvas.width, canvas.height) / 2,
                  })(ctx);
                  ctx.fillStrokeShape(shapeNode);
                }}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={4}
                listening={false}
              />

              {/* Text layers */}
              {textLayers.map(tl => (
                <TextLayerNode
                  key={tl.id}
                  textLayer={tl}
                  isSelected={selectedLayerId === tl.id}
                  onSelect={handleSelectTextLayer}
                  dispatch={dispatch}
                />
              ))}
            </Layer>
          </Stage>
        </motion.div>
      </div>

      {/* Canvas zoom controls
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => dispatch(setZoom(zoom - 0.1))} className="px-3 py-1.5 glass rounded-xl text-white/60 hover:text-white text-sm transition-all">−</button>
        <span className="text-white/50 text-sm" style={{ minWidth: 50, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => dispatch(setZoom(zoom + 0.1))} className="px-3 py-1.5 glass rounded-xl text-white/60 hover:text-white text-sm transition-all">+</button>
        <button onClick={() => dispatch(setZoom(1))} className="px-3 py-1.5 glass rounded-xl text-white/60 hover:text-white text-xs transition-all">Reset</button>
      </div> */}
    </div>
  );
}

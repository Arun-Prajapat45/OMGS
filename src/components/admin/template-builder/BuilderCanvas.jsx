'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Group, Transformer } from 'react-konva';
import { useDispatch, useSelector } from 'react-redux';
import useImage from 'use-image';
import {
  selectSortedElements, selectCanvas, selectSelectedElementId,
  selectBuilderZoom, setSelectedElement, updateElement, commitHistory, setZoom,
} from '@/store/slices/templateBuilderSlice';
import { getKonvaClipFunc } from '@/components/engine/shapeRegistry';
import ElementRenderer from '@/components/engine/ElementRenderer';

// Canvas checkerboard pattern background (transparent areas indicator)
const CHECKER = 'repeating-conic-gradient(#1a1b2e 0% 25%, #13141f 0% 50%) 0 0 / 20px 20px';

/**
 * BuilderElement wraps a single element render so hooks (useImage) can be
 * called legally per-element — React disallows hooks inside .map().
 * For image-placeholder elements, loads the adminPreviewImageUrl so effects
 * are visible live in the canvas without needing a user upload.
 */
function BuilderElement({ el, isSelected, isDraggable, previewMode, nodeRefs, onDragEnd, onTransformEnd, onClick }) {
  // Load admin preview image for photo slots — null for all other element types
  const previewUrl = el.type === 'image-placeholder' ? (el.adminPreviewImageUrl || '') : '';
  const [adminPreviewImg] = useImage(previewUrl, 'anonymous');

  // Pass the loaded image as userImage so ElementRenderer renders it with effects.
  // ElementRenderer also does its own useImage(adminPreviewImageUrl) internally,
  // but having it here ensures the outer Group re-renders when the image loads.
  const userImage = el.type === 'image-placeholder' ? adminPreviewImg : null;

  return (
    <Group
      ref={(node) => {
        if (node) nodeRefs.current[el.id] = node;
        else delete nodeRefs.current[el.id];
      }}
      x={el.x}
      y={el.y}
      rotation={el.rotation || 0}
      draggable={isDraggable}
      onDragEnd={isDraggable ? (e) => onDragEnd(e, el.id) : undefined}
      onTransformEnd={isDraggable ? (e) => onTransformEnd(e, el.id) : undefined}
    >
      <ElementRenderer
        element={el}
        userImage={userImage}
        isSelected={isSelected}
        isAdminMode={!previewMode}
        onClick={() => onClick(el.id)}
        useElementPosition={false}
      />
    </Group>
  );
}

export default function BuilderCanvas({ previewMode, shape = 'rectangle' }) {
  const dispatch = useDispatch();
  const elements = useSelector(selectSortedElements);   // sorted by zIndex asc
  const canvas = useSelector(selectCanvas);
  const selectedId = useSelector(selectSelectedElementId);
  const zoom = useSelector(selectBuilderZoom);

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const containerRef = useRef(null);

  // Track node refs by element id for transformer attachment
  const nodeRefs = useRef({});

  const displayW = canvas.width * zoom;
  const displayH = canvas.height * zoom;

  // Attach transformer to selected node
  useEffect(() => {
    if (!transformerRef.current) return;
    const node = nodeRefs.current[selectedId];
    if (node) {
      transformerRef.current.nodes([node]);
    } else {
      transformerRef.current.nodes([]);
    }
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedId]);

  // Click on stage background → deselect
  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      dispatch(setSelectedElement(null));
    }
  }, [dispatch]);

  // Handle element click → select
  const handleElementClick = useCallback((id) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    if (!previewMode && !el.locked) {
      dispatch(setSelectedElement(id));
    }
  }, [dispatch, elements, previewMode]);

  // Drag end → update element position
  const handleDragEnd = useCallback((e, id) => {
    const node = e.target;
    dispatch(updateElement({
      id,
      x: Math.round(node.x()),
      y: Math.round(node.y()),
    }));
    dispatch(commitHistory());
  }, [dispatch]);

  // Transform end → update element size/rotation
  const handleTransformEnd = useCallback((e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    dispatch(updateElement({
      id,
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.round(node.width() * scaleX),
      height: Math.round(node.height() * scaleY),
      rotation: Math.round(node.rotation()),
    }));
    dispatch(commitHistory());
  }, [dispatch]);

  // Ctrl+Wheel → zoom, plain wheel → pan
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Ctrl+Wheel → zoom
      const delta = e.evt.deltaY > 0 ? -0.05 : 0.05;
      dispatch(setZoom(Math.max(0.1, Math.min(3, zoom + delta))));
    } else {
      // Pan the container
      if (containerRef.current) {
        containerRef.current.scrollLeft += e.evt.deltaX;
        containerRef.current.scrollTop += e.evt.deltaY;
      }
    }
  }, [dispatch, zoom]);

  const selectedEl = elements.find(e => e.id === selectedId);
  const canTransform = selectedEl && !selectedEl.locked && !previewMode;

  return (
    <div
      ref={containerRef}
      className="builder-canvas-area"
      style={{ background: '#0d0e1a' }}
    >
      {/* Canvas area */}
      <div
        className="builder-canvas-stage relative shadow-2xl"
        style={{
          width: displayW,
          height: displayH,
          background: CHECKER,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.2), 0 32px 64px rgba(0,0,0,0.8)',
        }}
      >
        <Stage
          ref={stageRef}
          width={displayW}
          height={displayH}
          scaleX={zoom}
          scaleY={zoom}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onWheel={handleWheel}
        >
          <Layer>
            {/* Canvas shape clip group */}
            <Group
              clipFunc={getKonvaClipFunc(shape, {
                width: canvas.width,
                height: canvas.height,
                radius: Math.min(canvas.width, canvas.height) / 2,
              })}
            >
              {/* Each element is a separate component so hooks work correctly */}
              {elements.map((el) => (
                <BuilderElement
                  key={el.id}
                  el={el}
                  isSelected={selectedId === el.id}
                  isDraggable={!el.locked && !previewMode}
                  previewMode={previewMode}
                  nodeRefs={nodeRefs}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={handleTransformEnd}
                  onClick={handleElementClick}
                />
              ))}
            </Group>

            {/* Transformer for selected element */}
            {canTransform && (
              <Transformer
                ref={transformerRef}
                enabledAnchors={selectedEl?.resizable !== false ? undefined : []}
                rotateEnabled={selectedEl?.rotatable !== false}
                borderStroke="#6366f1"
                borderStrokeWidth={2}
                anchorFill="#6366f1"
                anchorStroke="#fff"
                anchorSize={8}
                anchorCornerRadius={2}
                keepRatio={false}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) return oldBox;
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Canvas size label */}
      <div className="absolute bottom-3 right-4 text-[10px] text-white/20 font-mono pointer-events-none">
        {canvas.width} × {canvas.height} px
        {previewMode && (
          <span className="ml-2 text-violet-400">PREVIEW MODE</span>
        )}
      </div>

      {/* Zoom % label bottom-left */}
      <div className="absolute bottom-3 left-4 text-[10px] text-white/20 font-mono pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

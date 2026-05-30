'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  selectBuilderZoom, selectCanUndo, selectCanRedo, selectIsDirty,
  selectTemplateMeta, selectCanvas,
  setZoom, undo, redo, setCanvas, setTemplateMeta,
} from '@/store/slices/templateBuilderSlice';
import { HiSave, HiPlus, HiArrowLeft, HiEye, HiEyeOff } from 'react-icons/hi';
import { MdUndo, MdRedo } from 'react-icons/md';
import { useState, useEffect, useRef } from 'react';

const ZOOM_STEPS = [0.1, 0.2, 0.25, 0.33, 0.5, 0.67, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

export default function BuilderToolbar({ onAddElement, onSave, onBack, isSaving, previewMode, onTogglePreview }) {
  const dispatch = useDispatch();
  const zoom = useSelector(selectBuilderZoom);
  const canUndo = useSelector(selectCanUndo);
  const canRedo = useSelector(selectCanRedo);
  const isDirty = useSelector(selectIsDirty);
  const meta = useSelector(selectTemplateMeta);
  const canvas = useSelector(selectCanvas);

  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const zoomPercent = Math.round(zoom * 100);

  const stepZoom = (dir) => {
    const cur = ZOOM_STEPS.indexOf(ZOOM_STEPS.find(z => Math.abs(z - zoom) < 0.01));
    const next = ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, cur + dir))];
    dispatch(setZoom(next || zoom + dir * 0.1));
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!showCanvasSettings) return;
    const handleOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setShowCanvasSettings(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showCanvasSettings]);

  return (
    <div className="h-12 bg-[#0b0c15] border-b border-white/8 flex items-center px-3 gap-2 shrink-0 z-20 relative">

      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 text-xs transition-all shrink-0"
      >
        <HiArrowLeft size={15} />
        <span className="hidden sm:inline">Dashboard</span>
      </button>

      <div className="w-px h-5 bg-white/10 shrink-0" />

      {/* Template name + canvas settings */}
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          value={meta.name}
          onChange={(e) => dispatch(setTemplateMeta({ name: e.target.value }))}
          placeholder="Template name…"
          className="bg-transparent border-0 text-white text-sm font-medium placeholder-white/25 focus:outline-none w-36 focus:bg-white/5 px-2 py-1 rounded-lg transition-colors min-w-0"
        />
        <button
          ref={triggerRef}
          onClick={() => setShowCanvasSettings(!showCanvasSettings)}
          className={`px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/8 font-mono transition-all shrink-0 ${showCanvasSettings ? 'bg-white/8 text-white/70' : ''}`}
        >
          {canvas.width} × {canvas.height}
        </button>
      </div>

      {/* Canvas settings dropdown */}
      {showCanvasSettings && (
        <>
          {/* Invisible backdrop to catch outside clicks */}
          <div className="fixed inset-0 z-40" onClick={() => setShowCanvasSettings(false)} />
          <div
            ref={dropdownRef}
            className="absolute top-14 left-1/4 -translate-x-1/3 z-50 bg-[#13141f] border border-white/15 rounded-xl shadow-2xl p-5 flex flex-wrap gap-4 items-end"
            style={{ minWidth: 380 }}
          >
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Width (px)</label>
              <input type="number" value={canvas.width}
                onChange={(e) => dispatch(setCanvas({ width: parseInt(e.target.value) || canvas.width }))}
                className="w-24 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Height (px)</label>
              <input type="number" value={canvas.height}
                onChange={(e) => dispatch(setCanvas({ height: parseInt(e.target.value) || canvas.height }))}
                className="w-24 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={canvas.backgroundColor || '#ffffff'}
                  onChange={(e) => dispatch(setCanvas({ backgroundColor: e.target.value }))}
                  className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10"
                />
                <span className="text-xs text-white/40 font-mono">{canvas.backgroundColor || '#ffffff'}</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Product Type</label>
              <select value={meta.productType}
                onChange={(e) => dispatch(setTemplateMeta({ productType: e.target.value }))}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60">
                {['acrylic', 'canvas', 'metal', 'frame', 'collage', 'clock'].map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Shape</label>
              <select value={meta.shape}
                onChange={(e) => dispatch(setTemplateMeta({ shape: e.target.value }))}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60">
                {['rectangle', 'square', 'circle', 'oval', 'hexagon', 'triangle', 'portrait', 'landscape', 'heart', 'cloud', 'star', 'egg', 'wave', 'custom'].map(s => (
                  <option key={s} value={s} className="bg-gray-900">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Active</label>
              <button
                onClick={() => dispatch(setTemplateMeta({ isActive: !meta.isActive }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${meta.isActive ? 'bg-emerald-600/80 text-white' : 'bg-white/8 text-white/40'}`}
              >
                {meta.isActive ? 'Active' : 'Draft'}
              </button>
            </div>
            <button onClick={() => setShowCanvasSettings(false)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors">
              Apply
            </button>
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 shrink-0">
        <button onClick={() => dispatch(undo())} disabled={!canUndo}
          className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Undo (Ctrl+Z)">
          <MdUndo size={16} />
        </button>
        <button onClick={() => dispatch(redo())} disabled={!canRedo}
          className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Redo (Ctrl+Y)">
          <MdRedo size={16} />
        </button>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 shrink-0">
        <button onClick={() => stepZoom(-1)}
          className="px-2 py-1 rounded-md hover:bg-white/10 text-white/50 hover:text-white text-sm transition-all" title="Zoom out">
          −
        </button>
        <button
          onClick={() => dispatch(setZoom(0.5))}
          className="px-2 py-1 text-xs text-white/50 hover:text-white font-mono rounded-md hover:bg-white/10 transition-all min-w-[44px] text-center"
          title="Reset zoom to 50%"
        >
          {zoomPercent}%
        </button>
        <button onClick={() => stepZoom(1)}
          className="px-2 py-1 rounded-md hover:bg-white/10 text-white/50 hover:text-white text-sm transition-all" title="Zoom in">
          +
        </button>
        <button onClick={() => dispatch(setZoom(1))}
          className="px-2 py-1 text-[10px] text-white/30 hover:text-white/60 font-mono rounded-md hover:bg-white/10 transition-all" title="Fit 100%">
          1:1
        </button>
      </div>

      {/* Preview toggle */}
      <button
        onClick={onTogglePreview}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${previewMode ? 'bg-violet-600/80 text-white' : 'bg-white/8 text-white/60 hover:text-white hover:bg-white/12'}`}
        title="Preview mode (hides admin overlays)"
      >
        {previewMode ? <HiEyeOff size={14} /> : <HiEye size={14} />}
        <span className="hidden sm:inline">{previewMode ? 'Exit Preview' : 'Preview'}</span>
      </button>

      {/* Add element */}
      <button
        onClick={onAddElement}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-all shrink-0"
      >
        <HiPlus size={15} />
        <span className="hidden sm:inline">Add Layer</span>
      </button>

      {/* Save */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 shrink-0 ${
          isDirty
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
            : 'bg-white/8 text-white/50 hover:bg-white/12 hover:text-white'
        }`}
        title="Save (Ctrl+S)"
      >
        {isSaving ? (
          <span className="w-3.5 h-3.5 border border-white/60 border-t-transparent rounded-full animate-spin" />
        ) : (
          <HiSave size={14} />
        )}
        {isSaving ? 'Saving…' : 'Save'}
        {isDirty && !isSaving && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
      </button>
    </div>
  );
}

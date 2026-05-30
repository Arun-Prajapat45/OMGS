'use client';

import { useDispatch } from 'react-redux';
import { updateLayer, setLayerImage } from '@/store/slices/editorSlice';
import { useRef } from 'react';
import { HiPhotograph, HiRefresh } from 'react-icons/hi';
import { MdRotateRight } from 'react-icons/md';

export default function ImageControlPanel({ layer }) {
  const dispatch    = useDispatch();
  const fileInputRef = useRef(null);

  if (!layer || !layer.imageUrl) {
    return (
      <div className="py-4 text-center space-y-1">
        <p className="text-sm text-white/40 font-medium">Select a photo slot on the canvas</p>
        <div className="glass rounded-xl p-4 space-y-2 text-xs text-white/40 text-left max-w-xs mx-auto">
          <div className="flex items-center gap-2"><span>✋</span><span><strong className="text-white/60">Drag</strong> — reposition photo inside the slot</span></div>
          <div className="flex items-center gap-2"><span>🖱️</span><span><strong className="text-white/60">Scroll wheel</strong> — zoom in / out</span></div>
          <div className="flex items-center gap-2"><span>🤌</span><span><strong className="text-white/60">Pinch</strong> — zoom + rotate on mobile</span></div>
          <div className="flex items-center gap-2"><span>📸</span><span><strong className="text-white/60">Click empty slot</strong> — upload photo</span></div>
        </div>
      </div>
    );
  }

  const update = (updates) => dispatch(updateLayer({ id: layer.id, ...updates }));

  const handleReplaceImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      const img = new window.Image();
      img.onload = () => dispatch(setLayerImage({
        regionId:     layer.regionId,
        imageUrl:     url,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }));
      img.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const imageRotation = layer.rotation ?? 0;
  const cropScale     = layer.scaleX ?? 1;
  const backgroundColor = layer.backgroundColor || '';

  const handleBackgroundColor = (color) => update({ backgroundColor: color });
  const handleClearBackground = () => update({ backgroundColor: '' });

  return (
    <div className="space-y-4">
      {/* Image info + replace button */}
      <div className="flex items-center gap-3 glass rounded-xl p-3">
        <div className="relative w-14 h-14 rounded-lg border border-white/10 overflow-hidden shrink-0" style={{ backgroundColor: backgroundColor || '#111' }}>
          <img
            src={layer.imageUrl}
            alt="Slot preview"
            className="w-full h-full object-cover"
            style={{ transform: `rotate(${imageRotation}deg)`, transition: 'transform 0.2s' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white font-medium">Photo Slot {layer.uploadSlot || 1}</div>
          <div className="text-xs text-white/40 mt-0.5">
            {layer.naturalWidth && layer.naturalHeight
              ? `${layer.naturalWidth} × ${layer.naturalHeight}px`
              : 'Image loaded'}
          </div>
          <div className="text-xs text-white/30 mt-1 tabular-nums">
            Zoom {Math.round(cropScale * 100)}% · Rotation {Math.round(imageRotation)}°
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 glass rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0"
          title="Replace image"
        >
          <HiPhotograph className="w-4 h-4" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceImage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs text-white/50 uppercase tracking-wide">
                <MdRotateRight className="w-4 h-4" /> Rotation
              </label>
              <span className="text-white/50 text-xs tabular-nums">{Math.round(imageRotation)}°</span>
            </div>
            <input
              type="range" min={-180} max={180} step={1}
              value={imageRotation}
              onChange={(e) => update({ rotation: Number(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <div className="text-xs text-white/30 mb-1.5 uppercase tracking-wide">Quick Rotate</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '−90°', deg: -90, icon: '↺' },
                { label: '−45°', deg: -45, icon: '↺' },
                { label: '+45°', deg: +45, icon: '↻' },
                { label: '+90°', deg: +90, icon: '↻' },
              ].map(({ label, deg, icon }) => (
                <button
                  key={deg}
                  onClick={() => update({ rotation: imageRotation + deg })}
                  className="py-2 glass rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-xs transition-all border border-white/5 flex flex-col items-center gap-0.5"
                >
                  <span className="text-sm">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 glass rounded-xl p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-white">Image background</div>
              <div className="text-xs text-white/50">Set or remove the region background behind the uploaded photo.</div>
            </div>
            <button
              type="button"
              onClick={handleClearBackground}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={backgroundColor || '#ffffff'}
              onChange={(e) => handleBackgroundColor(e.target.value)}
              className="w-14 h-14 p-0 border border-white/10 rounded-lg overflow-hidden"
              aria-label="Upload region background color"
            />
            <div className="min-w-0">
              <div className="text-sm text-white">Background color</div>
              <div className="text-xs text-white/50">{backgroundColor || 'None'}</div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => update({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 })}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/50 border border-white/10 hover:bg-white/5 text-sm transition-all"
      >
        <HiRefresh className="w-4 h-4" />
        Reset Image
      </button>
    </div>
  );
}

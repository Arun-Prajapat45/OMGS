'use client';

import { useDispatch, useSelector } from 'react-redux';
import { setBorderColor, selectBorderColors } from '@/store/slices/editorSlice';

const BORDER_PRESETS = [
  '#ffffff', '#000000', '#6366f1', '#8b5cf6', '#f97316',
  '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899',
  '#94a3b8', '#0ea5e9', '#a16207', '#1e1b4b', '#14532d',
];

export default function BorderColorPanel({ shapeElements }) {
  const dispatch = useDispatch();
  const borderColors = useSelector(selectBorderColors);

  if (!shapeElements || shapeElements.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        <div className="text-3xl mb-2">🎨</div>
        No frame or shape elements found in this template
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-white/40 leading-relaxed">
        Customize the color of frame borders and shape elements in your design.
      </p>
      {shapeElements.map((el) => {
        const currentColor = borderColors[el.id] || el.fill || el.stroke || '#6366f1';
        return (
          <div key={el.id} className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white capitalize">{el.name || el.type || 'Shape'}</div>
                <div className="text-xs text-white/40 mt-0.5 capitalize">{el.type}</div>
              </div>
              <div className="w-8 h-8 rounded-lg border border-white/20" style={{ backgroundColor: currentColor }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BORDER_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => dispatch(setBorderColor({ elementId: el.id, color }))}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 ${
                    currentColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => dispatch(setBorderColor({ elementId: el.id, color: e.target.value }))}
                className="w-10 h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent"
              />
              <span className="text-white/40 text-xs font-mono">{currentColor.toUpperCase()}</span>
              <button
                onClick={() => dispatch(setBorderColor({ elementId: el.id, color: el.fill || el.stroke || '#6366f1' }))}
                className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

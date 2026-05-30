'use client';

import { useDispatch } from 'react-redux';
import { updateTextLayer, removeTextLayer } from '@/store/slices/editorSlice';
import { HiTrash } from 'react-icons/hi';
import { MdFormatBold, MdFormatItalic } from 'react-icons/md';

const FONT_FAMILIES = [
  'Inter',
  'Plus Jakarta Sans',
  'Playfair Display',
  'Montserrat',
  'Oswald',
  'Dancing Script',
  'Roboto',
  'Pacifico',
  'Brush Script MT',
  'Lucida Handwriting',
  'Comic Sans MS',
  'Segoe Script',
  'Apple Chancery',
  'Snell Roundhand',
];

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#6366f1', '#f97316', '#ef4444',
  '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#a855f7',
];

export default function TextLayerEditor({ textLayer }) {
  const dispatch = useDispatch();

  if (!textLayer) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        <div className="text-3xl mb-2">✏️</div>
        Select a text layer to edit it
      </div>
    );
  }

  const update = (updates) => dispatch(updateTextLayer({ id: textLayer.id, ...updates }));

  return (
    <div className="space-y-4">

      {/* Text */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
          Text
        </label>

        <textarea
          value={textLayer.text || ""}
          onChange={(e) => update({ text: e.target.value })}
          rows={2}
          placeholder="Enter text..."
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Font + Size + Bold + Italic */}
      <div className="grid grid-cols-[1fr_110px_42px_42px] gap-2 items-end">

        {/* Font */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
            Font
          </label>

          <select
            value={textLayer.fontFamily || "Inter"}
            onChange={(e) =>
              update({ fontFamily: e.target.value })
            }
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
            Size
          </label>

          <input
            type="number"
            min={10}
            max={300}
            value={textLayer.fontSize || 48}
            onChange={(e) =>
              update({ fontSize: Number(e.target.value) })
            }
            className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
          />
        </div>

        {/* Bold */}
        <button
          onClick={() =>
            update({
              fontWeight:
                textLayer.fontWeight === "bold"
                  ? "normal"
                  : "bold",
            })
          }
          className={`h-10 rounded-lg flex items-center justify-center transition-all ${textLayer.fontWeight === "bold"
              ? "gradient-primary text-white"
              : "bg-white/5 text-white/60 hover:text-white"
            }`}
        >
          <MdFormatBold size={18} />
        </button>

        {/* Italic */}
        <button
          onClick={() =>
            update({
              fontStyle:
                textLayer.fontStyle === "italic"
                  ? "normal"
                  : "italic",
            })
          }
          className={`h-10 rounded-lg flex items-center justify-center transition-all ${textLayer.fontStyle === "italic"
              ? "gradient-primary text-white"
              : "bg-white/5 text-white/60 hover:text-white"
            }`}
        >
          <MdFormatItalic size={18} />
        </button>
      </div>

      {/* Color + Rotation */}
      <div className="grid grid-cols-[auto_1fr_150px] gap-3 items-center">

        {/* Color Picker */}
        <input
          type="color"
          value={textLayer.color || "#ffffff"}
          onChange={(e) =>
            update({ color: e.target.value })
          }
          className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
        />

        {/* Presets */}
        <div className="flex flex-wrap gap-1">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => update({ color })}
              style={{ backgroundColor: color }}
              className={`w-6 h-6 rounded-full transition-all ${textLayer.color === color
                  ? "ring-2 ring-white scale-110"
                  : ""
                }`}
            />
          ))}
        </div>

        {/* Rotation */}
        <div>
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/50 mb-1">
            <span>Rotate</span>
            <span>{textLayer.rotation || 0}°</span>
          </div>

          <input
            type="range"
            min={-180}
            max={180}
            value={textLayer.rotation || 0}
            onChange={(e) =>
              update({ rotation: Number(e.target.value) })
            }
            className="w-full accent-primary-500"
          />
        </div>

      </div>

      {/* Delete */}
      <button
        onClick={() => dispatch(removeTextLayer(textLayer.id))}
        className="w-full py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
      >
        Remove Layer
      </button>

    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  HiPhotograph, HiColorSwatch, HiOutlineViewGridAdd, HiAnnotation,
  HiCube, HiSparkles, HiEmojiHappy, HiCode, HiAdjustments, HiX
} from 'react-icons/hi';
import { MdOutlineTextFields, MdOutlineCropFree } from 'react-icons/md';

const ELEMENT_TYPES = [
  {
    type: 'background',
    label: 'Background',
    icon: HiColorSwatch,
    color: 'from-slate-500 to-slate-700',
    description: 'Canvas background color or image',
  },
  {
    type: 'image-placeholder',
    label: 'Photo Slot',
    icon: HiPhotograph,
    color: 'from-indigo-500 to-purple-600',
    description: 'User uploads a photo here',
  },
  {
    type: 'text',
    label: 'Text',
    icon: MdOutlineTextFields,
    color: 'from-blue-500 to-cyan-600',
    description: 'Static or editable text layer',
  },
  {
    type: 'text-mask',
    label: 'Typography Mask',
    icon: HiAnnotation,
    color: 'from-pink-500 to-rose-600',
    description: 'Photo renders INSIDE letter shapes (MOM, LOVE, etc.)',
  },
  {
    type: 'overlay',
    label: 'Overlay',
    icon: HiOutlineViewGridAdd,
    color: 'from-violet-500 to-purple-700',
    description: 'PNG overlay with transparency (polaroid, border)',
  },
  {
    type: 'frame',
    label: 'Frame',
    icon: MdOutlineCropFree,
    color: 'from-amber-500 to-orange-600',
    description: 'Decorative photo frame on top',
  },
  {
    type: 'sticker',
    label: 'Sticker',
    icon: HiEmojiHappy,
    color: 'from-yellow-500 to-amber-600',
    description: 'Small PNG decoration (tape, ribbon, tag)',
  },
  {
    type: 'shape',
    label: 'Shape',
    icon: HiCube,
    color: 'from-emerald-500 to-teal-600',
    description: 'Rectangle, circle, hexagon fill shape',
  },
  {
    type: 'texture',
    label: 'Texture',
    icon: HiAdjustments,
    color: 'from-stone-500 to-stone-700',
    description: 'Texture overlay with blend mode (paper, grain)',
  },
  {
    type: 'shadow',
    label: 'Shadow',
    icon: HiSparkles,
    color: 'from-gray-600 to-gray-800',
    description: 'Drop shadow or vignette layer',
  },
  {
    type: 'svg-mask',
    label: 'SVG Mask',
    icon: HiCode,
    color: 'from-fuchsia-500 to-pink-700',
    description: 'Custom SVG path as a photo clipping mask',
  },
];

export default function AddElementMenu({ onAdd, onClose }) {
  const [hovered, setHovered] = useState(null);
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleAdd = (type) => {
    onAdd(type);
    // onClose is called by parent via handleAddElement
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: `rgba(0,0,0,${visible ? 0.65 : 0})`,
        backdropFilter: `blur(${visible ? 6 : 0}px)`,
        transition: 'background 0.2s ease, backdrop-filter 0.2s ease',
      }}
      onClick={handleClose}
    >
      <div
        className="bg-[#13141f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(16px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg">Add Element</h2>
            <p className="text-white/40 text-xs mt-0.5">Choose a layer type to add to your template</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 overflow-y-auto builder-scrollbar">
          {ELEMENT_TYPES.map((et, i) => {
            const Icon = et.icon;
            return (
              <button
                key={et.type}
                onClick={() => handleAdd(et.type)}
                onMouseEnter={() => setHovered(et.type)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 0.2s ease ${i * 25}ms, transform 0.25s ease ${i * 25}ms`,
                }}
                className={`group relative flex flex-col items-start gap-2.5 p-4 rounded-xl border transition-all text-left ${
                  hovered === et.type
                    ? 'bg-white/10 border-white/20 scale-[1.02] shadow-lg'
                    : 'bg-white/5 border-white/5 hover:bg-white/8'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${et.color} flex items-center justify-center shrink-0 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{et.label}</p>
                  <p className="text-white/40 text-[11px] mt-0.5 leading-snug">{et.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectElements, selectSelectedElementId,
  setSelectedElement, toggleVisibility, toggleLock,
  deleteElement, duplicateElement, reorderElements,
  addElement,
} from '@/store/slices/templateBuilderSlice';
import {
  HiEye, HiEyeOff, HiLockClosed, HiLockOpen, HiTrash, HiDuplicate,
  HiPlus, HiChevronUp, HiChevronDown,
} from 'react-icons/hi';
import {
  MdDragIndicator,
  MdOutlineTextFields,
  MdOutlineCropFree,
} from 'react-icons/md';
import {
  HiPhotograph, HiColorSwatch, HiOutlineViewGridAdd, HiAnnotation,
  HiCube, HiSparkles, HiEmojiHappy, HiCode, HiAdjustments,
} from 'react-icons/hi';

const TYPE_META = {
  background:        { label: 'Background',       Icon: HiColorSwatch,          color: 'text-slate-400' },
  'image-placeholder':{ label: 'Photo Slot',       Icon: HiPhotograph,           color: 'text-indigo-400' },
  text:              { label: 'Text',              Icon: MdOutlineTextFields,    color: 'text-blue-400' },
  'text-mask':       { label: 'Typography Mask',   Icon: HiAnnotation,           color: 'text-pink-400' },
  overlay:           { label: 'Overlay',           Icon: HiOutlineViewGridAdd,   color: 'text-violet-400' },
  frame:             { label: 'Frame',             Icon: MdOutlineCropFree,      color: 'text-amber-400' },
  sticker:           { label: 'Sticker',           Icon: HiEmojiHappy,           color: 'text-yellow-400' },
  shape:             { label: 'Shape',             Icon: HiCube,                 color: 'text-emerald-400' },
  texture:           { label: 'Texture',           Icon: HiAdjustments,          color: 'text-stone-400' },
  shadow:            { label: 'Shadow',            Icon: HiSparkles,             color: 'text-gray-400' },
  'svg-mask':        { label: 'SVG Mask',          Icon: HiCode,                 color: 'text-fuchsia-400' },
};

// Layer row component
function LayerRow({ element, index, isSelected, onSelect, onToggleVisibility, onToggleLock, onDelete, onDuplicate, onDragStart, onDragOver, onDrop, isDragOver }) {
  const meta = TYPE_META[element.type] || { label: element.type, Icon: HiCube, color: 'text-white/40' };
  const { Icon } = meta;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={() => onDrop(index)}
      onClick={() => onSelect(element.id)}
      className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all text-sm
        ${isSelected ? 'bg-indigo-600/25 border border-indigo-500/40' : 'hover:bg-white/5 border border-transparent'}
        ${isDragOver ? 'border-t-2 border-t-indigo-400' : ''}
      `}
    >
      {/* Drag handle */}
      <MdDragIndicator className="w-4 h-4 text-white/20 group-hover:text-white/40 shrink-0 cursor-grab active:cursor-grabbing" />

      {/* Type icon */}
      <Icon className={`w-4 h-4 shrink-0 ${meta.color}`} />

      {/* Name */}
      <span className={`flex-1 truncate text-xs ${isSelected ? 'text-white font-medium' : 'text-white/70'}`}>
        {element.name || meta.label}
      </span>

      {/* z-index badge */}
      <span className="text-[10px] text-white/25 font-mono shrink-0">{element.zIndex ?? 0}</span>

      {/* Actions (visible on hover or select) */}
      <div className={`flex items-center gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(element.id); }}
          title={element.visible ? 'Hide' : 'Show'}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${element.visible ? 'text-white/50' : 'text-white/20'}`}
        >
          {element.visible ? <HiEye size={13} /> : <HiEyeOff size={13} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLock(element.id); }}
          title={element.locked ? 'Unlock' : 'Lock'}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${element.locked ? 'text-amber-400' : 'text-white/50'}`}
        >
          {element.locked ? <HiLockClosed size={13} /> : <HiLockOpen size={13} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(element.id); }}
          title="Duplicate"
          className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <HiDuplicate size={13} />
        </button>
        {element.type !== 'background' && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
            title="Delete"
            className="p-1 rounded hover:bg-red-500/20 text-red-400/50 hover:text-red-400 transition-colors"
          >
            <HiTrash size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function LayerPanel({ onAddElement }) {
  const dispatch = useDispatch();
  const elements = useSelector(selectElements);
  const selectedId = useSelector(selectSelectedElementId);

  const [dragFromIndex, setDragFromIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Sort by zIndex descending for display (highest = top = first row)
  const sorted = [...elements].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));

  const handleDrop = (toIndex) => {
    if (dragFromIndex === null || dragFromIndex === toIndex) return;
    dispatch(reorderElements({ fromIndex: dragFromIndex, toIndex }));
    setDragFromIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1019] border-r border-white/8">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/8 shrink-0">
        <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">Layers</span>
        <button
          onClick={onAddElement}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <HiPlus size={13} />
          Add
        </button>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
        {sorted.length === 0 && (
          <div className="text-center py-8 text-white/20 text-xs">No elements yet</div>
        )}
        {sorted.map((el, i) => (
          <LayerRow
            key={el.id}
            element={el}
            index={i}
            isSelected={selectedId === el.id}
            isDragOver={dragOverIndex === i}
            onSelect={(id) => dispatch(setSelectedElement(id === selectedId ? null : id))}
            onToggleVisibility={(id) => dispatch(toggleVisibility(id))}
            onToggleLock={(id) => dispatch(toggleLock(id))}
            onDelete={(id) => dispatch(deleteElement(id))}
            onDuplicate={(id) => dispatch(duplicateElement(id))}
            onDragStart={(idx) => setDragFromIndex(idx)}
            onDragOver={(idx) => setDragOverIndex(idx)}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Footer: counts */}
      <div className="px-3 py-2 border-t border-white/8 shrink-0">
        <p className="text-[10px] text-white/25">{elements.length} layers</p>
      </div>
    </div>
  );
}

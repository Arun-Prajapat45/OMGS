'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef, useCallback } from 'react';
import {
  selectSelectedElement, selectCanvas,
  updateElement, setCanvas, bringForward, sendBackward,
  deleteElement, duplicateElement, toggleVisibility, toggleLock,
  commitHistory,
} from '@/store/slices/templateBuilderSlice';
import AssetUploader from './AssetUploader';
import {
  HiTrash, HiDuplicate, HiEye, HiEyeOff, HiLockClosed, HiLockOpen,
  HiChevronUp, HiChevronDown, HiEmojiHappy
} from 'react-icons/hi';
import EmojiPicker from 'emoji-picker-react';

const BLEND_MODES = [
  'source-over', 'multiply', 'screen', 'overlay',
  'soft-light', 'hard-light', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'difference', 'exclusion',
];

const MASK_TYPES = [
  { value: 'rectangle', label: '⬜  Rectangle' },
  { value: 'rounded_rectangle', label: '▢  Rounded Rectangle' },
  { value: 'circle', label: '⭕  Circle' },
  { value: 'oval', label: '🟠  Oval' },
  { value: 'hexagon', label: '⬡  Hexagon' },
  { value: 'triangle', label: '🔺  Triangle' },
  { value: 'diamond', label: '♦  Diamond' },
  { value: 'star', label: '⭐  Star' },
  { value: 'heart', label: '❤️  Heart' },
  { value: 'egg', label: '🥚  Egg' },
  { value: 'cloud', label: '☁️  Cloud' },
  { value: 'svg', label: '🖊  Custom SVG' },
];

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Playfair Display',
  'Dancing Script', 'Pacifico', 'Oswald', 'Raleway', 'Lato',
  'Georgia', 'Times New Roman', 'Arial', 'Verdana',
];

const SHAPE_TYPES = ['rectangle', 'circle', 'hexagon', 'triangle'];

// Small reusable label+input
function Field({ label, children, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-[10px] uppercase tracking-wider text-white/35 font-medium">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max, step = 1, placeholder = '' }) {
  return (
    <input
      type="number"
      value={value ?? ''}
      min={min} max={max} step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60 transition-colors"
    />
  );
}

function TextInput({ value, onChange, placeholder = '' }) {
  return (
    <input
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60 transition-colors"
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60 transition-colors"
      style={{ colorScheme: 'dark' }}
    >
      {options.map((o) => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value} className="bg-gray-900">
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  );
}

function Slider({ value, onChange, min = 0, max = 1, step = 0.01 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min} max={max} step={step}
        value={value ?? min}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6366f1 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
          WebkitAppearance: 'none',
        }}
      />
      <span className="text-[10px] text-white/40 w-8 text-right shrink-0">
        {typeof value === 'number' ? (max <= 1 ? Math.round(value * 100) + '%' : Math.round(value)) : ''}
      </span>
    </div>
  );
}

function Divider({ title }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest shrink-0">{title}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

// ─── Section renderers per element type ────────────────────────────────────────

const FEATHER_TYPES = [
  { value: 'none', label: '— None' },
  { value: 'radial', label: '◎ Radial Fade' },
  { value: 'vignette', label: '◼ Vignette' },
  { value: 'linear-top', label: '↑ Linear (Top)' },
  { value: 'linear-bottom', label: '↓ Linear (Bottom)' },
  { value: 'linear-left', label: '← Linear (Left)' },
  { value: 'linear-right', label: '→ Linear (Right)' },
];

const PHOTO_BLEND_MODES = [
  'source-over', 'multiply', 'screen', 'overlay',
  'soft-light', 'hard-light', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'luminosity',
];

function SectionToggle({ label, icon, enabled, onToggle, children }) {
  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${enabled
      ? 'border-indigo-500/40 bg-indigo-500/5'
      : 'border-white/8 bg-white/2'
      }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className={`text-xs font-semibold tracking-wide ${enabled ? 'text-indigo-300' : 'text-white/50'}`}>
            {label}
          </span>
        </div>
        <div className={`w-8 h-4 rounded-full transition-all relative shrink-0 ${enabled ? 'bg-indigo-500' : 'bg-white/15'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-4.5 left-[18px]' : 'left-0.5'}`} />
        </div>
      </button>
      {enabled && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-white/8 pt-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

function ImagePlaceholderProps({ el, update }) {
  const fx = el.photoEffects || {};

  // Helper: update only a nested photoEffects key
  const updateFx = (changes) => update({ photoEffects: { ...fx, ...changes } });

  // Color reset
  const resetColors = () => updateFx({ brightness: 0, contrast: 0, saturation: 0, warmth: 0, hue: 0 });

  const hasColorChange = fx.brightness !== 0 || fx.contrast !== 0 || fx.saturation !== 0 || fx.warmth !== 0 || fx.hue !== 0;

  return (
    <>
      {/* ── Photo Slot Core ── */}
      <Divider title="Photo Slot" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Upload Slot #">
          <NumberInput value={el.uploadSlot} onChange={(v) => update({ uploadSlot: v })} min={1} />
        </Field>
        <Field label="Secondary Transition">
          <div className="flex items-center gap-2 h-[30px]">
            <input
              type="checkbox"
              checked={!!el.secondaryTransition}
              onChange={(e) => update({ secondaryTransition: e.target.checked })}
              className="rounded bg-black/20 border-white/10 w-4 h-4 accent-indigo-500"
            />
            <span className="text-xs text-white/60">Hover FX</span>
          </div>
        </Field>
      </div>

      {/* ── Admin Preview Image ── */}
      <Divider title="Preview Image (Admin Only)" />
      <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 px-3 py-2 mb-1.5">
        <p className="text-[10px] text-amber-300/80 leading-relaxed">
          <span className="font-semibold text-amber-300">Admin Preview:</span> Upload a test photo to preview mixing &amp; effects live on canvas.
          This image is <span className="text-white/50">not saved</span> to the template — customers upload their own.
        </p>
      </div>
      <AssetUploader
        currentUrl={el.adminPreviewImageUrl}
        label="Upload Test Photo"
        onUploaded={(url) => update({ adminPreviewImageUrl: url })}
      />

      {/* ── Mask Shape ── */}
      <Divider title="Mask & Shape" />
      <div className="space-y-2.5">
        <Field label="Mask Shape">
          <SelectInput value={el.mask?.type} onChange={(v) => update({ mask: { ...el.mask, type: v } })} options={MASK_TYPES} />
        </Field>
        {el.mask?.type === 'svg' && (
          <Field label="SVG Path">
            <textarea
              value={el.mask?.svgPath || ''}
              onChange={(e) => update({ mask: { ...el.mask, svgPath: e.target.value } })}
              rows={3}
              placeholder="M 0 0 L ..."
              className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60 resize-none font-mono"
            />
          </Field>
        )}
        <Field label={`Soft Edge Blur (${el.mask?.softEdge ?? 0}px)`}>
          <Slider value={el.mask?.softEdge ?? 0} onChange={(v) => update({ mask: { ...el.mask, softEdge: v } })} min={0} max={100} step={1} />
        </Field>
      </div>

      {/* ── Crop Defaults ── */}
      <Divider title="Crop Defaults" />
      <div className="grid grid-cols-3 gap-2">
        <Field label="Crop X">
          <NumberInput value={el.crop?.cropX} onChange={(v) => update({ crop: { ...el.crop, cropX: v } })} step={1} />
        </Field>
        <Field label="Crop Y">
          <NumberInput value={el.crop?.cropY} onChange={(v) => update({ crop: { ...el.crop, cropY: v } })} step={1} />
        </Field>
        <Field label="Scale">
          <NumberInput value={el.crop?.cropScale} onChange={(v) => update({ crop: { ...el.crop, cropScale: v } })} step={0.1} min={0.1} />
        </Field>
      </div>

      {/* ── Photo Blend / Mix ── */}
      <Divider title="Photo Blend & Mix" />
      <Field label="Blend Mode">
        <SelectInput
          value={fx.photoBlendMode || 'source-over'}
          onChange={(v) => updateFx({ photoBlendMode: v })}
          options={PHOTO_BLEND_MODES}
        />
      </Field>
      <Field label={`Mix Opacity (${Math.round((fx.photoBlendOpacity ?? 1) * 100)}%)`}>
        <Slider value={fx.photoBlendOpacity ?? 1} onChange={(v) => updateFx({ photoBlendOpacity: v })} min={0} max={1} step={0.01} />
      </Field>

      {/* ══ SOFT EDGE FEATHERING ══ */}
      <Divider title="Soft Edge Feathering" />
      <div className="space-y-2.5">
        <Field label="Feather Type">
          <SelectInput
            value={fx.featherType || 'none'}
            onChange={(v) => updateFx({ featherType: v })}
            options={FEATHER_TYPES}
          />
        </Field>
        {(fx.featherType && fx.featherType !== 'none') && (
          <>
            <Field label={`Feather Radius (${Math.round(fx.featherRadius ?? 0)}%)`}>
              <Slider value={fx.featherRadius ?? 0} onChange={(v) => updateFx({ featherRadius: v })} min={0} max={100} step={1} />
            </Field>
            <Field label={`Edge Blur (${fx.edgeBlur ?? 0}px)`}>
              <Slider value={fx.edgeBlur ?? 0} onChange={(v) => updateFx({ edgeBlur: v })} min={0} max={20} step={0.5} />
            </Field>
          </>
        )}
        {(!fx.featherType || fx.featherType === 'none') && (
          <p className="text-[10px] text-white/25 italic px-0.5">Select a feather type to soften edges</p>
        )}
      </div>

      {/* ══ COLOR MATCHING SYSTEM ══ */}
      <Divider title="Color Matching" />
      <div className="space-y-2.5">
        <div className="rounded-lg bg-indigo-500/8 border border-indigo-500/20 px-3 py-2">
          <p className="text-[10px] text-indigo-300/80 leading-relaxed">
            Automatically tune uploaded photo colors to match template palette.
          </p>
        </div>

        <Field label={`Brightness (${fx.brightness > 0 ? '+' : ''}${Math.round(fx.brightness ?? 0)})`}>
          <Slider value={fx.brightness ?? 0} onChange={(v) => updateFx({ brightness: Math.round(v) })} min={-100} max={100} step={1} />
        </Field>
        <Field label={`Contrast (${fx.contrast > 0 ? '+' : ''}${Math.round(fx.contrast ?? 0)})`}>
          <Slider value={fx.contrast ?? 0} onChange={(v) => updateFx({ contrast: Math.round(v) })} min={-100} max={100} step={1} />
        </Field>
        <Field label={`Saturation (${fx.saturation > 0 ? '+' : ''}${Math.round(fx.saturation ?? 0)})`}>
          <Slider value={fx.saturation ?? 0} onChange={(v) => updateFx({ saturation: Math.round(v) })} min={-100} max={100} step={1} />
        </Field>

        {/* Warmth uses a warm/cool color spectrum indicator */}
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-white/35 font-medium">
            Warmth ({fx.warmth > 0 ? '+' : ''}{Math.round(fx.warmth ?? 0)})
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-sky-400 shrink-0">❄ Cool</span>
            <input
              type="range" min={-100} max={100} step={1}
              value={fx.warmth ?? 0}
              onChange={(e) => updateFx({ warmth: parseInt(e.target.value) })}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #38bdf8, #93c5fd ${Math.max(0, (fx.warmth ?? 0) + 100) / 2}%, #f97316 ${Math.min(100, (fx.warmth ?? 0) + 100) / 2 + 50}%, #fb923c)`,
                WebkitAppearance: 'none',
              }}
            />
            <span className="text-[9px] text-orange-400 shrink-0">Warm 🔥</span>
          </div>
        </div>

        <Field label={`Hue Shift (${fx.hue > 0 ? '+' : ''}${Math.round(fx.hue ?? 0)}°)`}>
          <div className="flex items-center gap-2">
            <input
              type="range" min={-180} max={180} step={1}
              value={fx.hue ?? 0}
              onChange={(e) => updateFx({ hue: parseInt(e.target.value) })}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
                WebkitAppearance: 'none',
              }}
            />
            <span className="text-[10px] text-white/40 w-8 text-right shrink-0">{Math.round(fx.hue ?? 0)}°</span>
          </div>
        </Field>

        {hasColorChange && (
          <button
            onClick={resetColors}
            className="w-full text-xs py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors"
          >
            ↺ Reset Colors
          </button>
        )}
      </div>

      {/* ══ SPARKLE / LIGHT EFFECTS ══ */}
      <Divider title="Sparkle & Light Effects" />
      <div className="space-y-2.5">
        <SectionToggle
          label="Sparkle Effect"
          icon="✨"
          enabled={!!fx.sparkleEnabled}
          onToggle={() => updateFx({ sparkleEnabled: !fx.sparkleEnabled })}
        >
          <Field label={`Sparkle Count (${fx.sparkleCount ?? 8})`}>
            <Slider value={fx.sparkleCount ?? 8} onChange={(v) => updateFx({ sparkleCount: Math.round(v) })} min={1} max={30} step={1} />
          </Field>
          <Field label={`Size (${fx.sparkleSize ?? 14}px)`}>
            <Slider value={fx.sparkleSize ?? 14} onChange={(v) => updateFx({ sparkleSize: Math.round(v) })} min={4} max={40} step={1} />
          </Field>
          <Field label={`Opacity (${Math.round((fx.sparkleOpacity ?? 0.9) * 100)}%)`}>
            <Slider value={fx.sparkleOpacity ?? 0.9} onChange={(v) => updateFx({ sparkleOpacity: v })} min={0} max={1} step={0.01} />
          </Field>
          <Field label="Sparkle Color">
            <div className="flex gap-1.5 items-center">
              <input
                type="color"
                value={fx.sparkleColor || '#ffffff'}
                onChange={(e) => updateFx({ sparkleColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
              />
              <TextInput value={fx.sparkleColor || '#ffffff'} onChange={(v) => updateFx({ sparkleColor: v })} placeholder="#ffffff" />
            </div>
          </Field>
          <Field label="Glow Halo">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!fx.sparkleGlow}
                onChange={(e) => updateFx({ sparkleGlow: e.target.checked })}
                className="w-4 h-4 accent-indigo-500"
              />
              <span className="text-xs text-white/60">Draw glow halo behind sparkles</span>
            </div>
          </Field>
        </SectionToggle>
      </div>

      {/* ══ GLASS REFLECTION ══ */}
      <Divider title="Glass Reflection" />
      <div className="space-y-2.5">
        <SectionToggle
          label="Glass / Shine Effect"
          icon="🪟"
          enabled={!!fx.glassEnabled}
          onToggle={() => updateFx({ glassEnabled: !fx.glassEnabled })}
        >
          <Field label={`Opacity (${Math.round((fx.glassOpacity ?? 0.28) * 100)}%)`}>
            <Slider value={fx.glassOpacity ?? 0.28} onChange={(v) => updateFx({ glassOpacity: v })} min={0} max={1} step={0.01} />
          </Field>
          <Field label={`Shine Angle (${fx.glassAngle ?? 135}°)`}>
            <Slider value={fx.glassAngle ?? 135} onChange={(v) => updateFx({ glassAngle: Math.round(v) })} min={0} max={360} step={1} />
          </Field>
          <Field label={`Shine Width (${Math.round((fx.glassWidth ?? 0.3) * 100)}%)`}>
            <Slider value={fx.glassWidth ?? 0.3} onChange={(v) => updateFx({ glassWidth: v })} min={0.05} max={0.8} step={0.01} />
          </Field>
          <Field label="Shine Color">
            <div className="flex gap-1.5 items-center">
              <input
                type="color"
                value={fx.glassColor || '#ffffff'}
                onChange={(e) => updateFx({ glassColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
              />
              <TextInput value={fx.glassColor || '#ffffff'} onChange={(v) => updateFx({ glassColor: v })} placeholder="#ffffff" />
            </div>
          </Field>
        </SectionToggle>
      </div>
    </>
  );
}

function TextProps({ el, update }) {
  return (
    <>
      <Divider title="Text Content" />
      <Field label="Text">
        <textarea
          value={el.text || ''}
          onChange={(e) => update({ text: e.target.value })}
          rows={2}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60 resize-none"
        />
      </Field>
      <Divider title="Typography" />
      <Field label="Font Family">
        <SelectInput value={el.fontFamily} onChange={(v) => update({ fontFamily: v })} options={FONT_FAMILIES} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Font Size">
          <NumberInput value={el.fontSize} onChange={(v) => update({ fontSize: v })} min={4} max={800} />
        </Field>
        <Field label="Color">
          <div className="flex gap-1.5 items-center">
            <input
              type="color"
              value={el.fill || '#ffffff'}
              onChange={(e) => update({ fill: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
            />
            <TextInput value={el.fill} onChange={(v) => update({ fill: v })} placeholder="#ffffff" />
          </div>
        </Field>
      </div>
      <Field label="Style">
        <div className="flex gap-1.5 flex-wrap">
          {['normal', 'bold', 'italic', 'bold italic'].map((s) => (
            <button
              key={s}
              onClick={() => update({ fontStyle: s })}
              className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${el.fontStyle === s ? 'bg-indigo-600 text-white' : 'bg-white/8 text-white/50 hover:bg-white/12'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Align">
        <div className="flex gap-1.5">
          {['left', 'center', 'right'].map((a) => (
            <button
              key={a}
              onClick={() => update({ align: a })}
              className={`flex-1 py-1 rounded text-xs capitalize transition-colors ${el.align === a ? 'bg-indigo-600 text-white' : 'bg-white/8 text-white/50 hover:bg-white/12'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Letter Spacing">
        <Slider value={el.letterSpacing ?? 0} onChange={(v) => update({ letterSpacing: v })} min={-5} max={30} step={0.5} />
      </Field>
    </>
  );
}

function TextMaskProps({ el, update }) {
  return (
    <>
      <Divider title="Typography Mask" />
      <div className="rounded-lg bg-pink-500/10 border border-pink-500/20 px-3 py-2 mb-2">
        <p className="text-[10px] text-pink-300/80 leading-relaxed">
          <span className="font-semibold text-pink-300">Typography Mask:</span> Uploaded photos will be clipped INSIDE the text shape.
        </p>
      </div>

      <Field label="Text (word/phrase)">
        <TextInput value={el.text} onChange={(v) => update({ text: v })} placeholder="MOM" />
      </Field>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Field label="Font Family">
          <SelectInput value={el.fontFamily} onChange={(v) => update({ fontFamily: v })} options={FONT_FAMILIES} />
        </Field>
        <Field label="Font Size">
          <NumberInput value={el.fontSize} onChange={(v) => update({ fontSize: v })} min={50} max={1200} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Field label="Letter Spacing">
          <NumberInput value={el.letterSpacing || 0} onChange={(v) => update({ letterSpacing: v })} min={-20} max={100} />
        </Field>
        <Field label="Text Color (Fallback)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={el.fill || '#ffffff'}
              onChange={(e) => update({ fill: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <span className="text-xs text-white/70 font-mono uppercase">{el.fill || '#ffffff'}</span>
          </div>
        </Field>
      </div>

      <Field label="Font Style" className="mt-2">
        <div className="flex gap-1.5">
          {['normal', 'bold', 'italic'].map((s) => (
            <button key={s} onClick={() => update({ fontStyle: s })}
              className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${el.fontStyle === s ? 'bg-indigo-600 text-white' : 'bg-white/8 text-white/50 hover:bg-white/12'}`}>
              {s}
            </button>
          ))}
        </div>
      </Field>

      <Divider title="Photo Upload & Position" />
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Field label="Upload Slot #">
          <NumberInput value={el.uploadSlot} onChange={(v) => update({ uploadSlot: v })} min={1} />
        </Field>
      </div>

      <Field label="Admin Test Photo">
        <AssetUploader
          currentUrl={el.adminPreviewImageUrl}
          label="Upload Test Photo"
          onUploaded={(url) => update({ adminPreviewImageUrl: url })}
        />
      </Field>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Field label="Crop X">
          <NumberInput value={el.crop?.cropX} onChange={(v) => update({ crop: { ...el.crop, cropX: v } })} step={1} />
        </Field>
        <Field label="Crop Y">
          <NumberInput value={el.crop?.cropY} onChange={(v) => update({ crop: { ...el.crop, cropY: v } })} step={1} />
        </Field>
        <Field label="Scale">
          <NumberInput value={el.crop?.cropScale} onChange={(v) => update({ crop: { ...el.crop, cropScale: v } })} step={0.1} min={0.1} />
        </Field>
      </div>
    </>
  );
}

function ImageAssetProps({ el, update, label = 'Overlay Image' }) {
  const isOverlay = el.type === 'overlay';
  const isSticker = el.type === 'sticker';
  // Default centerOpacity to 1 (no hole) if not set
  const centerOpacity = typeof el.centerOpacity === 'number' ? el.centerOpacity : 1;
  const hasCenterHole = centerOpacity < 1;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiObj) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="80">${emojiObj.emoji}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    update({ src: dataUrl });
    setShowEmojiPicker(false);
  };

  return (
    <>
      <Divider title={label} />

      {isSticker && (
        <div className="mb-4 space-y-2">
          <Field label="Choose Emoji Sticker">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-full flex items-center justify-center gap-2 bg-black/30 border border-white/10 hover:border-indigo-500/50 rounded-lg py-2 text-white/80 transition-colors text-sm"
            >
              <HiEmojiHappy className="w-5 h-5 text-amber-400" />
              {showEmojiPicker ? 'Close Emoji Picker' : 'Open Emoji Picker'}
            </button>
          </Field>

          {showEmojiPicker && (
            <div className="mt-2 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                width="100%"
                height={300}
                searchPlaceholder="Search emojis..."
                lazyLoadEmojis={true}
              />
            </div>
          )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-white/30 text-[10px] uppercase tracking-wider font-semibold">Or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
        </div>
      )}

      <Field label="Asset File (PNG/WebP/SVG)">
        <AssetUploader
          currentUrl={el.src}
          label="Upload Asset"
          onUploaded={(url) => update({ src: url })}
        />
      </Field>

      {/* Overlay-specific transparency controls */}
      {isOverlay && (
        <>
          <Divider title="Center Transparency" />
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 mb-1">
            <p className="text-[10px] text-indigo-300/80 leading-relaxed">
              <span className="font-semibold text-indigo-300">Center Opacity:</span> Set how opaque the center of this overlay is.{' '}
              <span className="text-white/40">0% = fully transparent hole in center (user photo shows through), 100% = solid overlay.</span>
            </p>
          </div>
          <Field label={`Center Opacity (${Math.round(centerOpacity * 100)}%)`}>
            <Slider
              value={centerOpacity}
              onChange={(v) => update({ centerOpacity: parseFloat(v.toFixed(2)) })}
              min={0}
              max={1}
              step={0.01}
            />
          </Field>

          {/* Only show shape/size if there's actually a hole (opacity < 1) */}
          {hasCenterHole && (
            <>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Field label="Hole Shape">
                  <SelectInput
                    value={el.holeShape || 'radial'}
                    onChange={(v) => update({ holeShape: v })}
                    options={[
                      { value: 'radial', label: 'Radial Gradient' },
                      { value: 'rectangle', label: 'Rectangle' },
                      { value: 'rounded_rectangle', label: 'Rounded Rect' },
                      { value: 'circle', label: 'Circle' },
                      { value: 'oval', label: 'Oval' },
                      { value: 'hexagon', label: 'Hexagon' },
                    ]}
                  />
                </Field>
                <Field label={`Hole Size (${Math.round((el.holeSize || 0.5) * 100)}%)`}>
                  <Slider
                    value={el.holeSize || 0.5}
                    onChange={(v) => update({ holeSize: parseFloat(v.toFixed(2)) })}
                    min={0.1}
                    max={1}
                    step={0.01}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 mt-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <p className="text-[10px] text-amber-300/80">
                  Center hole active — photo upload region is clickable underneath.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}


function ShapeProps({ el, update }) {
  return (
    <>
      <Divider title="Shape" />
      <Field label="Shape Type">
        <SelectInput value={el.shapeType} onChange={(v) => update({ shapeType: v })} options={SHAPE_TYPES} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Fill Color">
          <div className="flex gap-1.5 items-center">
            <input type="color" value={el.fill?.replace(/rgba?\([^)]+\)/i, '#6366f1') || '#6366f1'}
              onChange={(e) => update({ fill: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0" />
            <TextInput value={el.fill} onChange={(v) => update({ fill: v })} placeholder="#6366f1" />
          </div>
        </Field>
        <Field label="Stroke Color">
          <TextInput value={el.stroke} onChange={(v) => update({ stroke: v })} placeholder="#ffffff" />
        </Field>
      </div>
      <Field label="Stroke Width">
        <NumberInput value={el.strokeWidth} onChange={(v) => update({ strokeWidth: v })} min={0} max={40} />
      </Field>
      <Field label="Corner Radius">
        <NumberInput value={el.cornerRadius} onChange={(v) => update({ cornerRadius: v })} min={0} max={150} />
      </Field>
    </>
  );
}

function SvgMaskProps({ el, update }) {
  return (
    <>
      <Divider title="SVG Mask" />
      <Field label="SVG Path Data">
        <textarea
          value={el.svgPath || ''}
          onChange={(e) => update({ svgPath: e.target.value })}
          rows={4}
          placeholder="M 0 0 L 100 0 L 100 100 Z"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/60 resize-none font-mono"
        />
      </Field>
      <Field label="Upload Slot #">
        <NumberInput value={el.uploadSlot} onChange={(v) => update({ uploadSlot: v })} min={1} />
      </Field>
    </>
  );
}

function BackgroundProps({ el, update, canvas, updateCanvas }) {
  return (
    <>
      <Divider title="Background" />
      <Field label="Background Color">
        <div className="flex gap-1.5 items-center">
          <input type="color" value={el.backgroundColor || canvas.backgroundColor || '#ffffff'}
            onChange={(e) => update({ backgroundColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0" />
          <TextInput value={el.backgroundColor || canvas.backgroundColor} onChange={(v) => update({ backgroundColor: v })} placeholder="#ffffff" />
        </div>
      </Field>
      <Field label="Background Image (optional)">
        <AssetUploader currentUrl={el.src} label="Upload Background" onUploaded={(url) => update({ src: url })} />
      </Field>
      <Divider title="Border" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Stroke Color">
          <TextInput value={el.stroke} onChange={(v) => update({ stroke: v })} placeholder="#ffffff" />
        </Field>
        <Field label="Stroke Width">
          <NumberInput value={el.strokeWidth} onChange={(v) => update({ strokeWidth: v })} min={0} max={20} />
        </Field>
      </div>
      <Field label="Corner Radius">
        <NumberInput value={el.cornerRadius} onChange={(v) => update({ cornerRadius: v })} min={0} max={200} />
      </Field>
    </>
  );
}

// ─── Main Properties Panel ──────────────────────────────────────────────────────
export default function PropertiesPanel() {
  const dispatch = useDispatch();
  const el = useSelector(selectSelectedElement);
  const canvas = useSelector(selectCanvas);

  // Debounce commitHistory so rapid slider moves don't flood history
  const commitTimerRef = useRef(null);
  const scheduleCommit = useCallback(() => {
    clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => {
      dispatch(commitHistory());
    }, 600);
  }, [dispatch]);

  if (!el) {
    return (
      <div className="flex flex-col h-full bg-[#0f1019] border-l border-white/8 items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        </div>
        <p className="text-white/30 text-sm font-medium">No element selected</p>
        <p className="text-white/20 text-xs mt-1">Click an element on the canvas or in the layer panel</p>
      </div>
    );
  }

  const update = (changes) => {
    dispatch(updateElement({ id: el.id, ...changes }));
    scheduleCommit();
  };
  const updateCanvas = (changes) => dispatch(setCanvas(changes));

  return (
    <div className="flex flex-col h-full bg-[#0f1019] border-l border-white/8">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/8 shrink-0">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white/70 truncate">{el.name || el.type}</p>
          <p className="text-[10px] text-white/30 capitalize">{el.type.replace(/-/g, ' ')}</p>
        </div>
        {/* Quick actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => dispatch(toggleVisibility(el.id))} title={el.visible ? 'Hide' : 'Show'}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${el.visible ? 'text-white/50' : 'text-white/20'}`}>
            {el.visible ? <HiEye size={15} /> : <HiEyeOff size={15} />}
          </button>
          <button onClick={() => dispatch(toggleLock(el.id))} title={el.locked ? 'Unlock' : 'Lock'}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${el.locked ? 'text-amber-400' : 'text-white/50'}`}>
            {el.locked ? <HiLockClosed size={15} /> : <HiLockOpen size={15} />}
          </button>
          <button onClick={() => dispatch(duplicateElement(el.id))} title="Duplicate"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <HiDuplicate size={15} />
          </button>
          {el.type !== 'background' && (
            <button onClick={() => dispatch(deleteElement(el.id))} title="Delete"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/50 hover:text-red-400 transition-colors">
              <HiTrash size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 builder-scrollbar">

        {/* Element name */}
        <Field label="Layer Name">
          <TextInput value={el.name} onChange={(v) => update({ name: v })} placeholder={el.type} />
        </Field>

        {/* ── Position & Size ── */}
        <>
          <Divider title="Position & Size" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="X">
              <NumberInput value={el.x} onChange={(v) => update({ x: v })} />
            </Field>
            <Field label="Y">
              <NumberInput value={el.y} onChange={(v) => update({ y: v })} />
            </Field>
            <Field label="Width">
              <NumberInput value={el.width} onChange={(v) => update({ width: v })} min={1} />
            </Field>
            <Field label="Height">
              <NumberInput value={el.height} onChange={(v) => update({ height: v })} min={1} />
            </Field>
          </div>
        </>

        {/* ── Transform ── */}
        <Divider title="Transform" />
        <Field label="Rotation (°)">
          <Slider value={el.rotation ?? 0} onChange={(v) => update({ rotation: v })} min={-180} max={180} step={1} />
        </Field>

        {/* ── Appearance ── */}
        <Divider title="Appearance" />
        <Field label="Opacity">
          <Slider value={el.opacity ?? 1} onChange={(v) => update({ opacity: v })} min={0} max={1} step={0.01} />
        </Field>
        <Field label="Blend Mode">
          <SelectInput value={el.blendMode} onChange={(v) => update({ blendMode: v })} options={BLEND_MODES} />
        </Field>

        {/* ── Z-Index Controls ── */}
        <Divider title="Z-Order" />
        <div className="flex items-center gap-2">
          <Field label="Z-Index" className="flex-1">
            <NumberInput value={el.zIndex} onChange={(v) => update({ zIndex: v })} min={0} max={999} />
          </Field>
          <div className="flex flex-col gap-1 pt-5">
            <button onClick={() => dispatch(bringForward(el.id))}
              className="p-1.5 bg-white/8 hover:bg-white/15 rounded text-white/50 hover:text-white transition-colors" title="Bring Forward">
              <HiChevronUp size={14} />
            </button>
            <button onClick={() => dispatch(sendBackward(el.id))}
              className="p-1.5 bg-white/8 hover:bg-white/15 rounded text-white/50 hover:text-white transition-colors" title="Send Backward">
              <HiChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* ── Type-specific properties ── */}
        {el.type === 'background' && <BackgroundProps el={el} update={update} canvas={canvas} updateCanvas={updateCanvas} />}
        {el.type === 'image-placeholder' && <ImagePlaceholderProps el={el} update={update} />}
        {el.type === 'text' && <TextProps el={el} update={update} />}
        {el.type === 'text-mask' && <TextMaskProps el={el} update={update} />}
        {(el.type === 'overlay' || el.type === 'frame') && <ImageAssetProps el={el} update={update} label={el.type === 'frame' ? 'Frame Image' : 'Overlay Image'} />}
        {(el.type === 'sticker' || el.type === 'texture' || el.type === 'shadow') && <ImageAssetProps el={el} update={update} label={el.type.charAt(0).toUpperCase() + el.type.slice(1) + ' Image'} />}
        {el.type === 'shape' && <ShapeProps el={el} update={update} />}
        {el.type === 'svg-mask' && <SvgMaskProps el={el} update={update} />}

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}

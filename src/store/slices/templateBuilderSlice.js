import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

// ─── Default element factories ─────────────────────────────────────────────────
export const DEFAULT_ELEMENT = {
  id: '',
  type: 'image-placeholder',
  x: 100,
  y: 100,
  width: 300,
  height: 300,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  visible: true,
  locked: false,
  zIndex: 0,
  blendMode: 'source-over',
  draggable: true,
  selectable: true,
  resizable: true,
  rotatable: true,
  name: '',
};

export function createDefaultElement(type, overrides = {}) {
  const base = { ...DEFAULT_ELEMENT, id: nanoid(), type, name: type, ...overrides };
  switch (type) {
    case 'background':
      return { ...base, x: 0, y: 0, width: 1200, height: 900, locked: true, draggable: false, resizable: false, rotatable: false, zIndex: 0, src: null, backgroundColor: '#ffffff', name: 'Background' };
    case 'image-placeholder':
      return {
        ...base,
        zIndex: 1,
        uploadSlot: 1,
        name: 'Photo Slot',
        mask: { type: 'rectangle' },
        crop: { cropX: 0, cropY: 0, cropScale: 1 },
        // Builder-only: admin test image URL (not used by user editor)
        adminPreviewImageUrl: null,
        // Photo effects — applied in both builder preview AND final user render
        photoEffects: {
          // ── Feathering ──
          featherType: 'none',   // 'none' | 'radial' | 'vignette' | 'linear-top' | 'linear-bottom'
          featherRadius: 0,      // 0–100 (percentage of element dimension)
          edgeBlur: 0,           // 0–20 px blur at boundary

          // ── Color matching ──
          brightness: 0,         // -100 to 100
          contrast: 0,           // -100 to 100
          saturation: 0,         // -100 to 100
          warmth: 0,             // -100 to 100  (warm/cool tint)
          hue: 0,                // -180 to 180 degrees

          // ── Photo blend / mix ──
          photoBlendMode: 'source-over',
          photoBlendOpacity: 1,

          // ── Sparkle / light effects ──
          sparkleEnabled: false,
          sparkleCount: 8,
          sparkleSize: 14,
          sparkleOpacity: 0.9,
          sparkleColor: '#ffffff',
          sparkleGlow: true,

          // ── Glass reflection ──
          glassEnabled: false,
          glassOpacity: 0.28,
          glassAngle: 135,       // degrees
          glassWidth: 0.30,      // fraction of element width
          glassColor: '#ffffff',
        },
      };
    case 'overlay':
      return { ...base, src: null, locked: true, draggable: false, zIndex: 10, name: 'Overlay', width: 400, height: 300, centerOpacity: 1 };
    case 'sticker':
      return { ...base, src: null, locked: false, zIndex: 8, name: 'Sticker', width: 120, height: 120 };
    case 'text':
      return { ...base, text: 'Your Text Here', fontFamily: 'Inter', fontSize: 48, fill: '#ffffff', fontStyle: 'bold', align: 'center', zIndex: 12, name: 'Text', width: 400, height: 80 };
    case 'text-mask':
      return { ...base, text: 'M', fontFamily: 'Montserrat', fontSize: 400, fill: '#000000', zIndex: 5, uploadSlot: 1, name: 'Typography Mask', width: 320, height: 450 };
    case 'shape':
      return { ...base, shapeType: 'rectangle', fill: 'rgba(99,102,241,0.4)', stroke: '#6366f1', strokeWidth: 2, cornerRadius: 0, zIndex: 3, name: 'Shape' };
    case 'texture':
      return { ...base, src: null, blendMode: 'multiply', opacity: 0.6, zIndex: 11, name: 'Texture', locked: true };
    case 'shadow':
      return { ...base, src: null, blendMode: 'multiply', opacity: 0.5, zIndex: 9, name: 'Shadow', locked: true };
    case 'frame':
      return { ...base, src: null, locked: true, zIndex: 7, name: 'Frame' };
    case 'svg-mask':
      return { ...base, svgPath: '', fill: '#6366f1', zIndex: 4, name: 'SVG Mask' };
    default:
      return base;
  }
}

// ─── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  canvas: { width: 1200, height: 900, backgroundColor: '#ffffff' },
  elements: [],
  selectedElementId: null,
  zoom: 0.4,
  history: [],
  historyIndex: -1,
  templateMeta: {
    id: null,
    name: '',
    slug: '',
    productType: 'acrylic',
    shape: 'rectangle',
    isActive: true,
    previewImage: null,
  },
  isDirty: false,
};

// ─── Slice ─────────────────────────────────────────────────────────────────────
const templateBuilderSlice = createSlice({
  name: 'templateBuilder',
  initialState,
  reducers: {
    // Load a saved template into the builder
    loadTemplate(state, action) {
      const { template } = action.payload;
      const json = template.templateJson || {};

      state.templateMeta = {
        id: template.id || null,
        name: template.name || '',
        slug: template.slug || '',
        productType: template.productType || 'acrylic',
        shape: json.shape || 'rectangle',
        isActive: template.isActive !== false,
        previewImage: template.previewImage || null,
      };

      state.canvas = {
        width: template.canvasWidth || json.canvas?.width || 1200,
        height: template.canvasHeight || json.canvas?.height || 900,
        backgroundColor: json.canvas?.backgroundColor || '#ffffff',
      };

      // Support both new elements[] and legacy editableRegions[] formats
      if (json.elements && json.elements.length > 0) {
        state.elements = json.elements;
      } else {
        // Migrate legacy editableRegions to elements
        const regions = json.editableRegions || [];
        state.elements = [
          // Background element
          {
            ...createDefaultElement('background'),
            width: template.canvasWidth || 1200,
            height: template.canvasHeight || 900,
            backgroundColor: json.canvas?.backgroundColor || '#ffffff',
          },
          // Migrate each editable region
          ...regions.map((r, i) => ({
            ...createDefaultElement('image-placeholder'),
            ...r,
            type: 'image-placeholder',
            zIndex: i + 1,
            mask: { type: r.type || 'rectangle' },
          })),
        ];
      }

      // Assign zIndex by position if missing
      state.elements = state.elements.map((el, i) => ({
        ...el,
        zIndex: el.zIndex ?? i,
      }));

      state.selectedElementId = null;
      state.history = [JSON.stringify(state.elements)];
      state.historyIndex = 0;
      state.isDirty = false;
    },

    // Reset to blank canvas
    newTemplate(state) {
      const bgEl = createDefaultElement('background');
      bgEl.width = state.canvas.width;
      bgEl.height = state.canvas.height;
      state.elements = [bgEl];
      state.selectedElementId = null;
      state.templateMeta = { id: null, name: '', slug: '', productType: 'acrylic', shape: 'rectangle', isActive: true, previewImage: null };
      state.history = [JSON.stringify(state.elements)];
      state.historyIndex = 0;
      state.isDirty = false;
    },

    setCanvas(state, action) {
      state.canvas = { ...state.canvas, ...action.payload };
      // Update background element dimensions
      const bg = state.elements.find(el => el.type === 'background');
      if (bg) {
        if (action.payload.width) bg.width = action.payload.width;
        if (action.payload.height) bg.height = action.payload.height;
        if (action.payload.backgroundColor) bg.backgroundColor = action.payload.backgroundColor;
      }
      state.isDirty = true;
    },

    setTemplateMeta(state, action) {
      state.templateMeta = { ...state.templateMeta, ...action.payload };
      state.isDirty = true;
    },

    addElement(state, action) {
      const { type, overrides = {} } = action.payload;
      // Calculate next zIndex
      const maxZ = state.elements.reduce((m, el) => Math.max(m, el.zIndex ?? 0), 0);
      const el = createDefaultElement(type, { zIndex: maxZ + 1, ...overrides });
      state.elements.push(el);
      state.selectedElementId = el.id;
      state.isDirty = true;
      // Push to history
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(JSON.stringify(state.elements));
      state.historyIndex = state.history.length - 1;
    },

    updateElement(state, action) {
      const { id, ...updates } = action.payload;
      const el = state.elements.find(e => e.id === id);
      if (el) {
        Object.assign(el, updates);
        state.isDirty = true;
      }
    },

    // Commit current elements to history (call after drag/resize ends)
    commitHistory(state) {
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(JSON.stringify(state.elements));
      state.historyIndex = state.history.length - 1;
    },

    deleteElement(state, action) {
      state.elements = state.elements.filter(e => e.id !== action.payload);
      if (state.selectedElementId === action.payload) state.selectedElementId = null;
      state.isDirty = true;
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(JSON.stringify(state.elements));
      state.historyIndex = state.history.length - 1;
    },

    duplicateElement(state, action) {
      const orig = state.elements.find(e => e.id === action.payload);
      if (!orig) return;
      const maxZ = state.elements.reduce((m, el) => Math.max(m, el.zIndex ?? 0), 0);
      const clone = { ...orig, id: nanoid(), x: (orig.x || 0) + 20, y: (orig.y || 0) + 20, zIndex: maxZ + 1, name: (orig.name || orig.type) + ' Copy' };
      state.elements.push(clone);
      state.selectedElementId = clone.id;
      state.isDirty = true;
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(JSON.stringify(state.elements));
      state.historyIndex = state.history.length - 1;
    },

    reorderElements(state, action) {
      // action.payload = { fromIndex, toIndex } in the sorted (by zIndex desc) list
      const sorted = [...state.elements].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
      const [moved] = sorted.splice(action.payload.fromIndex, 1);
      sorted.splice(action.payload.toIndex, 0, moved);
      // Reassign zIndexes
      sorted.forEach((el, i) => {
        const orig = state.elements.find(e => e.id === el.id);
        if (orig) orig.zIndex = sorted.length - 1 - i;
      });
      state.isDirty = true;
    },

    bringForward(state, action) {
      const el = state.elements.find(e => e.id === action.payload);
      if (!el) return;
      const above = state.elements
        .filter(e => (e.zIndex ?? 0) > (el.zIndex ?? 0))
        .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))[0];
      if (above) {
        const tmp = above.zIndex;
        above.zIndex = el.zIndex;
        el.zIndex = tmp;
      }
      state.isDirty = true;
    },

    sendBackward(state, action) {
      const el = state.elements.find(e => e.id === action.payload);
      if (!el) return;
      const below = state.elements
        .filter(e => (e.zIndex ?? 0) < (el.zIndex ?? 0))
        .sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))[0];
      if (below) {
        const tmp = below.zIndex;
        below.zIndex = el.zIndex;
        el.zIndex = tmp;
      }
      state.isDirty = true;
    },

    setSelectedElement(state, action) {
      state.selectedElementId = action.payload;
    },

    setZoom(state, action) {
      state.zoom = Math.max(0.1, Math.min(3, action.payload));
    },

    undo(state) {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.elements = JSON.parse(state.history[state.historyIndex]);
        state.selectedElementId = null;
      }
    },

    redo(state) {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.elements = JSON.parse(state.history[state.historyIndex]);
        state.selectedElementId = null;
      }
    },

    toggleVisibility(state, action) {
      const el = state.elements.find(e => e.id === action.payload);
      if (el) el.visible = !el.visible;
    },

    toggleLock(state, action) {
      const el = state.elements.find(e => e.id === action.payload);
      if (el) {
        el.locked = !el.locked;
        el.draggable = !el.locked;
      }
    },
  },
});

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectCanvas = (state) => state.templateBuilder.canvas;
export const selectElements = (state) => state.templateBuilder.elements;
export const selectSortedElements = (state) =>
  [...state.templateBuilder.elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
export const selectSelectedElementId = (state) => state.templateBuilder.selectedElementId;
export const selectSelectedElement = (state) =>
  state.templateBuilder.elements.find(e => e.id === state.templateBuilder.selectedElementId);
export const selectBuilderZoom = (state) => state.templateBuilder.zoom;
export const selectTemplateMeta = (state) => state.templateBuilder.templateMeta;
export const selectIsDirty = (state) => state.templateBuilder.isDirty;
export const selectCanUndo = (state) => state.templateBuilder.historyIndex > 0;
export const selectCanRedo = (state) => state.templateBuilder.historyIndex < state.templateBuilder.history.length - 1;

export const {
  loadTemplate, newTemplate, setCanvas, setTemplateMeta,
  addElement, updateElement, deleteElement, duplicateElement,
  reorderElements, bringForward, sendBackward,
  setSelectedElement, setZoom,
  undo, redo, commitHistory,
  toggleVisibility, toggleLock,
} = templateBuilderSlice.actions;

export default templateBuilderSlice.reducer;

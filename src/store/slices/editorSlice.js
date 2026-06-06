import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  template: null,
  layers: [],
  textLayers: [],
  borderColors: {},
  selectedLayerId: null,
  stageRef: null,
  history: [],
  historyIndex: -1,
  zoom: 1,
  exportQuality: 3, // multiplier for high-res export
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setTemplate(state, action) {
      state.template = action.payload;
      // Support both new elements[] format and legacy editableRegions[] format
      const json = action.payload || {};
      const regions = json.elements
        ? json.elements.filter(el => el.type === 'image-placeholder' || el.type === 'text-mask' || el.type === 'svg-mask')
        : (json.editableRegions || []);

      state.layers = regions.map((region) => ({
        id: region.id,
        regionId: region.id,
        type: region.type || 'image-placeholder',
        uploadSlot: region.uploadSlot || 1,
        image: null,
        imageUrl: null,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        visible: true,
        backgroundColor: '',
      }));
    },
    setLayerImage(state, action) {
      const { regionId, imageUrl, naturalWidth, naturalHeight } = action.payload;
      const layer = state.layers.find((l) => l.regionId === regionId);
      if (layer) {
        layer.imageUrl = imageUrl;
        layer.naturalWidth = naturalWidth;
        layer.naturalHeight = naturalHeight;
      } else {
        state.layers.push({
          id: regionId,
          regionId,
          type: 'image',
          image: null,
          imageUrl,
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          visible: true,
          naturalWidth,
          naturalHeight,
        });
      }
    },
    updateLayer(state, action) {
      const { id, ...updates } = action.payload;
      const layer = state.layers.find((l) => l.id === id);
      if (layer) Object.assign(layer, updates);
    },
    setSelectedLayer(state, action) {
      state.selectedLayerId = action.payload;
    },
    setStageRef(state, action) {
      // Not serializable, stored as ref
      state.stageRef = action.payload;
    },
    setZoom(state, action) {
      state.zoom = Math.max(0.1, Math.min(5, action.payload));
    },
    resetEditor(state) {
      state.layers = [];
      state.textLayers = [];
      state.borderColors = {};
      state.selectedLayerId = null;
      state.history = [];
      state.historyIndex = -1;
      state.zoom = 1;
    },
    scaleEditorState(state, action) {
      const { scaleX, scaleY } = action.payload;
      const scale = Math.min(scaleX, scaleY);
      
      // Scale image layers (photos)
      state.layers.forEach((layer) => {
        layer.x = layer.x * scaleX;
        layer.y = layer.y * scaleY;
        layer.scaleX = layer.scaleX * scale;
        layer.scaleY = layer.scaleY * scale;
      });

      // Scale text layers
      state.textLayers.forEach((layer) => {
        layer.x = layer.x * scaleX;
        layer.y = layer.y * scaleY;
        layer.fontSize = layer.fontSize * scale;
      });
    },
    pushHistory(state, action) {
      // Trim redo history
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(action.payload);
      state.historyIndex = state.history.length - 1;
    },
    undo(state) {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.layers = state.history[state.historyIndex];
      }
    },
    redo(state) {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.layers = state.history[state.historyIndex];
      }
    },

    // ── Text Layer Management ─────────────────────────────────────────────────
    addTextLayer(state, action) {
      state.textLayers.push(action.payload);
    },
    updateTextLayer(state, action) {
      const { id, ...updates } = action.payload;
      const layer = state.textLayers.find((l) => l.id === id);
      if (layer) Object.assign(layer, updates);
    },
    removeTextLayer(state, action) {
      state.textLayers = state.textLayers.filter((l) => l.id !== action.payload);
    },

    // ── Shape / Border Color Overrides ─────────────────────────────────────────
    setBorderColor(state, action) {
      const { elementId, color } = action.payload;
      state.borderColors[elementId] = color;
    },
  },
});

export const selectTemplate = (state) => state.editor.template;
export const selectLayers = (state) => state.editor.layers;
export const selectTextLayers = (state) => state.editor.textLayers;
export const selectBorderColors = (state) => state.editor.borderColors;
export const selectSelectedLayer = (state) =>
  state.editor.layers.find((l) => l.id === state.editor.selectedLayerId);
export const selectSelectedLayerId = (state) => state.editor.selectedLayerId;
export const selectZoom = (state) => state.editor.zoom;
export const selectExportQuality = (state) => state.editor.exportQuality;

export const {
  setTemplate, setLayerImage, updateLayer, setSelectedLayer,
  setStageRef, setZoom, resetEditor, scaleEditorState, pushHistory, undo, redo,
  addTextLayer, updateTextLayer, removeTextLayer, setBorderColor,
} = editorSlice.actions;
export default editorSlice.reducer;

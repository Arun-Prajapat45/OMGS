'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  loadTemplate, newTemplate, addElement, deleteElement,
  selectTemplateMeta, selectCanvas, selectSortedElements, selectBuilderZoom,
  selectSelectedElementId, selectSelectedElement,
} from '@/store/slices/templateBuilderSlice';
import BuilderToolbar from './BuilderToolbar';
import LayerPanel from './LayerPanel';
import PropertiesPanel from './PropertiesPanel';
import AddElementMenu from './AddElementMenu';

// Dynamic import for Konva canvas (no SSR)
const BuilderCanvas = dynamic(() => import('./BuilderCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0d0e1a]">
      <div className="flex flex-col items-center gap-3 text-white/30">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading canvas engine…</p>
      </div>
    </div>
  ),
});

export default function TemplateBuilder({ templateId }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const meta = useSelector(selectTemplateMeta);
  const canvas = useSelector(selectCanvas);
  const elements = useSelector(selectSortedElements);
  const selectedElementId = useSelector(selectSelectedElementId);
  const selectedElement = useSelector(selectSelectedElement);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load template on mount
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        if (templateId && templateId !== 'new') {
          const res = await fetch(`/api/admin/templates/${templateId}`);
          if (!res.ok) throw new Error('Template not found');
          const { template } = await res.json();
          dispatch(loadTemplate({ template }));
        } else {
          dispatch(newTemplate());
        }
      } catch (err) {
        toast.error('Failed to load template');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [templateId, dispatch]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    if (!meta.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    setIsSaving(true);
    try {
      const templateJson = {
        canvas,
        elements,
        shape: meta.shape,
        productType: meta.productType,
        // Backward-compat: also derive editableRegions for user editor fallback
        editableRegions: elements
          .filter(el => el.type === 'image-placeholder')
          .map(el => ({
            id: el.id,
            type: el.mask?.type || 'rectangle',
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            rotation: el.rotation || 0,
          })),
      };

      const payload = {
        name: meta.name,
        slug: meta.slug,
        productType: meta.productType,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        isActive: meta.isActive,
        previewImage: meta.previewImage,
        templateJson,
      };

      const isNew = !meta.id || templateId === 'new';
      const url = isNew ? '/api/admin/templates' : `/api/admin/templates/${meta.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      const data = await res.json();
      toast.success(isNew ? 'Template created!' : 'Template saved!');

      // Redirect to edit URL if newly created
      if (isNew && data.template?.id) {
        router.replace(`/admin/template-builder/${data.template.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save template');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [meta, canvas, elements, isSaving, templateId, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Ignore if typing in an input/textarea
      const tag = document.activeElement?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'templateBuilder/undo' });
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        dispatch({ type: 'templateBuilder/redo' });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Delete / Backspace → delete selected element (only when not typing)
      if (!isTyping && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedElementId) {
          // Don't delete background
          const el = elements.find(el => el.id === selectedElementId);
          if (el && el.type !== 'background') {
            dispatch(deleteElement(selectedElementId));
            toast('Layer deleted', { icon: '🗑️' });
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, handleSave, selectedElementId, elements]);

  const handleAddElement = (type) => {
    dispatch(addElement({ type }));
    setShowAddMenu(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0b0c15] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading template builder…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-root" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Top Toolbar */}
      <BuilderToolbar
        onAddElement={() => setShowAddMenu(true)}
        onSave={handleSave}
        onBack={() => router.push('/admin')}
        isSaving={isSaving}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode(!previewMode)}
      />

      {/* Main 3-column layout */}
      <div className="builder-workspace">

        {/* Left: Layer Panel */}
        <div className="builder-sidebar-left">
          <LayerPanel onAddElement={() => setShowAddMenu(true)} />
        </div>

        {/* Center: Canvas */}
        <BuilderCanvas previewMode={previewMode} shape={meta.shape} />

        {/* Right: Properties Panel */}
        <div className="builder-sidebar-right">
          <PropertiesPanel />
        </div>
      </div>

      {/* Add Element Modal */}
      {showAddMenu && (
        <AddElementMenu
          onAdd={handleAddElement}
          onClose={() => setShowAddMenu(false)}
        />
      )}
    </div>
  );
}

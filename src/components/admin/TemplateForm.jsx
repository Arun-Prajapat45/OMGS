'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HiPlus, HiTrash, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { selectElements } from '@/store/slices/editorSlice';

const TemplatePreview = dynamic(() => import('@/components/admin/TemplatePreviewClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 glass rounded-3xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/40">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading template preview...</p>
      </div>
    </div>
  ),
});

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  slug: z.string().optional(),
  productType: z.string().min(1, 'Product type is required'),
  shape: z.string().min(1, 'Shape is required'),
  backgroundColor: z.string().optional(),
  previewImage: z.string().optional(),
  isActive: z.boolean().default(true),
  canvasWidth: z.coerce.number().min(100),
  canvasHeight: z.coerce.number().min(100),
  overlays: z.array(z.object({
    type: z.string().min(1),
    opacity: z.coerce.number().optional(),
    blend: z.string().optional(),
    color: z.string().optional(),
    width: z.coerce.number().optional(),
    angle: z.coerce.number().optional(),
    included: z.boolean().optional(),
  })).optional(),
  printSizes: z.array(z.object({
    label: z.string().min(1),
    width: z.coerce.number().min(0),
    height: z.coerce.number().min(0),
    price: z.coerce.number().min(0),
  })).optional(),
  thicknesses: z.array(z.object({
    label: z.string().min(1),
    price: z.coerce.number().min(0),
  })).optional(),
  textRegions: z.array(z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    x: z.coerce.number(),
    y: z.coerce.number(),
    defaultText: z.string().optional(),
    fontSize: z.coerce.number().optional(),
    fontFamily: z.string().optional(),
    fill: z.string().optional(),
    align: z.string().optional(),
  })).optional(),
  extras: z.array(z.object({
    type: z.string().min(1),
    included: z.boolean().optional(),
  })).optional(),
  editableRegions: z.array(z.object({
    id: z.string().min(1, 'ID required'),
    type: z.enum(['rectangle', 'rounded_rectangle', 'circle', 'hexagon', 'triangle', 'polygon']),
    x: z.coerce.number(),
    y: z.coerce.number(),
    width: z.coerce.number(),
    height: z.coerce.number(),
    rotation: z.coerce.number().default(0),
  })).optional(),
  elements: z.array(z.object({
    id: z.string().min(1, 'ID required'),
    type: z.enum(['rectangle', 'rounded_rectangle', 'circle', 'hexagon', 'triangle', 'polygon']),
    x: z.coerce.number(),
    y: z.coerce.number(),
    width: z.coerce.number(),
    height: z.coerce.number(),
    rotation: z.coerce.number().default(0),
    zIndex: z.coerce.number().optional(),
    locked: z.boolean().optional(),
    visible: z.boolean().optional(),
  })).optional()
});

// Template preview is rendered by a client-only component (TemplatePreviewClient)

export default function TemplateForm({ onCancel, onSuccess, template = null }) {
  const isEditing = !!template;
  const { register, control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '', slug: '', productType: 'acrylic', shape: 'rectangle', backgroundColor: '#ffffff', previewImage: '',
      canvasWidth: 1000, canvasHeight: 1000,
      isActive: true,
      overlays: [], printSizes: [], thicknesses: [], textRegions: [], extras: [],
      elements: []
    }
  });

  const editorElements = useSelector(selectElements);
  const { fields, append, remove } = useFieldArray({ control, name: 'elements' });
  const watchRegions = watch('elements');

  // Populate form with template data when editing
  useEffect(() => {
    if (template && template.templateJson) {
      const json = template.templateJson;
      reset({
        name: template.name || '',
        slug: template.slug || '',
        productType: template.productType || 'acrylic',
        shape: json.shape || 'rectangle',
        backgroundColor: json.canvas?.backgroundColor || '#ffffff',
        previewImage: json.previewImage || template.previewImage || '',
        canvasWidth: template.canvasWidth || 1000,
        canvasHeight: template.canvasHeight || 1000,
        isActive: template.isActive !== false,
        overlays: json.overlays || [],
        printSizes: json.printSizes || [],
        thicknesses: json.thicknesses || [],
        textRegions: json.textRegions || [],
        extras: json.extras || [],
        // support legacy editableRegions but prefer new `elements` key
        elements: json.elements || json.editableRegions || []
      });
    }
  }, [template, reset]);

  const watchCanvasWidth = watch('canvasWidth');
  const watchCanvasHeight = watch('canvasHeight');
  const watchShape = watch('shape');
  const watchBackgroundColor = watch('backgroundColor');
  const watchPreviewImage = watch('previewImage');
  const watchOverlays = watch('overlays');
  const watchTextRegions = watch('textRegions');
  const watchPrintSizes = watch('printSizes');
  const watchThicknesses = watch('thicknesses');
  const watchExtras = watch('extras');

  const liveTemplate = useMemo(() => ({
    canvas: {
      width: watchCanvasWidth,
      height: watchCanvasHeight,
      backgroundColor: watchBackgroundColor || '#ffffff',
    },
    shape: watchShape,
    previewImage: watchPreviewImage || '',
    overlays: watchOverlays || [],
    textRegions: watchTextRegions || [],
    printSizes: watchPrintSizes || [],
    thicknesses: watchThicknesses || [],
    extras: watchExtras || [],
    elements: editorElements,
  }), [watchCanvasWidth, watchCanvasHeight, watchBackgroundColor, watchShape, watchPreviewImage, watchOverlays, watchTextRegions, watchPrintSizes, watchThicknesses, watchExtras, editorElements]);

  const onSubmit = async (data) => {
    try {
      const templateJson = {
        name: data.name,
        productType: data.productType,
        shape: data.shape,
        canvas: {
          width: data.canvasWidth,
          height: data.canvasHeight,
          backgroundColor: data.backgroundColor || '#ffffff',
        },
        previewImage: data.previewImage || '',
        overlays: data.overlays || [],
        elements: editorElements.length ? editorElements : (data.elements || []),
        textRegions: data.textRegions || [],
        printSizes: data.printSizes || [],
        thicknesses: data.thicknesses || [],
        extras: data.extras || [],
      };

      const payload = {
        ...data,
        templateJson // Send the constructed JSON
      };

      const url = isEditing ? `/api/admin/templates/${template.id}` : '/api/admin/templates';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(await res.text());
      toast.success(isEditing ? 'Template updated successfully!' : 'Template created successfully!');
      onSuccess();
    } catch (err) {
      toast.error('Failed to save template');
      console.error(err);
    }
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">{isEditing ? 'Edit Template' : 'Create New Template'}</h2>
        <button onClick={onCancel} className="text-white/60 hover:text-white p-2"><HiX size={24} /></button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Settings */}
        <div className="bg-white/5 p-6 rounded-xl space-y-4">
          <h3 className="text-white font-medium border-b border-white/10 pb-2">Global Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-white/60 mb-1">Template Name *</label>
              <input {...register('name')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" placeholder="e.g. Hexagon Wall Art" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Product Type</label>
              <input {...register('productType')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" placeholder="e.g. acrylic" />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Shape *</label>
              <select {...register('shape')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white [&>option]:bg-gray-900">
                <option value="rectangle">Rectangle</option>
                <option value="square">Square</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="circle">Circle</option>
                <option value="oval">Oval</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Background Color</label>
              <input {...register('backgroundColor')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" placeholder="#ffffff" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" {...register('isActive')} className="rounded bg-black/20 border-white/10" />
              <label className="text-sm text-white">Active Template</label>
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Canvas Width (px) *</label>
              <input type="number" {...register('canvasWidth')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Canvas Height (px) *</label>
              <input type="number" {...register('canvasHeight')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Visual Preview */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Live Canvas Preview</h3>
            <p className="text-xs text-white/50">Changes to regions reflect here in real-time.</p>
            <TemplatePreview width={watchCanvasWidth} height={watchCanvasHeight} regions={editorElements.length ? editorElements : watchRegions} shape={watch('shape')} />
          </div>

          {/* Editable Regions Configurator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Elements</h3>
                  <button type="button" onClick={() => append({ id: `element_${fields.length + 1}`, type: 'rectangle', x: 100, y: 100, width: 200, height: 200, rotation: 0, zIndex: 0, visible: true, locked: false })} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-lg text-sm transition-colors">
                <HiPlus /> Add Region
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: 500 }}>
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                  <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 p-1.5 text-red-400/50 hover:text-red-400 bg-black/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiTrash />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">ID</label>
                      <input {...register(`elements.${index}.id`)} className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-white text-sm" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Shape Type</label>
                      <select {...register(`elements.${index}.type`)} className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-white text-sm [&>option]:bg-gray-900">
                        <option value="rectangle">Rectangle</option>
                        <option value="rounded_rectangle">Rounded Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="hexagon">Hexagon</option>
                        <option value="triangle">Triangle</option>
                        <option value="polygon">Custom Polygon</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">X Pos</label>
                      <input type="number" {...register(`elements.${index}.x`)} className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Y Pos</label>
                      <input type="number" {...register(`elements.${index}.y`)} className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Width</label>
                      <input type="number" {...register(`elements.${index}.width`)} className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Height</label>
                      <input type="number" {...register(`elements.${index}.height`)} className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-white text-sm" />
                    </div>
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="text-center py-8 text-white/30 border border-white/5 border-dashed rounded-xl text-sm">
                  No editable regions defined yet.
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
}

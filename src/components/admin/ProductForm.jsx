'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HiPlus, HiTrash, HiUpload, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  sku: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  newCategoryName: z.string().optional(),
  templateId: z.string().min(1, 'Template is required'),
  basePrice: z.coerce.number().min(0, 'Base price must be positive'),
  discountPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0),
  shape: z.string().default('rectangle'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  images: z.array(z.string()),
  sizes: z.string().optional(),
  thicknesses: z.string().optional(),
  tags: z.string().optional(),
  features: z.array(z.object({ value: z.string() })).optional(),
  variants: z.array(z.object({
    name: z.string(),
    size: z.string().optional(),
    thickness: z.string().optional(),
    frameType: z.string().optional(),
    price: z.coerce.number(),
    discountPrice: z.coerce.number().optional(),
    stock: z.coerce.number().default(0),
    sku: z.string().optional(),
  })).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.string().optional(),
  }).optional(),
  customizationRules: z.object({
    maxUploadImages: z.coerce.number().default(1),
    allowText: z.boolean().default(true),
    allowCrop: z.boolean().default(true),
  }).optional()
}).refine(data => data.categoryId || data.newCategoryName, {
  message: "Please select an existing category or create a new one",
  path: ["categoryId"]
});

const TABS = ['Basic', 'Variants', 'Media', 'Features', 'Rules', 'SEO'];

export default function ProductForm({ product, categories, templates, onCancel, onSuccess }) {
  const [activeTab, setActiveTab] = useState('Basic');
  const [uploading, setUploading] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const initialValues = {
    name: '', slug: '', sku: '', shortDescription: '', description: '',
    categoryId: '', newCategoryName: '', templateId: '', basePrice: 0, stock: 100, shape: 'rectangle',
    isActive: true, isFeatured: false, isTrending: false,
    images: [], sizes: '', thicknesses: '', tags: '', features: [], variants: [],
    seo: { metaTitle: '', metaDescription: '', keywords: '' },
    customizationRules: { maxUploadImages: 1, allowText: true, allowCrop: true }
  };

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues
  });

  useEffect(() => {
    if (!product) {
      reset(initialValues);
      setIsNewCategory(false);
      return;
    }

    reset({
      name: product.name ?? '',
      slug: product.slug ?? '',
      sku: product.sku ?? '',
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      categoryId: product.categoryId ?? '',
      newCategoryName: '',
      templateId: product.templateId ?? '',
      basePrice: product.basePrice ? Number(product.basePrice) : 0,
      discountPrice: product.discountPrice != null ? Number(product.discountPrice) : undefined,
      stock: product.stock ?? 100,
      shape: product.shape ?? 'rectangle',
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      isTrending: product.isTrending ?? false,
      images: product.images || [],
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      thicknesses: Array.isArray(product.thicknesses) ? product.thicknesses.join(', ') : product.thicknesses || '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
      features: Array.isArray(product.features) ? product.features.map((value) => ({ value })) : [],
      variants: Array.isArray(product.variants) ? product.variants.map((variant) => ({
        name: variant.name || '',
        size: variant.size || '',
        thickness: variant.thickness || '',
        frameType: variant.frameType || '',
        price: variant.price ? Number(variant.price) : 0,
        discountPrice: variant.discountPrice != null ? Number(variant.discountPrice) : undefined,
        stock: variant.stock ?? 0,
        sku: variant.sku || '',
      })) : [],
      seo: {
        metaTitle: product.seo?.metaTitle ?? '',
        metaDescription: product.seo?.metaDescription ?? '',
        keywords: product.seo?.keywords ?? ''
      },
      customizationRules: {
        maxUploadImages: product.customizationRules?.maxUploadImages ?? 1,
        allowText: product.customizationRules?.allowText ?? true,
        allowCrop: product.customizationRules?.allowCrop ?? true,
      }
    });
    setIsNewCategory(false);
  }, [product, reset]);

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: 'features' });

  const watchImages = watch('images') || [];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading('Uploading image...');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setValue('images', [...watchImages, data.url]);
        toast.success('Image uploaded!', { id: toastId });
      } else throw new Error(data.error);
    } catch (err) {
      toast.error('Upload failed', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...watchImages];
    newImages.splice(index, 1);
    setValue('images', newImages);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        sizes: typeof data.sizes === 'string' && data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        thicknesses: typeof data.thicknesses === 'string' && data.thicknesses ? data.thicknesses.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags: typeof data.tags === 'string' && data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        features: data.features?.map(f => f.value).filter(Boolean) || []
      };

      const endpoint = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || 'Failed to save product');
      }
      toast.success(product ? 'Product updated successfully!' : 'Product created successfully!');
      onSuccess();
    } catch (err) {
      toast.error('Failed to save product');
      console.error(err);
    }
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">{product ? 'Edit Product' : 'Create Product'}</h2>
        <button onClick={onCancel} className="text-white/60 hover:text-white p-2"><HiX size={24} /></button>
      </div>

      <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-primary-500 text-primary-400' : 'border-transparent text-white/50 hover:text-white/80'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {activeTab === 'Basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-1">Product Name *</label>
              <input {...register('name')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Slug (auto-generated if empty)</label>
              <input {...register('slug')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">SKU</label>
              <input {...register('sku')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Category *</label>
              {isNewCategory ? (
                <div className="flex gap-2">
                  <input 
                    {...register('newCategoryName')} 
                    placeholder="Enter new category name..." 
                    className="flex-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" 
                  />
                  <button type="button" onClick={() => { setIsNewCategory(false); setValue('newCategoryName', ''); }} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm">Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select {...register('categoryId')} className="flex-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white [&>option]:bg-gray-900">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={() => { setIsNewCategory(true); setValue('categoryId', ''); }} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm whitespace-nowrap">
                    + New
                  </button>
                </div>
              )}
              {errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Base Price *</label>
              <input type="number" step="0.01" {...register('basePrice')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Discount Price</label>
              <input type="number" step="0.01" {...register('discountPrice')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-white/60 mb-1">Short Description</label>
              <input {...register('shortDescription')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-white/60 mb-1">Full Description</label>
              <textarea {...register('description')} rows="4" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"></textarea>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Shape Style</label>
              <select {...register('shape')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white [&>option]:bg-gray-900">
                <option value="rectangle">Rectangle</option>
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="hexagon">Hexagon</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Tags (comma separated)</label>
              <input {...register('tags')} placeholder="acrylic, wall art, gift" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="md:col-span-2 flex gap-6 mt-2">
              <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" {...register('isActive')} className="rounded bg-black/20 border-white/10" /> Active</label>
              <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" {...register('isFeatured')} className="rounded bg-black/20 border-white/10" /> Featured</label>
              <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" {...register('isTrending')} className="rounded bg-black/20 border-white/10" /> Trending</label>
            </div>
          </div>
        )}

        {activeTab === 'Variants' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">Dynamic Variants</h3>
              <button type="button" onClick={() => appendVariant({ name: '', price: 0, stock: 0 })} className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                <HiPlus /> Add Variant
              </button>
            </div>
            {variantFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 border border-white/10 rounded-xl relative">
                <div className="md:col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Variant Name (e.g. 8x12 - 3mm)</label>
                  <input {...register(`variants.${index}.name`)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Size</label>
                  <input {...register(`variants.${index}.size`)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Price</label>
                  <input type="number" {...register(`variants.${index}.price`)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Stock</label>
                  <input type="number" {...register(`variants.${index}.stock`)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div className="flex items-end justify-end">
                  <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><HiTrash size={18} /></button>
                </div>
              </div>
            ))}
            {variantFields.length === 0 && <p className="text-white/40 text-sm italic">No variants added. Base price will be used.</p>}
          </div>
        )}

        {activeTab === 'Media' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <HiUpload className="w-10 h-10 mb-3 text-white/40" />
                  <p className="mb-2 text-sm text-white/60"><span className="font-semibold">Click to upload</span> to Cloudinary</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            
            {watchImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {watchImages.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square">
                    <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-red-500/80">
                      <HiTrash />
                    </button>
                    {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-primary-500/80 text-white text-xs text-center py-1 font-medium">Thumbnail</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Features' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10">
              <div>
                <label className="block text-sm text-white/60 mb-1">Available Sizes (comma separated)</label>
                <input {...register('sizes')} placeholder="8x12, 12x18, 16x24" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Available Thicknesses (comma separated)</label>
                <input {...register('thicknesses')} placeholder="3mm, 5mm, 8mm" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
              </div>
            </div>

             <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">Dynamic Features</h3>
              <button type="button" onClick={() => appendFeature({ value: '' })} className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                <HiPlus /> Add Feature
              </button>
            </div>
            {featureFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input {...register(`features.${index}.value`)} placeholder="e.g. Waterproof, UV Printed" className="flex-1 bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><HiTrash size={18} /></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Rules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-1">Template Base *</label>
              <select {...register('templateId')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white [&>option]:bg-gray-900">
                <option value="">Select Template (JSON config)</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.templateId && <p className="text-red-400 text-xs mt-1">{errors.templateId.message}</p>}
              <p className="text-xs text-white/40 mt-2">To configure visual template regions, edit the Template JSON from the Templates tab.</p>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Max Upload Images</label>
              <input type="number" {...register('customizationRules.maxUploadImages')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" {...register('customizationRules.allowText')} className="rounded bg-black/20 border-white/10" /> Allow Custom Text</label>
              <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" {...register('customizationRules.allowCrop')} className="rounded bg-black/20 border-white/10" /> Allow Cropping</label>
            </div>
          </div>
        )}

        {activeTab === 'SEO' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Meta Title</label>
              <input {...register('seo.metaTitle')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Meta Description</label>
              <textarea {...register('seo.metaDescription')} rows="3" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"></textarea>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Keywords</label>
              <input {...register('seo.keywords')} placeholder="acrylic, custom print, wall art" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
            {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

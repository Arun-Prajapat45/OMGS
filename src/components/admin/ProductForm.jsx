'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HiPlus, HiTrash, HiUpload, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import KonvaEditor from '@/components/editor/KonvaEditor';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  sku: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  newCategoryName: z.string().optional(),
  subCategoryId: z.string().optional(),
  newSubCategoryName: z.string().optional(),
  templateId: z.string().min(1, 'Template is required'),
  shape: z.string().default('rectangle'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  images: z.array(z.string()),
  tags: z.string().optional(),
  variants: z.array(z.object({
    dim: z.string().min(1, 'Dimension is required'),
    thick: z.string().min(1, 'Thickness is required'),
    price: z.coerce.number().min(0, 'Price is required'),
    discountprice: z.coerce.number().min(0).optional(),
    stocks: z.coerce.number().min(0, 'Stock is required'),
  })).min(1, 'At least one variant is required'),
  is3dEnabled: z.boolean().default(false),
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

const TABS = ['Basic', 'Variants', 'Media', 'Rules', 'SEO'];

export default function ProductForm({ product, categories, subCategories, templates, onCancel, onSuccess }) {
  const [activeTab, setActiveTab] = useState('Basic');
  const [uploading, setUploading] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [isNewSubCategory, setIsNewSubCategory] = useState(false);
  const [triggerExport, setTriggerExport] = useState(false);

  const initialValues = {
    name: '', slug: '', sku: '', shortDescription: '', description: '',
    categoryId: '', newCategoryName: '', subCategoryId: '', templateId: '', shape: 'rectangle',
    isActive: true, isFeatured: false, isTrending: false,
    images: [], tags: '', variants: [],
    is3dEnabled: false,
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
      setIsNewSubCategory(false);
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
      newSubCategoryName: '',
      subCategoryId: product.subCategoryId ?? '',
      templateId: product.templateId ?? '',
      shape: product.shape ?? 'rectangle',
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      isTrending: product.isTrending ?? false,
      images: product.images || [],
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
      variants: Array.isArray(product.variants) ? product.variants.map((variant) => ({
        dim: variant.dim || variant.size || variant.name || '',
        thick: variant.thick != null ? String(variant.thick) : String(variant.thickness || ''),
        price: variant.price ? Number(variant.price) : 0,
        discountprice: variant.discountprice != null ? Number(variant.discountprice) : variant.discountPrice != null ? Number(variant.discountPrice) : undefined,
        stocks: variant.stocks ?? variant.stock ?? 0,
      })) : [],
      is3dEnabled: product.is3dEnabled ?? false,
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
    setIsNewSubCategory(false);
  }, [product, reset]);

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const watchImages = watch('images') || [];
  const watchTemplateId = watch('templateId');
  const selectedTemplate = templates.find((t) => t.id === watchTemplateId);

  useEffect(() => {
    if (selectedTemplate?.shape) {
      setValue('shape', selectedTemplate.shape);
    }
  }, [selectedTemplate, setValue]);

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

  const handleHighResExport = async (highResUri) => {
    setTriggerExport(false);
    if (!highResUri) return;

    const toastId = toast.loading('Uploading preview image...');
    setUploading(true);
    try {
      const res = await fetch(highResUri);
      const blob = await res.blob();
      const file = new File([blob], `preview-${Date.now()}.webp`, { type: 'image/webp' });

      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await uploadRes.json();
      if (uploadRes.ok) {
        const url = data.url || data.secureUrl;
        setValue('images', [...watchImages, url]);
        toast.success('Preview uploaded!', { id: toastId });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Failed to upload preview', { id: toastId });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        tags: typeof data.tags === 'string' && data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        variants: (data.variants || []).map((variant) => ({
          dim: variant.dim || 'Standard',
          thick: String(variant.thick || 'Standard'),
          price: Number(variant.price || 0),
          discountprice: variant.discountprice != null ? Number(variant.discountprice) : Number(variant.price || 0),
          stocks: Number(variant.stocks || 0),
        })),
        is3dEnabled: data.is3dEnabled || false,
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
              <label className="block text-sm text-white/60 mb-1">SubCategory</label>
              {isNewSubCategory ? (
                <div className="flex gap-2">
                  <input
                    {...register('newSubCategoryName')}
                    placeholder="Enter new subcategory name..."
                    className="flex-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                  />
                  <button type="button" onClick={() => { setIsNewSubCategory(false); setValue('newSubCategoryName', ''); }} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm">Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select {...register('subCategoryId')} className="flex-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white [&>option]:bg-gray-900" disabled={isNewSubCategory || !watch('categoryId')}>
                    <option value="">Select SubCategory</option>
                    {categories.find(c => c.id === watch('categoryId'))?.subCategories?.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => { setIsNewSubCategory(true); setValue('subCategoryId', ''); }} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm whitespace-nowrap">
                    + New
                  </button>
                </div>
              )}
              {errors.subCategoryId && <p className="text-red-400 text-xs mt-1">{errors.subCategoryId.message}</p>}
            </div>

            <div className="md:col-span-2 p-4 border border-white/10 rounded-xl bg-white/5">
              <label className="block text-sm text-white/60 mb-2">Template Base *</label>
              <select {...register('templateId')} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white [&>option]:bg-gray-900 mb-4">
                <option value="">Select Template</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.productType})</option>)}
              </select>
              {errors.templateId && <p className="text-red-400 text-xs mt-1 mb-2">{errors.templateId.message}</p>}

              {selectedTemplate && (
                <div className="flex gap-4 items-center bg-black/20 p-3 rounded-lg border border-white/5">
                  {selectedTemplate.previewImage ? (
                    <img src={selectedTemplate.previewImage} alt="Preview" className="w-16 h-16 object-contain rounded-md bg-white/5" />
                  ) : (
                    <div className="w-16 h-16 bg-white/5 rounded-md flex items-center justify-center text-xs text-white/30">No Preview</div>
                  )}
                  <div>
                    <div className="text-sm text-white font-medium">{selectedTemplate.name}</div>
                    <div className="text-xs text-white/50">
                      {selectedTemplate.canvasWidth} x {selectedTemplate.canvasHeight} • {selectedTemplate.shape}
                    </div>
                  </div>
                </div>
              )}
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
              <label className="block text-sm text-white/60 mb-1">Shape Style (Auto-detected from template)</label>
              <input type="text" readOnly {...register('shape')} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/50 cursor-not-allowed" />
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
              <button type="button" onClick={() => appendVariant({ dim: '', thick: '', price: 0, discountprice: 0, stocks: 0 })} className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                <HiPlus /> Add Variant
              </button>
            </div>
            {variantFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 border border-white/10 rounded-xl relative">
                <div className="md:col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Dimension</label>
                  <input {...register(`variants.${index}.dim`)} placeholder="1200x600" className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Thickness</label>
                  <input {...register(`variants.${index}.thick`)} placeholder="15mm" className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Retail Price</label>
                  <input type="number" step="0.01" {...register(`variants.${index}.price`)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Discount Price</label>
                  <input type="number" step="0.01" {...register(`variants.${index}.discountprice`)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Stock</label>
                  <input type="number" {...register(`variants.${index}.stocks`)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-white text-sm" />
                </div>
                <div className="flex items-end justify-end">
                  <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><HiTrash size={18} /></button>
                </div>
              </div>
            ))}
            {variantFields.length === 0 && <p className="text-white/40 text-sm italic">No variants added yet. Add at least one variant to publish this product.</p>}
          </div>
        )}

        {activeTab === 'Media' && (
          <div className="space-y-6">
            {selectedTemplate && selectedTemplate.templateJson ? (
              <div className="space-y-4 border border-white/10 rounded-xl p-6 bg-black/20">
                <h3 className="text-white font-medium mb-4 flex justify-between items-center">
                  <span>Template Preview Configuration</span>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => setTriggerExport(true)}
                    className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Save Configured Preview
                  </button>
                </h3>
                <div className="bg-black/40 rounded-xl p-4 overflow-hidden border border-white/5 relative flex justify-center w-full min-h-[400px]">
                  <KonvaEditor
                    template={selectedTemplate.templateJson}
                    onExport={() => { }}
                    shape={selectedTemplate.shape || 'rectangle'}
                    triggerExport={triggerExport}
                    onHighResExport={handleHighResExport}
                  />
                </div>
                <p className="text-sm text-white/50 text-center mt-2">
                  You can click on the photo slots to upload images directly onto the template. Click "Save Configured Preview" to add it to your product media.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-500/10 text-yellow-500 text-sm rounded-lg border border-yellow-500/20">
                Please select a valid Template in the Basic tab to configure its preview.
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <HiUpload className="w-10 h-10 mb-3 text-white/40" />
                    <p className="mb-2 text-sm text-white/60"><span className="font-semibold">Click to upload</span> additional media to Cloudinary</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
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


        {activeTab === 'Rules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

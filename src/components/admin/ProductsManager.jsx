'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductForm from './ProductForm';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiOutlinePhotograph } from 'react-icons/hi';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductsManager() {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({ categories: [], templates: [] });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch form data (categories/templates) only once when component mounts
  useEffect(() => {
    fetch('/api/admin/form-data')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setFormData(data);
      })
      .catch(console.error);
  }, []);

  const handleEdit = async (productId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      if (!res.ok) throw new Error('Failed to load product');
      const data = await res.json();
      setEditingProduct(data.product);
      setView('form');
    } catch (err) {
      toast.error('Failed to load product for editing');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Delete product "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete product');
        return;
      }
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (view === 'form') {
    return (
      <ProductForm 
        product={editingProduct}
        categories={formData.categories} 
        templates={formData.templates} 
        onCancel={() => {
          setView('list');
          setEditingProduct(null);
        }}
        onSuccess={() => {
          setView('list');
          setEditingProduct(null);
          fetchProducts();
        }}
      />
    );
  }

  return (
    <div className="glass rounded-2xl p-8 border border-white/5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white">Products Manager</h2>
          <p className="text-sm text-white/50">Manage dynamic catalog, variants, and templates</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setView('form');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <HiPlus /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/40">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-white/40 border border-white/5 rounded-xl border-dashed">
          <p>No products found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                <th className="pb-3 pl-2 font-medium">Product</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Base Price</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Template</th>
                <th className="pb-3 font-medium">Variants</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 pr-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <HiOutlinePhotograph className="text-white/20" size={20} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{p.name}</div>
                        <div className="text-xs text-white/40 font-mono">{p.sku || p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-white/60">{p.category?.name}</td>
                  <td className="py-4 text-sm text-white">
                    {formatPrice(
                      Array.isArray(p.variants) && p.variants.length > 0
                        ? Math.min(...p.variants.map((variant) => variant.discountprice != null ? Number(variant.discountprice) : Number(variant.price || 0)))
                        : 0
                    )}
                  </td>
                  <td className="py-4 text-sm text-white/60">{Array.isArray(p.variants) ? p.variants.reduce((sum, variant) => sum + Number(variant.stocks ?? variant.stock ?? 0), 0) : 0}</td>
                  <td className="py-4">
                    {p.template ? (
                      <div>
                        <div className="text-sm text-white">{p.template.name}</div>
                        <div className="text-xs text-white/40 capitalize">{p.template.productType}</div>
                      </div>
                    ) : (
                      <span className="text-white/40 text-xs italic">None</span>
                    )}
                  </td>
                  <td className="py-4 text-sm text-white/60">
                    <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{p.variants?.length || 0}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${p.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {p.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(p.id)}
                        disabled={actionLoading}
                        className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded disabled:opacity-50"
                      ><HiPencil /></button>
                      <button 
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={actionLoading}
                        className="p-1.5 text-red-400/70 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded disabled:opacity-50"
                      ><HiTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-white/10">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-50 text-sm"
          >
            Prev
          </button>
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

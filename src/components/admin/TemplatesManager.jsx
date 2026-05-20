'use client';

import { useState, useEffect, useCallback } from 'react';
import TemplateForm from './TemplateForm';
import { HiPlus, HiSearch, HiTemplate, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function TemplatesManager() {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleEdit = async (templateId) => {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/templates/${templateId}`);
      if (!res.ok) throw new Error('Failed to fetch template');
      const { template } = await res.json();
      setEditingTemplate(template);
      setView('form');
    } catch (err) {
      toast.error('Failed to load template for editing');
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (templateId, templateName) => {
    if (!window.confirm(`Delete template "${templateName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete template');
        return;
      }

      toast.success('Template deleted successfully!');
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete template');
      console.error(err);
    }
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/templates?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  if (view === 'form') {
    return (
      <TemplateForm 
        template={editingTemplate}
        onCancel={() => {
          setView('list');
          setEditingTemplate(null);
        }}
        onSuccess={() => {
          setView('list');
          setEditingTemplate(null);
          fetchTemplates();
        }}
      />
    );
  }

  return (
    <div className="glass rounded-2xl p-8 border border-white/5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white">Templates Manager</h2>
          <p className="text-sm text-white/50">Visually configure editable canvas regions</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button 
            onClick={() => setView('form')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <HiPlus /> New Template
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/40">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-white/40 border border-white/5 rounded-xl border-dashed">
          <p>No templates found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                <th className="pb-3 pl-2 font-medium">Template</th>
                <th className="pb-3 font-medium">Product Type</th>
                <th className="pb-3 font-medium">Canvas Size</th>
                <th className="pb-3 font-medium">Regions</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 pr-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {templates.map((t) => {
                const regionsCount = t.templateJson?.editableRegions?.length || 0;
                
                return (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <HiTemplate size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{t.name}</div>
                          <div className="text-xs text-white/40 font-mono">{t.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-white/60 capitalize">{t.productType}</td>
                    <td className="py-4 text-sm text-white/60 font-mono">{t.canvasWidth} x {t.canvasHeight}</td>
                    <td className="py-4 text-sm text-white/60">
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{regionsCount}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${t.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {t.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 pr-2 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(t.id)}
                          disabled={editLoading}
                          className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded disabled:opacity-50"
                        >
                          <HiPencil />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id, t.name)}
                          className="p-1.5 text-red-400/70 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-white/10">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-50 text-sm">Prev</button>
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-50 text-sm">Next</button>
        </div>
      )}
    </div>
  );
}

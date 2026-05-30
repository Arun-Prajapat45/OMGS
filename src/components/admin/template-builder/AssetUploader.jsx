'use client';

import { useRef, useState } from 'react';
import { HiUpload, HiPhotograph, HiCode, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

/**
 * AssetUploader — uploads a file to Cloudinary via /api/upload
 * @param {function} onUploaded(url) — called with the Cloudinary secure URL
 * @param {string} accept — file types to accept (default: image/*)
 * @param {string} label — button label
 * @param {string} currentUrl — current asset URL to show preview
 */
export default function AssetUploader({ onUploaded, accept = 'image/*', label = 'Upload Asset', currentUrl = null, compact = false }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      const url = data.secure_url || data.url;
      setPreview(url);
      onUploaded?.(url);
      toast.success('Asset uploaded!');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {preview && (
          <div className="relative w-10 h-10 rounded-md overflow-hidden border border-white/20 bg-black/20 shrink-0">
            <img src={preview} alt="asset" className="w-full h-full object-contain" />
            <button
              onClick={() => { setPreview(null); onUploaded?.(null); }}
              className="absolute top-0 right-0 p-0.5 bg-red-500/80 text-white rounded-bl"
            >
              <HiX size={10} />
            </button>
          </div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-white/70 hover:text-white text-xs transition-all disabled:opacity-50"
        >
          {uploading ? (
            <span className="w-3 h-3 border border-white/60 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiUpload size={13} />
          )}
          {uploading ? 'Uploading…' : label}
        </button>
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="relative group cursor-pointer border-2 border-dashed border-white/15 hover:border-indigo-500/60 rounded-xl p-4 flex flex-col items-center gap-2 bg-white/3 hover:bg-indigo-500/5 transition-all min-h-[90px] justify-center"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-indigo-400">
            <span className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Uploading…</span>
          </div>
        ) : preview ? (
          <div className="relative w-full flex items-center justify-center">
            <img src={preview} alt="asset" className="max-h-20 max-w-full object-contain rounded-md" />
            <button
              onClick={(e) => { e.stopPropagation(); setPreview(null); onUploaded?.(null); }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-400 transition-colors"
            >
              <HiX size={12} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-white/40 group-hover:text-white/60 transition-colors">
            {accept.includes('svg') ? <HiCode size={22} /> : <HiPhotograph size={22} />}
            <span className="text-xs text-center">{label}<br /><span className="text-white/25">or drag & drop</span></span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      {preview && (
        <div className="text-[10px] text-white/30 truncate px-1">{preview}</div>
      )}
    </div>
  );
}

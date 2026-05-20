'use client';

import { useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { HiUpload, HiPhotograph } from 'react-icons/hi';
import { cn } from '@/lib/utils';

export default function RegionUploader({ region, isSelected, onSelect, onImageUploaded }) {
  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      const img = new window.Image();
      img.onload = () => onImageUploaded(url, img);
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, [onImageUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (files) => handleFile(files[0]),
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className={cn(
        'relative cursor-pointer rounded-2xl transition-all duration-200',
        isSelected ? 'ring-2 ring-primary-500' : 'ring-1 ring-white/10'
      )}
    >
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-2xl min-w-[140px] transition-all',
          isDragActive ? 'bg-primary-600/30' : 'glass hover:bg-white/10'
        )}
      >
        <input {...getInputProps()} />
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          isSelected ? 'gradient-primary glow' : 'bg-white/10'
        )}>
          {isDragActive ? <HiUpload className="w-5 h-5 text-white" /> : <HiPhotograph className="w-5 h-5 text-white/60" />}
        </div>
        <span className="text-xs text-white/60 text-center font-medium">
          {isDragActive ? 'Drop here' : region.placeholder || 'Upload Photo'}
        </span>
      </div>
    </motion.div>
  );
}

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file) => {
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setProgress(100);
      return data;
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress };
}

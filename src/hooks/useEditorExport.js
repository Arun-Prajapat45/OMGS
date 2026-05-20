import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectLayers, selectTemplate, selectExportQuality } from '@/store/slices/editorSlice';

export function useEditorExport(stageRef) {
  const layers = useSelector(selectLayers);
  const template = useSelector(selectTemplate);
  const exportQuality = useSelector(selectExportQuality);

  const exportAsDataURL = useCallback(async () => {
    if (!stageRef?.current) return null;
    const stage = stageRef.current;
    return stage.toDataURL({ pixelRatio: exportQuality, mimeType: 'image/png' });
  }, [stageRef, exportQuality]);

  const exportAsBlob = useCallback(async () => {
    const url = await exportAsDataURL();
    if (!url) return null;
    const res = await fetch(url);
    return res.blob();
  }, [exportAsDataURL]);

  const exportAndUpload = useCallback(async (uploadFn) => {
    const blob = await exportAsBlob();
    if (!blob) return null;
    const file = new File([blob], `design-${Date.now()}.png`, { type: 'image/png' });
    return uploadFn(file);
  }, [exportAsBlob]);

  return { exportAsDataURL, exportAsBlob, exportAndUpload };
}

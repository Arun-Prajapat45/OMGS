'use client';

import { HiDownload, HiRefresh } from 'react-icons/hi';
import { MdUndo, MdRedo } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { undo, redo, resetEditor } from '@/store/slices/editorSlice';
import toast from 'react-hot-toast';

export default function EditorToolbar({ stageRef, onExport }) {
  const dispatch = useDispatch();

  const handleExport = async () => {
    const uri = await onExport?.();
    if (uri) {
      // Download preview
      const link = document.createElement('a');
      link.href = uri;
      link.download = 'omgs-preview.png';
      link.click();
      toast.success('Preview downloaded!');
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 glass rounded-xl p-1">
        <button
          onClick={() => dispatch(undo())}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
          title="Undo"
        >
          <MdUndo className="w-4 h-4" />
        </button>
        <button
          onClick={() => dispatch(redo())}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
          title="Redo"
        >
          <MdRedo className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-white/10" />
        <button
          onClick={() => dispatch(resetEditor())}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
          title="Reset"
        >
          <HiRefresh className="w-4 h-4" />
        </button>
        <button
          onClick={handleExport}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
          title="Download Preview"
        >
          <HiDownload className="w-4 h-4" />
        </button>
      </div>
      <span className="text-white/30 text-xs">Drag images within shapes • Pinch to zoom on mobile</span>
    </div>
  );
}

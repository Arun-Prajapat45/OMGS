'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Konva must be dynamically imported (no SSR)
const KonvaEditorInner = dynamic(() => import('./KonvaEditorInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 glass rounded-3xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/40">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading editor...</p>
      </div>
    </div>
  ),
});

export default function KonvaEditor({ template, onExport, shape = 'rectangle', triggerExport, onHighResExport, hasStuds }) {
  return (
    <Suspense>
      <KonvaEditorInner template={template} onExport={onExport} shape={shape} triggerExport={triggerExport} onHighResExport={onHighResExport} hasStuds={hasStuds} />
    </Suspense>
  );
}

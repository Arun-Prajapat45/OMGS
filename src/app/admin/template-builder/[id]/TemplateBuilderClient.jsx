'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Konva
const TemplateBuilder = dynamic(() => import('@/components/admin/template-builder/TemplateBuilder'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-screen bg-[#0b0c15] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/40">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Initializing builder…</p>
      </div>
    </div>
  ),
});

export default function TemplateBuilderClient({ templateId }) {
  return <TemplateBuilder templateId={templateId} />;
}

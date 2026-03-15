'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SidebarTree from '@/components/SidebarTree';
import InfoPanel from '@/components/InfoPanel';
const InteractiveDesk = dynamic(() => import('@/components/RawDesk'), { ssr: false });

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (id: string | null, pId: string | null = null) => {
    setSelectedId(id);
    setPreviewId(pId || id);
  };

  const handleClosePanel = () => {
    setSelectedId(null);
    setPreviewId(null);
  };

  return (
    <main className="relative h-screen w-full bg-black overflow-hidden font-sans selection:bg-pink-500/30">
      <SidebarTree
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      <div className="absolute inset-0">
        <InteractiveDesk
          selectedId={selectedId}
          onSelect={handleSelect}
          hoveredId={hoveredId}
          onHover={setHoveredId}
        />

        <InfoPanel
          selectedId={selectedId}
          previewId={previewId}
          onClose={handleClosePanel}
        />
      </div>
    </main>
  );
}

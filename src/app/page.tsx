'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SidebarTree from '@/components/SidebarTree';
import InfoPanel from '@/components/InfoPanel';
import LandingCover from '@/components/LandingCover';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMobile } from '@/lib/useIsMobile';

const InteractiveDesk = dynamic(() => import('@/components/RawDesk'), { ssr: false });

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showCover, setShowCover] = useState(true);
  const [showResume, setShowResume] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [shouldPreloadDesktopScene, setShouldPreloadDesktopScene] = useState(false);
  const isMobile = useIsMobile();

  // Sync background state with browser history
  useEffect(() => {
    // Initial state setup if needed
    if (window.history.state === null) {
      window.history.replaceState({ showCover: true }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state?.showScene) {
        setShowCover(false);
      } else {
        setShowCover(true);
        setSelectedId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isMobile || !showCover) {
      setShouldPreloadDesktopScene(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const startPreload = () => setShouldPreloadDesktopScene(true);

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(startPreload, { timeout: 250 });
    } else {
      timeoutId = setTimeout(startPreload, 120);
    }

    return () => {
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [isMobile, showCover]);

  const handleSelect = (id: string | null, pId: string | null = null) => {
    setSelectedId(id);
    setPreviewId(pId || id);
  };

  const handleClosePanel = () => {
    setSelectedId(null);
    setPreviewId(null);
  };

  const handleLoadProgress = useCallback((progress: number) => {
    setLoadingProgress(progress);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleStart = useCallback(() => {
    setShouldPreloadDesktopScene(true);
    setShowCover(false);
    window.history.pushState({ showScene: true }, '');
  }, []);

  const shouldMountScene = isMobile ? !showCover : shouldPreloadDesktopScene || !showCover;

  return (
    <main className="relative h-screen w-full bg-[#D0D0CC] overflow-hidden font-sans selection:bg-pink-500/30 text-white">
      <AnimatePresence mode="wait">
        {showCover && (
          <LandingCover 
            key="cover" 
            onStart={handleStart} 
            isLoading={isLoading}
            loadingProgress={loadingProgress}
          />
        )}
      </AnimatePresence>
      
      {/* Scene is ALWAYS rendered outside AnimatePresence to prevent re-mounts */}
      {shouldMountScene && (
        <motion.div 
          key="scene-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: showCover ? 0 : 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className={`absolute inset-0 ${showCover ? 'pointer-events-none' : ''}`}
        >
              <SidebarTree
                selectedId={selectedId}
                onSelect={handleSelect}
              />

              <div className="absolute inset-0">
                <InteractiveDesk
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onHover={() => {}}
                  onBack={() => {
                    if (window.history.state?.showScene) {
                      window.history.back();
                    } else {
                      setShowCover(true);
                      setSelectedId(null);
                    }
                  }}
                  onResume={() => setShowResume(true)}
                  onLoadProgress={handleLoadProgress}
                  onLoadComplete={handleLoadComplete}
                  showCover={showCover}
                />

                <InfoPanel
                  selectedId={selectedId}
                  previewId={previewId}
                  onClose={handleClosePanel}
                />
              </div>

              {/* Resume Overlay */}
              <AnimatePresence>
                {showResume && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/40 backdrop-blur-md"
                  >
                    <motion.div 
                      className="relative w-full h-[90vh] max-w-5xl bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col"
                    >
                      <div className="px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-white font-black tracking-tight text-xl drop-shadow-sm">Resume.pdf</h2>
                        <button 
                          onClick={() => setShowResume(false)}
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white cursor-pointer"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="flex-1 bg-white/5 relative">
                        <object
                          data="/Resume.pdf#view=FitH"
                          type="application/pdf"
                          className="h-full w-full"
                          aria-label="Resume Viewer"
                        >
                          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white">
                            <p className="max-w-md text-sm text-white/80">
                              Your browser could not display the PDF inline. You can still open or download it directly.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                              <a
                                href="/Resume.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                              >
                                Open Resume
                              </a>
                              <a
                                href="/Resume.pdf"
                                download
                                className="rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                              >
                                Download PDF
                              </a>
                            </div>
                          </div>
                        </object>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
      )}
    </main>
  );
}

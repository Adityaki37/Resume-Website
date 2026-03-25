'use client';

import { X, ExternalLink, Calendar } from 'lucide-react';
import { resumeData } from '../data/resume';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';

import ItemPreview from './ItemPreview';

interface InfoPanelProps {
  selectedId: string | null;
  previewId?: string | null;
  onClose: () => void;
}

const DotBullet = ({ muted = false }: { muted?: boolean }) => (
  <span className={cn('mr-3 mt-0.5 shrink-0 text-base leading-none', muted ? 'text-[#d0d0cc]' : 'text-[#2e2e2c]/80')}>
    &bull;
  </span>
);

export default function InfoPanel({ selectedId, previewId, onClose }: InfoPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const item = resumeData.find(i => i.id === selectedId);
  const involvementItems = resumeData.filter(i => i.category === 'Involvements');
  const isCombinedInvolvements = selectedId === 'involvements';
  const showInterestHeader =
    !isCombinedInvolvements &&
    !!item &&
    item.id !== 'about-me' &&
    item.category !== 'Education';
  const headerLabel = isCombinedInvolvements
    ? 'Involvements'
    : item?.id === 'about-me'
      ? 'About Me'
      : item?.category;

  useEffect(() => {
    if (selectedId) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedId]);

  if (!item && !isCombinedInvolvements) return null;

  return (
    <div
      className={cn(
        'fixed transition-all duration-500 ease-out flex flex-col z-40 transform bg-[#fffffe]/95 backdrop-blur-xl border-[#d0d0cc] shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
        'md:right-8 md:top-8 md:bottom-auto md:left-auto md:w-96 md:max-h-[calc(100vh-4rem)] md:border md:rounded-2xl',
        'left-0 right-0 bottom-0 w-full max-h-[85vh] border-t rounded-t-[2rem]',
        isVisible
          ? 'translate-y-0 opacity-100 md:translate-x-0'
          : 'translate-y-full opacity-0 md:translate-x-full md:translate-y-0 pointer-events-none'
      )}
    >
      <div className="absolute inset-0 bg-[#fffffe]/20 rounded-t-[2rem] md:rounded-2xl pointer-events-none" />

      <div className="p-5 md:p-6 border-b border-[#d0d0cc]/30 flex justify-between items-start sticky top-0 bg-[#fffffe] z-10 rounded-t-[2rem] md:rounded-t-2xl">
        <div className="flex-1">
          {showInterestHeader && (
            <div className="flex items-center text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#0c0c0c]/60 mb-1">
              <span>Interest</span>
              <span className="mx-1.5 opacity-50">&bull;</span>
              <span>{item?.interestTitle}</span>
            </div>
          )}
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#0c0c0c]/40 mb-1 block">
            {headerLabel}
          </span>
          <h2 className="text-lg md:text-xl font-bold text-[#0c0c0c] pr-4 break-words leading-tight">
            {isCombinedInvolvements ? 'Involvements' : item?.title}
          </h2>
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="p-1.5 md:p-2 rounded-full bg-[#0c0c0c]/5 hover:bg-[#0c0c0c]/10 text-[#2e2e2c] hover:text-[#0c0c0c] transition-colors"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <div className="p-5 md:p-6 flex-1 space-y-5 md:space-y-6 overflow-y-auto">
        {isCombinedInvolvements && (
          <>
            <div className="bg-[#0c0c0c]/5 rounded-xl border border-[#d0d0cc]/20 overflow-hidden shadow-inner aspect-[4/3] md:aspect-auto">
              <ItemPreview itemId="involvements" color="#111111" />
            </div>

            <div className="h-px bg-[#d0d0cc]/30" />
          </>
        )}

        {!isCombinedInvolvements && item && (
          <>
            <div className="bg-[#0c0c0c]/5 rounded-xl border border-[#d0d0cc]/20 overflow-hidden shadow-inner aspect-[4/3] md:aspect-auto">
              <ItemPreview itemId={previewId || item.id} color={item.color} />
            </div>

            <div className="h-px bg-[#d0d0cc]/30" />

            {(item.subtitle || item.date) && (
              <div className="space-y-1.5 md:space-y-2">
                {item.subtitle && (
                  <h3 className="text-base md:text-lg font-medium text-[#2e2e2c] leading-tight">
                    {item.subtitle}
                  </h3>
                )}
                {item.date && (
                  <div className="flex items-center text-xs md:text-sm text-gray-400">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                    {item.date}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2.5 md:space-y-3 pb-4">
              {item.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start text-xs md:text-sm text-[#2e2e2c] leading-relaxed">
                  <DotBullet />
                  <p>{bullet}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {isCombinedInvolvements && (
          <div className="space-y-6 pb-4">
            {involvementItems.map((involvement) => (
              <div key={involvement.id} className="space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-base md:text-lg font-medium text-[#2e2e2c] leading-tight">
                    {involvement.title}
                  </h3>
                  {involvement.subtitle && (
                    <p className="text-sm md:text-base text-[#2e2e2c]/70">{involvement.subtitle}</p>
                  )}
                  {involvement.date && (
                    <div className="flex items-center text-xs md:text-sm text-gray-400">
                      <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                      {involvement.date}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  {involvement.bullets.map((bullet, idx) => (
                    <div key={`${involvement.id}-${idx}`} className="flex items-start text-xs md:text-sm text-[#2e2e2c] leading-relaxed">
                      <DotBullet />
                      <p>{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {item?.id === 'hephasbot' && (
          <a
            href="https://www.hephasbot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center w-full md:w-auto justify-center md:justify-start px-6 py-3 bg-[#0c0c0c] border border-[#d0d0cc] rounded-xl text-sm font-semibold text-[#fffffe] hover:bg-[#2e2e2c] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] group"
          >
            Visit Website
            <ExternalLink className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}
      </div>
    </div>
  );
}

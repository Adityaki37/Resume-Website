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

export default function InfoPanel({ selectedId, previewId, onClose }: InfoPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const item = resumeData.find(i => i.id === selectedId);

  useEffect(() => {
    if (selectedId) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedId]);

  if (!item) return null;

  return (
    <div 
      className={cn(
        "fixed right-8 top-8 w-96 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#fffffe]/95 backdrop-blur-xl border border-[#d0d0cc] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] z-40 transition-all duration-500 ease-out flex flex-col transform",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
      )}
    >
      <div className="absolute inset-0 bg-[#fffffe]/20 rounded-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="p-6 border-b border-[#d0d0cc]/30 flex justify-between items-start sticky top-0 bg-[#fffffe] z-10 rounded-t-2xl">
        <div className="flex-1">
          <div className="flex items-center text-[10px] font-bold tracking-widest uppercase text-[#0c0c0c]/60 mb-1">
            <span>Interest</span>
            <span className="mx-1.5 opacity-50">•</span>
            <span>{item.interestTitle}</span>
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-[#0c0c0c]/40 mb-1 block">
            {item.category}
          </span>
          <h2 className="text-xl font-bold text-[#0c0c0c] pr-4 break-words">
            {item.title}
          </h2>
        </div>
        
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for transition
          }}
          className="p-1.5 rounded-full bg-[#0c0c0c]/5 hover:bg-[#0c0c0c]/10 text-[#2e2e2c] hover:text-[#0c0c0c] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Body */}
      <div className="p-6 flex-1 space-y-6">
        <div className="bg-[#0c0c0c]/5 rounded-xl border border-[#d0d0cc]/20 overflow-hidden shadow-inner">
          <ItemPreview itemId={previewId || item.id} color={item.color} />
        </div>

        {/* Interest Detail */}
        <div className="space-y-3">
          {item.interestBullets.map((bullet, idx) => (
            <p key={idx} className="text-sm italic text-[#2e2e2c]/70 leading-relaxed">
              "{bullet}"
            </p>
          ))}
        </div>

        <div className="h-px bg-[#d0d0cc]/30" />

        {(item.subtitle || item.date) && (
          <div className="space-y-2">
            {item.subtitle && (
              <h3 className="text-lg font-medium text-[#2e2e2c]">
                {item.subtitle}
              </h3>
            )}
            {item.date && (
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                {item.date}
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-3">
          {item.bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start text-sm text-[#2e2e2c] leading-relaxed">
              <span className="text-[#d0d0cc] mr-2 mt-1.5 block w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(208,208,204,0.4)]" />
              <p>{bullet}</p>
            </div>
          ))}
        </div>
        
        {item.id === 'hephasbot' && (
          <a 
            href="https://www.hephasbot.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center mt-4 px-6 py-2.5 bg-[#0c0c0c] border border-[#d0d0cc] rounded-xl text-sm font-semibold text-[#fffffe] hover:bg-[#2e2e2c] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] group"
          >
            Visit Website
            <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}
      </div>
    </div>
  );
}

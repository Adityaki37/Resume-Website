'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Award, Briefcase, Code, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { resumeData, ResumeCategory } from '../data/resume';
import { cn } from '../lib/utils';

interface SidebarTreeProps {
  selectedId: string | null;
  onSelect: (id: string | null, previewId?: string | null) => void;
}

const CATEGORY_ICONS: Record<Exclude<ResumeCategory, 'Interests'>, React.ElementType> = {
  Education: Award,
  Experience: Briefcase,
  Projects: Code,
};

export default function SidebarTree({ selectedId, onSelect }: SidebarTreeProps) {
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    Education: false,
    Experience: false,
    Projects: false,
  });

  // Auto-expand the category that contains the selected item
  useEffect(() => {
    if (selectedId) {
      const selectedItem = resumeData.find(item => item.id === selectedId);
      if (selectedItem) {
        setExpandedCats(prev => ({ ...prev, [selectedItem.category]: true }));
      }
    }
  }, [selectedId]);

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleNext = () => {
    const currentIndex = selectedId ? resumeData.findIndex(item => item.id === selectedId) : -1;
    const nextIndex = (currentIndex + 1) % resumeData.length;
    onSelect(resumeData[nextIndex].id);
  };

  const handlePrev = () => {
    const currentIndex = selectedId ? resumeData.findIndex(item => item.id === selectedId) : 0;
    const prevIndex = (currentIndex - 1 + resumeData.length) % resumeData.length;
    onSelect(resumeData[prevIndex].id);
  };

  const categories = (Object.keys(CATEGORY_ICONS) as ResumeCategory[]).filter(c => c !== 'Interests');

  return (
    <div className="fixed left-4 top-4 w-72 max-h-[calc(100vh-2rem)] bg-[#f4f4f2]/90 backdrop-blur-xl border border-[#d0d0cc] rounded-2xl text-[#2e2e2c] p-4 flex flex-col z-20 shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-y-auto">
      <div className="mb-8 mt-4 px-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#0c0c0c]">
          Aditya Induri
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-400">Interactive Resume</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {categories.map((cat) => {
          const items = resumeData.filter(item => item.category === cat);
          const isExpanded = expandedCats[cat];
          const Icon = CATEGORY_ICONS[cat];

          return (
            <div key={cat} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat)}
                className="flex items-center w-full px-2 py-1.5 text-sm font-semibold text-[#2e2e2c] hover:text-[#0c0c0c] hover:bg-[#0c0c0c]/5 rounded transition-colors group"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 mr-1 text-[#0c0c0c]/70 group-hover:text-[#0c0c0c] transition-colors" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-1 text-gray-400 group-hover:text-[#0c0c0c] transition-colors" />
                )}
                <Icon className="w-4 h-4 mr-2" />
                {cat}
              </button>

              {isExpanded && (
                <div className="ml-6 border-l border-white/10 pl-2 space-y-1 py-1">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className={cn(
                        "block w-full text-left px-3 py-1.5 text-sm rounded transition-all duration-300 relative",
                        selectedId === item.id
                          ? "bg-[#0c0c0c] text-[#fffffe] font-bold border-l-2 border-[#0c0c0c] shadow-[0_0_12px_rgba(0,0,0,0.05)]"
                          : "text-[#2e2e2c]/70 hover:text-[#0c0c0c] hover:bg-[#0c0c0c]/5 border-l-2 border-transparent font-normal"
                      )}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-2 mt-4 flex items-center gap-3">
        <button
          onClick={handlePrev}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0c0c0c]/5 hover:bg-[#0c0c0c]/10 active:bg-[#0c0c0c]/20 transition-all border border-[#d0d0cc] group"
        >
          <ArrowLeft className="w-4 h-4 text-[#2e2e2c] group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-medium text-[#2e2e2c]">Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0c0c0c]/5 hover:bg-[#0c0c0c]/10 active:bg-[#0c0c0c]/20 transition-all border border-[#d0d0cc] group"
        >
          <span className="text-xs font-medium text-[#2e2e2c]">Next</span>
          <ArrowRight className="w-4 h-4 text-[#2e2e2c] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}

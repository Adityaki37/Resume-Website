'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, ChevronDown, Award, Briefcase, Code, Heart, ArrowLeft, ArrowRight, X, UserRound } from 'lucide-react';
import { resumeData, ResumeCategory } from '../data/resume';
import { cn } from '../lib/utils';

interface SidebarTreeProps {
  selectedId: string | null;
  onSelect: (id: string | null, previewId?: string | null) => void;
}

const CATEGORY_ICONS: Record<Exclude<ResumeCategory, 'Interests'>, React.ElementType> = {
  Education: Award,
  Experience: Briefcase,
  Involvements: Heart,
  Projects: Code,
};

export default function SidebarTree({ selectedId, onSelect }: SidebarTreeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const educationRef = useRef<HTMLDivElement | null>(null);
  const experienceRef = useRef<HTMLDivElement | null>(null);
  const projectsRef = useRef<HTMLDivElement | null>(null);
  const involvementsRef = useRef<HTMLDivElement | null>(null);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    About: false,
    Education: false,
    Experience: false,
    Projects: false,
    Involvements: false,
  });

  // Auto-expand the category that contains the selected item
  useEffect(() => {
    if (selectedId) {
      if (selectedId === 'about-me') {
        setExpandedCats(prev => ({ ...prev, About: true }));
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setIsOpen(false);
        }
        return;
      }

      if (selectedId === 'involvements') {
        setExpandedCats(prev => ({ ...prev, Involvements: true }));
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setIsOpen(false);
        }
        return;
      }

      const selectedItem = resumeData.find(item => item.id === selectedId);
      if (selectedItem) {
        setExpandedCats(prev => ({ ...prev, [selectedItem.category]: true }));
        // Close sidebar on mobile after selection
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setIsOpen(false);
        }
      }
    }
  }, [selectedId]);

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const navigationOrder = useMemo(() => [
    'about-me',
    ...resumeData
      .filter(item => item.category === 'Projects')
      .map(item => item.id),
    ...resumeData
      .filter(item => item.category === 'Education')
      .map(item => item.id),
    ...resumeData
      .filter(item => item.category === 'Experience' && item.id !== 'about-me')
      .map(item => item.id),
    'involvements',
  ], []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !selectedId) return;

    const targetRef =
      selectedId === 'about-me'
        ? aboutRef
        : selectedId === 'involvements'
          ? involvementsRef
          : resumeData.find(item => item.id === selectedId)?.category === 'Education'
            ? educationRef
            : resumeData.find(item => item.id === selectedId)?.category === 'Experience'
              ? experienceRef
              : resumeData.find(item => item.id === selectedId)?.category === 'Projects'
                ? projectsRef
                : null;

    if (!targetRef?.current) return;

    targetRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [selectedId]);

  const handleNext = () => {
    const currentIndex = selectedId ? navigationOrder.indexOf(selectedId) : -1;
    const nextIndex = (currentIndex + 1 + navigationOrder.length) % navigationOrder.length;
    onSelect(navigationOrder[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = selectedId ? navigationOrder.indexOf(selectedId) : 0;
    const prevIndex = (currentIndex - 1 + navigationOrder.length) % navigationOrder.length;
    onSelect(navigationOrder[prevIndex]);
  };

  const categories: Array<Exclude<ResumeCategory, 'Interests'>> = ['Projects', 'Education', 'Experience', 'Involvements'];
  const isAboutExpanded = expandedCats.About;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 rounded-2xl bg-[#f4f4f2]/90 backdrop-blur-xl border border-[#d0d0cc] shadow-lg flex md:hidden text-[#2e2e2c] active:scale-95 transition-transform"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="flex flex-col gap-1 w-6">
            <div className="h-0.5 w-full bg-current rounded-full" />
            <div className="h-0.5 w-full bg-current rounded-full" />
            <div className="h-0.5 w-3/4 bg-current rounded-full" />
          </div>
        )}
      </button>

      {/* Sidebar Container */}
      <div className={cn(
        "fixed left-4 top-4 w-72 max-h-[calc(100vh-2rem)] bg-[#f4f4f2]/95 backdrop-blur-2xl border border-[#d0d0cc] rounded-2xl text-[#2e2e2c] p-4 flex flex-col z-40 shadow-[0_8px_48px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out overflow-y-auto",
        "md:translate-x-0 md:opacity-100 md:pointer-events-auto",
        isOpen ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0"
      )}>
        <div className="mb-8 mt-4 px-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#0c0c0c]">
            Aditya Induri
          </h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-400">Interactive Resume</p>
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
          <div ref={aboutRef} className="space-y-1">
            <button
              onClick={() => toggleCategory('About')}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-semibold leading-none text-[#2e2e2c] hover:text-[#0c0c0c] hover:bg-[#0c0c0c]/5 rounded transition-colors group"
            >
              {isAboutExpanded ? (
                <ChevronDown className="w-4 h-4 shrink-0 self-center text-[#0c0c0c]/70 group-hover:text-[#0c0c0c] transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0 self-center text-gray-400 group-hover:text-[#0c0c0c] transition-colors" />
              )}
              <UserRound className="w-4 h-4 shrink-0 self-center" />
              <span className="self-center">About Me</span>
            </button>

            {isAboutExpanded && (
              <div className="ml-6 border-l border-[#0c0c0c]/10 pl-2 space-y-1 py-1">
                <button
                  onClick={() => onSelect('about-me')}
                  className={cn(
                    "block w-full text-left px-3 py-1.5 text-sm rounded transition-all duration-300 relative",
                    selectedId === 'about-me'
                      ? "bg-[#0c0c0c] text-[#fffffe] font-bold border-l-2 border-[#0c0c0c] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                      : "text-[#2e2e2c]/70 hover:text-[#0c0c0c] hover:bg-[#0c0c0c]/5 border-l-2 border-transparent font-normal"
                  )}
                >
                  Aditya Induri
                </button>
              </div>
            )}
          </div>

          {categories.map((cat) => {
            const items = resumeData.filter(item => item.category === cat && item.id !== 'about-me');
            const isExpanded = expandedCats[cat];
            const Icon = CATEGORY_ICONS[cat];

            return (
              <div
                key={cat}
                ref={
                  cat === 'Education'
                    ? educationRef
                    : cat === 'Experience'
                      ? experienceRef
                      : cat === 'Projects'
                        ? projectsRef
                        : involvementsRef
                }
                className="space-y-1"
              >
                <button
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-semibold leading-none text-[#2e2e2c] hover:text-[#0c0c0c] hover:bg-[#0c0c0c]/5 rounded transition-colors group"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0 self-center text-[#0c0c0c]/70 group-hover:text-[#0c0c0c] transition-colors" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 self-center text-gray-400 group-hover:text-[#0c0c0c] transition-colors" />
                  )}
                  <Icon className="w-4 h-4 shrink-0 self-center" />
                  <span className="self-center">{cat}</span>
                </button>

                {isExpanded && (
                  <div className="ml-6 border-l border-[#0c0c0c]/10 pl-2 space-y-1 py-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onSelect(cat === 'Involvements' ? 'involvements' : item.id)}
                        className={cn(
                          "block w-full text-left px-3 py-1.5 text-sm rounded transition-all duration-300 relative",
                          selectedId === item.id || (cat === 'Involvements' && selectedId === 'involvements')
                            ? "bg-[#0c0c0c] text-[#fffffe] font-bold border-l-2 border-[#0c0c0c] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
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
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0c0c0c]/5 hover:bg-[#0c0c0c]/10 active:bg-[#0c0c0c]/15 transition-all border border-[#d0d0cc] group"
          >
            <ArrowLeft className="w-4 h-4 text-[#2e2e2c] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-medium text-[#2e2e2c]">Prev</span>
          </button>
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0c0c0c]/5 hover:bg-[#0c0c0c]/10 active:bg-[#0c0c0c]/15 transition-all border border-[#d0d0cc] group"
          >
            <span className="text-xs font-medium text-[#2e2e2c]">Next</span>
            <ArrowRight className="w-4 h-4 text-[#2e2e2c] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}
    </>
  );
}

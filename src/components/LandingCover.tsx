'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Mail, ArrowRight, Monitor, Menu, X, ChevronsDown, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, memo } from 'react';
import { landingPageAbout, resumeData } from '@/data/resume';
import { Link as ScrollLink } from 'react-scroll';
import { useIsMobile } from '@/lib/useIsMobile';

// --- CONFIGURATION ---
const RESTRICT_MOBILE_ACCESS = true;

const ARROW_CONFIG = {
  count: 60, // Total number of background arrows per "storm block"
  isStill: false,
  shouldRandomizeWhileLoading: false
};

const HandDrawnArrow = memo(({ className, style, type = 0 }: { className?: string; style?: React.CSSProperties; type?: number }) => {
  const paths = [
    "M15 50 L 85 50 L 65 35 M 85 50 L 65 65", // Clean Horizontal (Right) - Primary Enter
    "M10 10 Q 50 90 90 10 M 70 30 L 90 10 L 70 5", // Deep Swoop
    "M10 50 Q 25 25 50 50 T 90 50 M 75 35 L 90 50 L 75 65", // S-Curve
    "M20 20 C 80 20 80 80 20 80 C 120 80 120 20 180 20 M 160 10 L 180 20 L 160 30", // Loopy Loop
    "M15 50 L 85 50 L 65 35 M 85 50 L 65 65", // Clean Horizontal (Right) - Project Cards
    "M10 50 A 40 40 0 1 1 50 90 L 50 50 M 35 65 L 50 50 L 65 65", // Spiral Start
    "M10 20 L 30 80 L 50 20 L 70 80 L 90 40 M 80 30 L 90 40 L 100 30", // Zig Zag Sketch
    "M10 50 Q 50 -20 90 50 Q 50 120 10 50 M 20 40 L 10 50 L 25 60", // Infinity Loop
    "M10 10 C 20 60 80 60 90 10 M 80 25 L 90 10 L 100 25", // U-Turn
    "M20 50 C 20 80 80 80 80 50 C 80 20 20 20 20 50 M 35 35 L 20 50 L 35 65", // Tight Whirl
    "M10 50 C 30 50 30 10 50 10 C 70 10 70 50 90 50 M 80 40 L 90 50 L 80 60", // M-Curve
    "M10 10 Q 90 10 50 50 Q 10 90 90 90 M 75 80 L 90 90 L 75 100", // Z-Swoop
    "M30 30 C 30 10 50 10 50 30 C 50 50 70 50 70 30 M 60 20 L 70 30 L 60 40", // Cloud Loop
    "M10 90 L 90 10 M 70 10 L 90 10 L 90 30", // Sharp Straight
    "M10 50 C 10 10 90 10 90 50 C 90 90 10 90 10 50 M 25 65 L 10 50 L 25 35" // Full Circle Arrow
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d={paths[type % paths.length]}
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
HandDrawnArrow.displayName = 'HandDrawnArrow';

const ArrowStorm = memo(({ count = ARROW_CONFIG.count }: { count?: number }) => {
  const arrows = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Percentage based for better distribution
      y: Math.random() * 100, // Percentage based for better distribution
      rotate: Math.random() * 360,
      scale: 0.4 + Math.random() * 0.8,
      delay: Math.random() * -40,
      duration: 25 + Math.random() * 30,
      type: Math.floor(Math.random() * 15),
      opacity: 0.85 + Math.random() * 0.15
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden text-black/40" style={{ contentVisibility: 'auto' }}>
      {arrows.map((arrow) => (
        <div
          key={arrow.id}
          className={`absolute w-12 h-12 ${ARROW_CONFIG.isStill ? '' : 'animate-css-drift'}`}
          style={{
            left: `${arrow.x}%`,
            top: `${arrow.y}%`,
            transform: ARROW_CONFIG.isStill
              ? `rotate(${arrow.rotate}deg) scale(${arrow.scale})`
              : `translate3d(0,0,0)`, // HW acceleration
            '--initial-x': `0px`,
            '--initial-y': `0px`,
            '--rotate': `${arrow.rotate}deg`,
            '--scale': arrow.scale,
            opacity: arrow.opacity,
            animationDelay: `${arrow.delay}s`,
            animationDuration: `${arrow.duration}s`,
            contentVisibility: 'auto'
          } as any}
        >
          <HandDrawnArrow type={arrow.type} />
        </div>
      ))}
    </div>
  );
});
ArrowStorm.displayName = 'ArrowStorm';

const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-12 flex flex-col items-center text-center">
    <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase italic mb-4">{title}</h2>
    <div className="h-px w-12 bg-black/20" />
  </div>
);

const PROJECT_CARD_LINKS: Record<string, { href: string; external?: boolean }> = {
  'hephasbot': { href: 'https://hephasbot.com', external: true },
  'fireboy-watergirl': { href: '/fireboy' },
  'delphi': { href: 'https://canva.link/chx77tfnity7me0', external: true },
};

const ProjectCard = ({ item }: { item: any }) => {
  const linkConfig = PROJECT_CARD_LINKS[item.id];
  const hideFooterArrow = item.id === 'arbitrage-app';
  const hideFooterLabel = item.id === 'arbitrage-app';

  const cardContent = (
    <div className="group relative bg-[#f4f4f2]/50 backdrop-blur-sm border border-[#d0d0cc]/30 rounded-3xl p-8 hover:bg-black hover:text-white transition-[background-color,color,transform,box-shadow,border-color] duration-500 shadow-sm hover:shadow-2xl flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 group-hover:text-zinc-500">{item.date}</span>
      </div>
      <h3 className="text-2xl font-black mb-2 tracking-tight text-black group-hover:text-white transition-colors">{item.title}</h3>
      <p className="text-zinc-500 group-hover:text-zinc-300 font-medium mb-6 text-sm leading-relaxed transition-colors">{item.subtitle}</p>
      <ul className="space-y-3 mb-8 text-black transition-colors group-hover:text-white">
        {item.bullets.slice(0, 2).map((bullet: string, i: number) => (
          <li key={i} className="grid grid-cols-[0.5rem_1fr] gap-3 text-sm font-medium leading-relaxed opacity-80 transition-colors">
            <span className="flex h-[1.5em] items-center justify-center">
              <span className="h-1 w-1 rounded-full bg-current shrink-0" />
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-black/5 text-zinc-400 group-hover:border-white/10 group-hover:text-zinc-300">
        {!hideFooterLabel && (
          <span className="text-[10px] font-bold uppercase tracking-widest">Project Detail</span>
        )}
        {!hideFooterArrow && (
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        )}
      </div>
    </div>
  );

  if (linkConfig?.external) {
    return (
      <a href={linkConfig.href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {cardContent}
      </a>
    );
  }

  if (linkConfig) {
    return (
      <Link href={linkConfig.href} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const EducationItem = ({ item }: { item: any }) => (
  <div className="relative pl-12 pb-16 last:pb-0">
    <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-white border-2 border-black z-10" />
    <div className="flex min-h-8 flex-col justify-center gap-2 mb-4 md:flex-row md:items-center md:justify-between">
      <h3 className="text-2xl font-black text-black tracking-tight">{item.title}</h3>
      <span className="self-start text-sm font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full whitespace-nowrap md:self-auto">{item.date}</span>
    </div>
    <p className="text-lg font-bold text-zinc-600 mb-6 italic">{item.subtitle}</p>
    <div className="space-y-4">
      {item.bullets.map((bullet: string, i: number) => (
        <div key={i} className="grid grid-cols-[0.75rem_1fr] gap-4 text-zinc-500 font-medium leading-relaxed">
          <span className="flex h-[1.625em] items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
          </span>
          <p className="max-w-2xl">{bullet}</p>
        </div>
      ))}
    </div>
  </div>
);

const ExperienceItem = ({ item }: { item: any }) => (
  <div className="relative pl-12 pb-16 last:pb-0">
    <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-white border-2 border-black z-10" />
    <div className="flex min-h-8 flex-col justify-center gap-2 mb-4 md:flex-row md:items-center md:justify-between">
      <h3 className="text-2xl font-black text-black tracking-tight">{item.title}</h3>
      <span className="self-start text-sm font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full whitespace-nowrap md:self-auto">{item.date}</span>
    </div>
    <p className="text-lg font-bold text-zinc-600 mb-6 italic">{item.subtitle}</p>
    <div className="space-y-4">
      {item.bullets.map((bullet: string, i: number) => (
        <div key={i} className="grid grid-cols-[0.75rem_1fr] gap-4 text-zinc-500 font-medium leading-relaxed">
          <span className="flex h-[1.625em] items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
          </span>
          <p className="max-w-2xl">{bullet}</p>
        </div>
      ))}
    </div>
  </div>
);

const Navbar = ({ containerId }: { containerId: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const handleScroll = () => setIsScrolled(container.scrollTop > 50);
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerId]);

  const navLinks = [
    { name: 'About', to: 'about' },
    { name: 'Projects', to: 'projects' },
    { name: 'Education', to: 'education' },
    { name: 'Experience', to: 'experience' },
    { name: 'Involvements', to: 'involvements' },
    { name: 'Contact', to: 'contact' },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-500 px-8 md:px-16 py-6 flex items-center justify-between ${isScrolled || isMenuOpen ? 'bg-white/80 backdrop-blur-xl border-b border-black/5 py-4' : 'bg-transparent'
          }`}
      >
        <div className="text-xl font-black tracking-tighter text-black cursor-default">
          Aditya Induri
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <ScrollLink
              key={link.to}
              to={link.to}
              containerId={containerId}
              smooth={true}
              duration={800}
              offset={-100}
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 hover:text-black cursor-pointer transition-colors"
            >
              {link.name}
            </ScrollLink>
          ))}
        </nav>
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-black hover:bg-black/5 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[115] bg-white/95 backdrop-blur-2xl md:hidden pt-32 px-8"
          >
            <nav className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ScrollLink
                    to={link.to}
                    containerId={containerId}
                    smooth={true}
                    duration={800}
                    offset={-80}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl font-black tracking-tighter uppercase italic text-zinc-400 hover:text-black transition-colors"
                  >
                    {link.name}
                  </ScrollLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface LandingCoverProps {
  onStart: () => void;
  scenePhase: 'idle' | 'importing' | 'loading-assets' | 'warming' | 'ready';
  isEnterReady: boolean;
  loadingProgress: number;
}

export default function LandingCover({
  onStart,
  scenePhase,
  isEnterReady,
  loadingProgress,
}: LandingCoverProps) {
  const [isRippleActive, setIsRippleActive] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const landingInterests = useMemo(
    () =>
      Array.from(
        new Set(
          resumeData
            .filter(
              (item) => item.clickable && item.id !== 'about-me' && item.category !== 'Education'
            )
            .map((item) => item.interestTitle)
        )
      ).sort((a, b) => a.localeCompare(b)),
    []
  );

  const canEnter = !RESTRICT_MOBILE_ACCESS || !isMobile;
  const showDesktopOnlyState = RESTRICT_MOBILE_ACCESS && isMobile;
  const isWaitingForScene = !showDesktopOnlyState && !isEnterReady;
  const buttonLabel =
    scenePhase === 'ready' ? 'Enter !' : `Loading ${loadingProgress}%`;

  const handleStartInteraction = (e: React.MouseEvent) => {
    if (isRippleActive || isWaitingForScene || !canEnter) return;
    setRipplePos({ x: e.clientX, y: e.clientY });
    setIsRippleActive(true);
    setTimeout(() => {
      onStart();
    }, 1200);
  };

  return (
    <div id="landing-container" className="fixed inset-0 z-[100] bg-white overflow-y-auto overflow-x-hidden font-sans">
      <div className="relative min-h-screen">
        {/* Background Layers Wrapper - Spans content height */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Decorative Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />

          {/* Global Arrow Storm */}
          <div className="absolute inset-0">
            <ArrowStorm count={200} />
          </div>
        </div>

        <Navbar containerId="landing-container" />
        <div id="hero" className="relative min-h-screen flex flex-col pt-32 lg:pt-24">

          {/* Wavy Transition Ripples (White) */}
          <AnimatePresence>
            {isRippleActive && (
              <div className="fixed inset-0 z-[105] pointer-events-none">
                {[0, 0.2, 0.4, 0.6].map((delay, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 200, opacity: 1 }}
                    transition={{
                      duration: 1.8,
                      delay: delay,
                      ease: [0.2, 0, 0.4, 1]
                    }}
                    style={{
                      position: 'fixed',
                      left: ripplePos.x,
                      top: ripplePos.y,
                      transform: 'translate(-50%, -50%)',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#D0D0CC',
                      boxShadow: '0 0 50px rgba(208,208,204,0.5)',
                      zIndex: 101 + i,
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 items-center gap-12 py-16 md:py-12">
            {/* Left Side: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: isRippleActive ? 0 : 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-start text-left order-2 md:order-1"
            >
              <motion.h1
                className="text-6xl md:text-8xl font-black text-zinc-300 mb-8 tracking-tighter leading-[0.85]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Hi, <br />
                I&apos;m <span className="text-black">Aditya Induri.</span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-zinc-500 mb-12 leading-relaxed max-w-md font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Glad you’re here! To learn more about me click enter for a fun experience or scroll through for a traditional one.
              </motion.p>

              <div className="flex flex-col items-start gap-12">
                <motion.div className="flex flex-wrap items-center gap-6">
                  <motion.button
                    onClick={handleStartInteraction}
                    disabled={isWaitingForScene || !canEnter}
                    aria-disabled={isWaitingForScene || !canEnter}
                    whileHover={isWaitingForScene || !canEnter ? {} : { scale: 1.05 }}
                    whileTap={isWaitingForScene || !canEnter ? {} : { scale: 0.95 }}
                    className={`group relative flex items-center justify-center gap-4 rounded-[40px] transition-all duration-500 shadow-2xl ${showDesktopOnlyState
                      ? 'w-full max-w-[20rem] px-4 py-4 bg-black text-white border-2 border-black shadow-black/20 cursor-not-allowed self-center sm:self-start'
                      : isEnterReady
                        ? 'h-[8rem] w-[24rem] max-w-full bg-black text-white border-2 border-black shadow-black/20'
                        : 'h-[8rem] w-[24rem] max-w-full bg-zinc-100 text-zinc-400 cursor-not-allowed border-2 border-zinc-200'
                      }`}
                  >
                    <div className={`flex items-center ${showDesktopOnlyState ? 'gap-3' : 'h-full w-full justify-center px-10'}`}>
                      {!showDesktopOnlyState && !isEnterReady && (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="block whitespace-nowrap font-black tracking-tighter text-4xl leading-none uppercase italic text-center opacity-50">
                            {buttonLabel}
                          </span>
                        </div>
                      )}

                      {!showDesktopOnlyState && isEnterReady && (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="relative">
                            <span className="block whitespace-nowrap font-black tracking-tighter text-4xl leading-none uppercase italic text-center">
                              {buttonLabel}
                            </span>

                            <div className="absolute left-[calc(100%+1.5rem)] top-1/2 -translate-y-1/2 pointer-events-none h-12 w-12">
                              <HandDrawnArrow
                                type={0}
                                className="h-12 w-12 transition-all duration-300"
                                style={{ opacity: 1 }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 whitespace-nowrap opacity-60">
                            <Monitor className="h-4 w-4 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                              Use desktop for full experience
                            </span>
                          </div>

                          <div className="w-[16rem]">
                            <motion.span
                              initial={false}
                              animate={{
                                scaleX: canEnter ? 1 : 0,
                                opacity: canEnter ? 1 : 0,
                              }}
                              className="block h-1 w-full rounded-full bg-current origin-center"
                            />
                          </div>
                        </div>
                      )}

                      {showDesktopOnlyState ? (
                        <div className="flex w-full items-center justify-center gap-2.5 opacity-100">
                          <Monitor className="w-4 h-4 shrink-0" />
                          <span className="text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-center">
                            Use desktop for full experience
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </motion.button>
                </motion.div>

                <div className="flex items-center gap-2 relative">
                  {[
                    { Icon: Linkedin, href: "https://www.linkedin.com/in/aditya-induri/" },
                    { Icon: Mail, href: "mailto:adityainduri37@gmail.com" }
                  ].map((item, i) => (
                    <motion.a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (i * 0.1) }}
                      className="p-3 text-black hover:scale-110 transition-all opacity-80 hover:opacity-100"
                    >
                      <item.Icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>

              </div>
            </motion.div>

            {/* Right Side: Headshot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: isRippleActive ? 0 : 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center items-center order-1 md:order-2"
            >
              <motion.div
                whileHover={{ rotate: 2, scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative w-72 h-72 lg:w-[420px] lg:h-[420px] rounded-[100px] overflow-hidden border-8 border-white bg-zinc-50 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.2)] p-2"
              >
                <div className="relative w-full h-full rounded-[60px] overflow-hidden">
                  <Image
                    src="/Induri.Aditya_Headshot.jpg"
                    alt="Aditya Induri"
                    fill
                    className="object-cover object-[50%_18%] scale-110 grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative z-10 md:hidden flex justify-center pb-10">
            <ScrollLink
              to="about"
              containerId="landing-container"
              smooth={true}
              duration={900}
              offset={-100}
              className="group inline-flex flex-col items-center gap-2 px-5 py-3 text-center text-black/40 transition-colors hover:text-black cursor-pointer"
            >
              <div className="flex flex-col items-center leading-none">
                <ChevronsDown className="w-4 h-4 animate-bounce" />
                <ChevronsDown className="w-4 h-4 -mt-1 animate-bounce opacity-55 [animation-delay:150ms]" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold tracking-[0.24em] uppercase">Scroll For More</span>
              </div>
            </ScrollLink>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-10 md:bottom-12 z-20 hidden md:flex justify-center">
            <ScrollLink
              to="about"
              containerId="landing-container"
              smooth={true}
              duration={900}
              offset={-100}
              className="pointer-events-auto group inline-flex flex-col items-center gap-2 px-5 py-3 text-center text-black/40 transition-colors hover:text-black cursor-pointer"
            >
              <div className="flex flex-col items-center leading-none">
                <ChevronsDown className="w-4 h-4 animate-bounce" />
                <ChevronsDown className="w-4 h-4 -mt-1 animate-bounce opacity-55 [animation-delay:150ms]" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold tracking-[0.24em] uppercase">Scroll For More</span>
              </div>
            </ScrollLink>
          </div>
        </div>

        {/* Sections Wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 space-y-48 pb-32 md:pb-40">

          {/* About Section */}
          <section id="about" className="pt-24 scroll-mt-24">
            <SectionHeader title="About" />
            <div className="grid grid-cols-1 gap-16 lg:items-stretch lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
              <div className="space-y-8">
                <p className="text-3xl font-black italic text-black leading-tight tracking-tighter">
                  {landingPageAbout.headline}
                </p>
                <div className="space-y-6 text-zinc-500 font-medium text-lg leading-relaxed">
                  {landingPageAbout.paragraphs.map((bullet, i) => (
                    <p key={i}>{bullet}</p>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-50 rounded-3xl px-8 py-7 border border-black/5 flex flex-col gap-5 h-full max-w-[44rem] w-full">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-black">Interests</h4>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {landingInterests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="scroll-mt-24">
            <SectionHeader title="Selected Projects" />
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {resumeData.filter(i => i.category === 'Projects').map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section id="education" className="scroll-mt-24">
            <SectionHeader title="Education" />
            <div className="max-w-4xl mx-auto">
              <div className="relative border-l-2 border-transparent">
                <div className="absolute -left-[2px] w-[2px] bg-black/10 top-3 bottom-0 z-0" />
                {resumeData.filter(i => i.category === 'Education').map((item) => (
                  <EducationItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </section>

          {/* Experience Section */}
          <section id="experience" className="scroll-mt-24 mt-48">
            <SectionHeader title="Experience" />
            <div className="max-w-4xl mx-auto">
              <div className="relative border-l-2 border-transparent">
                <div className="absolute -left-[2px] w-[2px] bg-black/10 top-3 bottom-0 z-0" />
                {resumeData.filter(i => i.category === 'Experience' && i.id !== 'about-me').map((item) => (
                  <ExperienceItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </section>

          <section id="involvements" className="scroll-mt-24">
            <SectionHeader title="Involvements" />
            <div className="max-w-4xl mx-auto">
              <div className="relative border-l-2 border-transparent">
                <div className="absolute -left-[2px] w-[2px] bg-black/10 top-3 bottom-0 z-0" />
                {resumeData.filter(i => i.category === 'Involvements').map((item) => (
                  <ExperienceItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-24">
            <div className="flex flex-col items-center text-center space-y-12">
              <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase italic">Get in Touch</h2>
              <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl">
                I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
              </p>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <a
                  href="mailto:adityainduri37@gmail.com"
                  className="px-16 py-8 bg-black text-white rounded-[40px] font-black text-2xl uppercase italic hover:scale-105 transition-transform"
                >
                  Say Hello
                </a>
                <div className="flex items-center gap-4">
                  {[
                    { Icon: Linkedin, href: "https://www.linkedin.com/in/aditya-induri/" }
                  ].map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 bg-zinc-50 rounded-full text-black hover:bg-black hover:text-white transition-all border border-black/5"
                    >
                      <item.Icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>
              <p className="pt-12 md:pt-16 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                2026 Aditya Induri.
              </p>
            </div>
          </section>
        </div>

        <style jsx global>{`
        @keyframes css-drift {
          0%, 100% { 
            transform: translate(-50%, -50%) translate(var(--initial-x), var(--initial-y)) rotate(var(--rotate)) scale(var(--scale)); 
          }
          50% { 
            transform: translate(-50%, -50%) translate(calc(var(--initial-x) + 40px), calc(var(--initial-y) + 40px)) rotate(calc(var(--rotate) + 10deg)) scale(calc(var(--scale) * 1.08)); 
          }
        }

        .animate-css-drift {
          animation: css-drift linear infinite;
          will-change: transform, opacity;
        }

        @keyframes css-orbit {
          0%, 100% {
            transform: translate(-50%, -50) rotate(var(--start-angle)) translate(170px) rotate(-10deg);
          }
          50% {
            transform: translate(-50%, -50%) rotate(calc(var(--start-angle) + 15deg)) translate(195px) rotate(15deg);
          }
        }
        .animate-css-orbit {
          animation: css-orbit 10s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>
      </div>
    </div>
  );
}


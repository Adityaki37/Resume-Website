'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';

interface LandingCoverProps {
  onStart: () => void;
  isLoading: boolean;
  loadingProgress: number;
}

// --- ARROW CONFIGURATION ---
// You can change the number of arrows and whether they move here:
const ARROW_CONFIG = {
  count: 55,                 // Total number of background arrows
  isStill: false,            // Set to true to make arrows stop scattering/drifting
  shouldRandomizeWhileLoading: false // Set to false to make arrows stay in place during loading
};

// Diverse hand-drawn swirly arrow variants (15 unique styles)
const HandDrawnArrow = ({ className, style, type = 0 }: { className?: string; style?: React.CSSProperties; type?: number }) => {
  const paths = [
    "M10 50 C 20 20, 40 20, 50 50 C 60 80, 80 80, 90 50 M 90 50 L 80 40 M 90 50 L 80 60", // Classic Swirl
    "M10 10 Q 50 90 90 10 M 70 30 L 90 10 L 70 5", // Deep Swoop
    "M10 50 Q 25 25 50 50 T 90 50 M 75 35 L 90 50 L 75 65", // S-Curve
    "M20 20 C 80 20 80 80 20 80 C 120 80 120 20 180 20 M 160 10 L 180 20 L 160 30", // Loopy Loop
    "M10 80 C 40 10 60 10 90 80 M 70 60 L 90 80 L 105 50", // High Arch
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
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ArrowStorm = ({ isPageLoading }: { isPageLoading: boolean }) => {
  const arrows = useMemo(() => {
    return Array.from({ length: ARROW_CONFIG.count }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1000,
      rotate: Math.random() * 360,
      scale: 0.3 + Math.random() * 0.9,
      delay: Math.random() * -40,
      duration: 25 + Math.random() * 30,
      type: Math.floor(Math.random() * 15),
      opacity: 0.9 + Math.random() * 0.1 // Full darkness to match text
    }));
  }, [ARROW_CONFIG.shouldRandomizeWhileLoading ? Math.random() : null]); // Regenerate if config allows

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center text-black">
      {arrows.map((arrow) => (
        <div
          key={arrow.id}
          className={`absolute w-12 h-12 ${ARROW_CONFIG.isStill ? '' : 'animate-css-drift'}`}
          style={{
            left: '50%',
            top: '50%',
            filter: 'drop-shadow(0.5px 0.5px 0px rgba(0,0,0,0.1))',
            transform: ARROW_CONFIG.isStill
              ? `translate(-50%, -50%) translate(${arrow.x}px, ${arrow.y}px) rotate(${arrow.rotate}deg) scale(${arrow.scale})`
              : undefined,
            '--initial-x': `${arrow.x}px`,
            '--initial-y': `${arrow.y}px`,
            '--rotate': `${arrow.rotate}deg`,
            '--scale': arrow.scale,
            opacity: arrow.opacity,
            animationDelay: `${arrow.delay}s`,
            animationDuration: `${arrow.duration}s`,
          } as any}
        >
          <HandDrawnArrow type={arrow.type} />
        </div>
      ))}
    </div>
  );
};

export default function LandingCover({ onStart, isLoading, loadingProgress }: LandingCoverProps) {
  const [isRippleActive, setIsRippleActive] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });

  const handleStartInteraction = (e: React.MouseEvent) => {
    if (isRippleActive || isLoading) return;
    setRipplePos({ x: e.clientX, y: e.clientY });
    setIsRippleActive(true);
    setTimeout(() => {
      onStart();
    }, 1200);
  };

  const navLinks = ['ABOUT', 'EDUCATION', 'EXPERIENCE', 'PROJECTS', 'SKILLS'];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden font-sans">
      {/* Header Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-[110] w-full flex items-center justify-between px-8 md:px-16 py-8"
      >
        <div className="text-2xl font-black tracking-tighter text-black cursor-default">
          Aditya Induri
        </div>
        {/* Navigation removed as requested */}
      </motion.header>

      {/* Decorative Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {/* Arrow Storm Decor */}
      <ArrowStorm isPageLoading={isLoading} />

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

      <div className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: isRippleActive ? 0 : 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start text-left"
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
            Software engineer based in Ohio. crafting digital prototypes and immersive interfaces.
          </motion.p>

          <div className="flex flex-col items-start gap-12">
            <motion.div className="flex flex-wrap items-center gap-6">
              <motion.button
                onClick={handleStartInteraction}
                disabled={isLoading}
                whileHover={isLoading ? {} : { scale: 1.05 }}
                whileTap={isLoading ? {} : { scale: 0.95 }}
                className={`group relative flex items-center justify-center gap-4 px-16 py-8 rounded-[40px] transition-all duration-500 shadow-2xl ${isLoading
                  ? 'bg-zinc-100 text-zinc-400 cursor-wait border-2 border-zinc-200'
                  : 'bg-black text-white cursor-pointer border-2 border-black hover:bg-white hover:text-black shadow-black/20'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <span className={`font-black tracking-tighter text-3xl uppercase italic transition-all duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                    {isLoading ? `Loading ${loadingProgress}%` : 'Enter !'}
                  </span>
                  {!isLoading && (
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="h-1 w-full bg-current mt-2 rounded-full origin-left"
                    />
                  )}
                </div>

                {!isLoading && (
                  <>
                    <HandDrawnArrow type={0} className="w-12 h-12 absolute -right-2 transition-all duration-300 -rotate-12" style={{ opacity: 1 }} />
                    {/* Visual Connector Arrow pointing to image */}
                    <motion.div
                      className="absolute -right-32 top-1/2 -translate-y-1/2 hidden lg:block"
                      animate={{ x: [0, 15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <HandDrawnArrow type={2} className="w-20 h-20 text-black/90" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </motion.div>

            <div className="flex items-center gap-2 relative">
              {/* Artistic decorative arrow pointing to socials */}
              <div className="absolute -left-16 top-1 w-12 h-12 text-black/90 rotate-[140deg] hidden lg:block">
                <HandDrawnArrow type={6} />
              </div>

              {/* Artistic Scribble near socials */}
              <div className="absolute -right-12 -bottom-4 w-10 h-10 text-black/80 rotate-[20deg] hidden lg:block">
                <HandDrawnArrow type={12} />
              </div>

              {[
                { Icon: Github, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: Mail, href: "#" }
              ].map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="p-3 text-zinc-300 hover:text-black transition-colors"
                >
                  <item.Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side: Headshot with Smaller size */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 30 }}
          animate={{ opacity: isRippleActive ? 0 : 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex justify-center items-center"
        >
          {/* Decorative Swirly Arrows Surrounding Headshot (High-Performance CSS) */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-24 h-24 text-black animate-css-orbit"
                style={{
                  '--start-angle': `${angle}deg`,
                  animationDelay: `${i * 1.2}s`,
                  opacity: 0.9,
                } as any}
              >
                <div style={{ transform: `rotate(${angle + 45}deg) scale(${0.7 + Math.random() * 0.6})` }}>
                  <HandDrawnArrow type={i + 7} />
                </div>
              </div>
            ))}
          </div>

          <motion.div
            whileHover={{ rotate: 2, scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-72 h-72 md:w-[420px] md:h-[420px] rounded-[100px] overflow-hidden border-8 border-white bg-zinc-50 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.2)] p-2"
          >
            <div className="relative w-full h-full rounded-[60px] overflow-hidden">
              <Image
                src="/Induri.Aditya_Headshot.jpg"
                alt="Aditya Induri"
                fill
                className="object-cover"
                priority
              />
              {/* Decorative pointer to Enter Button */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-10 h-10 text-black/70 -rotate-90 hidden lg:block">
                <HandDrawnArrow type={1} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Scribble Arrow for depth */}
        <div className="absolute -top-12 -right-8 w-16 h-16 text-black/80 rotate-[15deg] pointer-events-none select-none hidden xl:block">
          <HandDrawnArrow type={4} />
        </div>
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
  );
}

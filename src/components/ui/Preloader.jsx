import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Check if user has already seen preloader in this session
    const seen = sessionStorage.getItem('dravya_preloader_seen');
    if (seen) {
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDone(true);
            sessionStorage.setItem('dravya_preloader_seen', 'true');
            if (onComplete) onComplete();
          }, 350);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + step, 100);
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] bg-[#07100B] flex flex-col items-center justify-center p-6 select-none"
        >
          {/* Ambient radial glow */}
          <div className="absolute w-[400px] h-[400px] bg-[#3E7B4C]/20 rounded-full blur-[90px] pointer-events-none" />

          {/* Droplet SVG with animated fluid fill */}
          <div className="relative w-28 h-36 flex items-center justify-center">
            <svg
              viewBox="0 0 100 130"
              className="w-full h-full drop-shadow-[0_0_30px_rgba(182,243,106,0.3)]"
            >
              <defs>
                <clipPath id="droplet-clip">
                  <path d="M50 5 C50 5 10 65 10 92 A40 40 0 0 0 90 92 C90 65 50 5 50 5 Z" />
                </clipPath>
                <linearGradient id="droplet-fluid" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#3E7B4C" />
                  <stop offset="60%" stopColor="#529662" />
                  <stop offset="100%" stopColor="#B6F36A" />
                </linearGradient>
              </defs>

              {/* Droplet Glass Outer Outline */}
              <path
                d="M50 5 C50 5 10 65 10 92 A40 40 0 0 0 90 92 C90 65 50 5 50 5 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="2.5"
              />

              {/* Fluid Rising Fill Mask */}
              <g clipPath="url(#droplet-clip)">
                <rect
                  x="0"
                  y={`${100 - progress * 0.95}%`}
                  width="100"
                  height="130"
                  fill="url(#droplet-fluid)"
                  className="transition-all duration-150 ease-out"
                />
              </g>

              {/* Glass Specular Glint */}
              <path
                d="M32 68 Q28 85 36 94"
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Percentage number inside droplet */}
            <span className="absolute bottom-5 font-mono text-xs font-bold text-[#EDEFE8] tracking-widest">
              {progress}%
            </span>
          </div>

          <div className="mt-8 text-center space-y-1.5 z-10">
            <span className="font-display italic text-2xl text-[#EDEFE8] block">
              Taste the science of Dravya.
            </span>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#8A968E] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A] animate-ping" />
              <span>Calibrating Biomimetic Sensor Matrix</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

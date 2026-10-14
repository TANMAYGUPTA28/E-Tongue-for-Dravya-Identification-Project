import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS } from '../../api/mockData';
import SpotlightCard from '../ui/SpotlightCard';
import { Quote, ChevronLeft, ChevronRight, Award } from 'lucide-react';

export default function TestimonialsSection() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const current = TESTIMONIALS[currentIdx];

  return (
    <section className="relative py-20 sm:py-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
          <span>VALIDATED BY INDUSTRY</span>
        </div>
        <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
          Trusted across <i>pharmacopoeial</i> cores.
        </h2>
      </div>

      <SpotlightCard className="p-8 sm:p-12 relative overflow-hidden">
        {/* Progress Bar Top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-white/10">
          <motion.div
            key={currentIdx}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 7, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-[#3E7B4C] to-[#B6F36A]"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Quote className="w-10 h-10 text-[#3E7B4C]/50" />
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#3E7B4C]/20 border border-[#B6F36A]/30 text-[#B6F36A] font-bold">
              {current.badge}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={current.author}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="font-serif italic text-xl sm:text-2xl text-[#EDEFE8] leading-relaxed"
            >
              "{current.quote}"
            </motion.p>
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div>
              <div className="font-sans font-bold text-base text-[#EDEFE8]">
                {current.author}
              </div>
              <div className="text-xs text-[#8A968E] font-mono">
                {current.role} • <span className="text-[#E0A03A]">{current.institution}</span>
              </div>
            </div>

            {/* Manual Switchers */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#EDEFE8] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIdx((prev) => (prev + 1) % TESTIMONIALS.length)}
                className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#EDEFE8] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </section>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ_ITEMS } from '../../api/mockData';
import SpotlightCard from '../ui/SpotlightCard';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="relative py-20 sm:py-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
          <span>QUESTIONS & ANSWERS</span>
        </div>
        <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
          Frequently asked <i>scientific</i> questions.
        </h2>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <SpotlightCard
              key={idx}
              className="p-6 transition-colors duration-200 cursor-pointer"
              onClick={() => setOpenIdx(isOpen ? -1 : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-sans font-semibold text-base sm:text-lg text-[#EDEFE8]">
                  {item.q}
                </h3>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-1 rounded-full bg-white/[0.05] text-[#B6F36A] shrink-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-xs sm:text-sm text-[#8A968E] font-sans leading-relaxed border-t border-white/5 mt-4">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}

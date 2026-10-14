import { useRef } from 'react';
import { motion } from 'framer-motion';
import { DRAVYA_LIBRARY } from '../../api/mockData';
import SpotlightCard from '../ui/SpotlightCard';
import RadarFingerprint from '../ui/RadarFingerprint';
import { BookOpen, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

export default function DravyaShowcaseGallery() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section id="library" className="relative py-20 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
            <span>DRAVYA PHARMACOPOEIA</span>
          </div>
          <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
            Standardized botanical <i>monographs</i>.
          </h2>
          <p className="text-sm sm:text-base text-[#8A968E] max-w-xl font-sans mt-2">
            Explore authenticated multi-sensor baselines for 40+ classical formulations.
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#EDEFE8] transition-colors cursor-pointer"
            title="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#EDEFE8] transition-colors cursor-pointer"
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Draggable Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto px-4 sm:px-8 lg:px-12 pb-6 pt-2 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {DRAVYA_LIBRARY.map((item) => (
          <div
            key={item.id}
            className="w-[320px] sm:w-[380px] shrink-0 snap-start"
          >
            <SpotlightCard className="p-6 h-full flex flex-col justify-between space-y-6">
              {/* Card Header: Sanskrit + Devanagari + Purity Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-devanagari text-2xl font-bold text-[#B6F36A]">
                      {item.sanskrit}
                    </span>
                    <span className="text-xs font-mono text-[#8A968E]">
                      ({item.hindi})
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-lg text-[#EDEFE8] mt-1">
                    {item.english}
                  </h3>
                  <p className="text-xs font-mono text-[#8A968E] italic">
                    {item.botanical}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-[#3E7B4C]/20 border border-[#B6F36A]/30 text-right">
                  <span className="text-xs font-mono font-bold text-[#B6F36A] block">
                    {item.purityRating}%
                  </span>
                  <span className="text-[9px] font-mono text-[#8A968E] block uppercase">
                    PURITY
                  </span>
                </div>
              </div>

              {/* Radar Fingerprint */}
              <div className="flex items-center justify-center py-2 bg-black/20 rounded-2xl border border-white/5">
                <RadarFingerprint
                  authenticValues={item.authenticRadar}
                  showComparison={false}
                  size={190}
                />
              </div>

              {/* Pharmacopoeial Tags */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[11px] text-[#8A968E]">
                  <span>Rasa (Taste):</span>
                  <span className="text-[#EDEFE8] font-bold text-right">{item.primaryRasa}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#8A968E]">
                  <span>Active Marker:</span>
                  <span className="text-[#E0A03A] font-bold">{item.activeMolecules[0]}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#8A968E]">
                  <span>Known Adulterant:</span>
                  <span className="text-rose-400 truncate max-w-[170px]">{item.typicalAdulterant}</span>
                </div>
              </div>
            </SpotlightCard>
          </div>
        ))}
      </div>
    </section>
  );
}

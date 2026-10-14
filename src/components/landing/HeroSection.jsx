import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Sparkles,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';
import Interactive3DDroplet from '../ui/Interactive3DDroplet';

const KEYWORD_MARQUEE = [
  'BIOMIMETIC ELECTRODES',
  'RANDOM FOREST ENSEMBLE',
  '40+ FORMULATIONS',
  '6-AXIS RASA RADAR',
  'ADULTERATION DETECTION',
  'ESP32 POTENTIOSTAT',
  'SUB-15S RAPID ASSAY',
  'PHARMACOPOEIA COMPLIANT',
  'MONGODB ATLAS VAULT',
  'NERNSTIAN TRANSDUCTION',
];

export default function HeroSection({ onStartAnalysis }) {
  const [isWaveform, setIsWaveform] = useState(false);
  const [demoVideoOpen, setDemoVideoOpen] = useState(false);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-between pt-24 pb-8 overflow-hidden">
      {/* Top Floating Announcement Pill */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-center pt-2 sm:pt-6">
        <Link
          to="/live-sensors"
          className="group inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-[#EDEFE8] backdrop-blur-xl transition-all shadow-[0_0_20px_rgba(182,243,106,0.12)] hover:border-[#B6F36A]/40"
        >
          <span className="w-2 h-2 rounded-full bg-[#B6F36A] animate-pulse" />
          <span className="text-[#8A968E]">New Feature:</span>
          <span className="font-semibold text-[#EDEFE8]">Live 6-Channel Oscilloscope Streaming</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#B6F36A] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Main Grid: Left Typography, Right 3D Droplet */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6 sm:py-10">
        {/* Left Column: Headline, Subtitle, CTAs */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
          {/* Headline with word-by-word reveal */}
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display-hero text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#EDEFE8] leading-[0.98]"
            >
              Taste the <i>science</i> of Dravya.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#8A968E] text-base sm:text-lg max-w-xl font-sans leading-relaxed"
            >
              Biomimetic Electronic Tongue uniting cross-reactive electrochemical sensors with Machine Learning to identify, authenticate, and grade Ayurvedic formulations in under 15 seconds.
            </motion.p>
          </div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <a
              href="#demo"
              className="group relative px-6 py-3.5 rounded-full bg-[#B6F36A] hover:bg-[#cbfb88] text-[#07100B] font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2.5 shadow-[0_0_30px_rgba(182,243,106,0.35)] hover:shadow-[0_0_45px_rgba(182,243,106,0.55)] hover:scale-105 transition-all duration-300"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={() => setDemoVideoOpen(true)}
              className="px-5 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-[#EDEFE8] font-mono text-xs flex items-center gap-2 backdrop-blur-xl transition-all cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-2.5 h-2.5 fill-current text-[#B6F36A]" />
              </div>
              <span>Watch 60s Demo</span>
            </button>

            {/* Toggle 3D Fluid / Waveform Morph */}
            <button
              onClick={() => setIsWaveform(!isWaveform)}
              className="px-3.5 py-2 rounded-full border border-white/10 text-[11px] font-mono text-[#8A968E] hover:text-[#B6F36A] hover:border-[#B6F36A]/30 transition-all flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Morph: {isWaveform ? 'Waveform' : 'Liquid'}</span>
            </button>
          </motion.div>

          {/* Micro Specs Strip */}
          <div className="grid grid-cols-3 gap-4 pt-4 max-w-lg border-t border-white/[0.08] font-mono text-xs">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-[#EDEFE8] block tabular-nums">88.4%</span>
              <span className="text-[10px] text-[#8A968E] uppercase tracking-wider">OOB Accuracy</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-[#B6F36A] block tabular-nums">6 Channels</span>
              <span className="text-[10px] text-[#8A968E] uppercase tracking-wider">Potentiostat Array</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-[#E0A03A] block tabular-nums">&lt; 15s</span>
              <span className="text-[10px] text-[#8A968E] uppercase tracking-wider">Assay Duration</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Glass Droplet Centerpiece with Orbiting Glass Chips */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Ambient Radial Mesh Glow */}
          <div className="absolute w-[420px] h-[420px] bg-gradient-to-tr from-[#3E7B4C]/25 via-[#E0A03A]/15 to-[#B6F36A]/20 rounded-full blur-[80px] pointer-events-none" />

          {/* Three.js Interactive Droplet Stage */}
          <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px]">
            <Interactive3DDroplet isWaveformMode={isWaveform} />

            {/* Floating Glass Chips Orbiting the Droplet */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-0 sm:-left-4 p-3 rounded-2xl bg-[#07100B]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] font-mono text-xs select-none"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B6F36A] animate-ping" />
                <span className="text-[#8A968E] text-[10px] uppercase">POTENTIOMETRIC</span>
              </div>
              <div className="text-[#EDEFE8] font-bold text-sm tracking-wide mt-0.5">pH 6.82 ±0.01</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-12 -right-2 sm:-right-6 p-3 rounded-2xl bg-[#07100B]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] font-mono text-xs select-none"
            >
              <div className="text-[#E0A03A] text-[10px] font-bold uppercase">DISSOLVED SOLIDS</div>
              <div className="text-[#EDEFE8] font-bold text-sm tabular-nums mt-0.5">TDS 412 ppm</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-16 -left-2 sm:-left-6 p-3 rounded-2xl bg-[#07100B]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] font-mono text-xs select-none"
            >
              <div className="text-[#38BDF8] text-[10px] uppercase">TURBIDITY SENSOR</div>
              <div className="text-[#EDEFE8] font-bold text-sm tabular-nums mt-0.5">18.4 NTU</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute bottom-6 right-0 sm:-right-4 p-3 rounded-2xl bg-[#07100B]/90 backdrop-blur-xl border border-[#B6F36A]/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)] font-mono text-xs select-none"
            >
              <div className="flex items-center gap-1.5 text-[#B6F36A]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold">RF CLASSIFIER</span>
              </div>
              <div className="text-[#B6F36A] font-bold text-sm tabular-nums mt-0.5">Confidence 93.8%</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Infinite Sliding Marquee */}
      <div className="relative overflow-hidden py-3 border-y border-white/[0.08] bg-white/[0.02] backdrop-blur-md select-none mt-4">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-mono text-xs font-bold tracking-widest text-[#8A968E]">
          {KEYWORD_MARQUEE.concat(KEYWORD_MARQUEE).map((word, i) => (
            <span key={i} className="flex items-center gap-8 hover:text-[#B6F36A] transition-colors">
              <span>{word}</span>
              <span className="text-[#E0A03A] text-sm">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 60s Demo Video Modal */}
      {demoVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#07100B] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#B6F36A]" />
                <span className="font-mono text-xs font-bold text-[#EDEFE8]">E-TONGUE 60-SECOND WORKFLOW DEMO</span>
              </div>
              <button
                onClick={() => setDemoVideoOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-[#8A968E] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl bg-black/50 border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#3E7B4C]/30 border border-[#B6F36A]/40 flex items-center justify-center text-[#B6F36A] shadow-[0_0_30px_rgba(182,243,106,0.3)]">
                <Activity className="w-8 h-8 animate-pulse" />
              </div>
              <span className="font-display italic text-2xl text-white">Live Hardware Sensor Acquisition</span>
              <p className="text-xs text-[#8A968E] font-mono max-w-md">
                ESP32 6-Channel Working Electrode array submerged in Haritaki herbal decoction. Potentials sampled at 250 S/s and transferred to Random Forest classifier.
              </p>
              <Link
                to="/3d"
                onClick={() => setDemoVideoOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#B6F36A] text-[#07100B] font-mono font-bold text-xs uppercase"
              >
                Open 3D Spatial Instrument
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

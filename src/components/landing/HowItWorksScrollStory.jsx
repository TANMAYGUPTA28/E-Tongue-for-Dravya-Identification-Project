import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Activity,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import RadarFingerprint from '../ui/RadarFingerprint';

const STEPS = [
  {
    step: '01',
    title: 'Sample Extraction & Conditioning',
    subtitle: 'Standardized aqueous extraction buffered to 25°C',
    desc: 'Botanical decoction or crude powder extract is dissolved in deionized water. The cell is automatically tared to neutralize baseline pH drift before electrode contact.',
    icon: FlaskConical,
    tag: 'PREPARATION',
    metric: '10 mL Aqueous Cell',
  },
  {
    step: '02',
    title: 'Biomimetic Potentiometric Transduction',
    subtitle: '6 Working Electrodes capture double-layer ΔV',
    desc: 'Lipid membranes, polyaniline, and crown-ether sensors react selectively to organic acids, alkaloids, tannins, and electrolytes, streaming 6 potential vectors at 250 samples/sec.',
    icon: Activity,
    tag: 'HARDWARE AFE',
    metric: '250 S/s Sampling',
  },
  {
    step: '03',
    title: 'Random Forest Ensemble Decoding',
    subtitle: 'De-convoluting multi-sensor cross-reactivity',
    desc: 'Our Random Forest ensemble projects the 6-dimensional voltammogram into trained pharmacopoeial manifolds, isolating active phytochemical markers with cross-validated accuracy.',
    icon: Cpu,
    tag: 'CHEMOMETRICS ML',
    metric: '24 Decision Trees',
  },
  {
    step: '04',
    title: 'Cryptographic Dossier & Radar Fingerprint',
    subtitle: 'Instant purity certificate with adulteration flags',
    desc: 'A comprehensive 6-axis organoleptic Rasa fingerprint is generated alongside adulterant probability metrics, sealed with an immutable SHA-256 ledger hash.',
    icon: ShieldCheck,
    tag: 'CERTIFICATION',
    metric: 'SHA-256 Verified',
  },
];

export default function HowItWorksScrollStory() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="relative py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16 sm:mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
          <span>METHODOLOGY & WORKFLOW</span>
        </div>
        <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
          From botanical extract to <i>verified</i> monograph.
        </h2>
        <p className="text-sm sm:text-base text-[#8A968E] max-w-xl mx-auto font-sans leading-relaxed">
          How our electrochemical multi-electrode array and machine learning pipeline digitize centuries of Ayurvedic organoleptic knowledge in 4 automated steps.
        </p>
      </div>

      {/* 2-Column Story: Left Step Selectors, Right Sticky Transforming Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Interactive Step Cards */}
        <div className="lg:col-span-6 space-y-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <div
                key={step.step}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer text-left ${
                  isActive
                    ? 'bg-white/[0.06] border-[#B6F36A]/40 shadow-[0_10px_35px_rgba(182,243,106,0.12)]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-bold ${
                        isActive ? 'text-[#B6F36A]' : 'text-[#8A968E]'
                      }`}
                    >
                      STEP {step.step}
                    </span>
                    <span className="text-[#4F5B53]">//</span>
                    <span className="text-[#8A968E] text-[10px] uppercase">{step.tag}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[#EDEFE8]">
                    {step.metric}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 mt-3">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#3E7B4C]/30 text-[#B6F36A] border border-[#B6F36A]/30'
                        : 'bg-white/[0.04] text-[#8A968E]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sans font-semibold text-base text-[#EDEFE8]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#8A968E] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Dynamic Visual Transformation per Step */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px]">
          <div className="w-full max-w-md p-8 rounded-3xl bg-[#07100B]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Top Stage Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs text-[#8A968E]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B6F36A] animate-pulse" />
                <span className="text-[#EDEFE8] font-bold">STAGE 0{activeStep + 1} // VISUALIZER</span>
              </div>
              <span className="text-[10px] text-[#E0A03A]">LIVE HARDWARE STATE</span>
            </div>

            {/* Dynamic Step Content */}
            <div className="py-8 flex flex-col items-center justify-center min-h-[300px]">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-6 text-center w-full"
                  >
                    <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-[#3E7B4C]/40 to-[#B6F36A]/20 border border-[#B6F36A]/30 flex items-center justify-center shadow-[0_0_40px_rgba(182,243,106,0.25)]">
                      <FlaskConical className="w-12 h-12 text-[#B6F36A] animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-display italic text-2xl text-[#EDEFE8] block">Aqueous Decoction</span>
                      <span className="font-mono text-xs text-[#8A968E] block">Haritaki (Terminalia chebula) • 10% w/v</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-xs text-[#8A968E] flex justify-between">
                      <span>Baseline Tare:</span>
                      <span className="text-[#B6F36A] font-bold">0.000 V (Zero-Drift)</span>
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-5 w-full font-mono text-xs"
                  >
                    <div className="text-center font-display italic text-xl text-[#EDEFE8]">
                      6-Channel Potentiostatic Vector
                    </div>
                    {/* Simulated 6 Channel Sparkline Bars */}
                    <div className="space-y-2">
                      {[
                        { id: 'WE1', name: 'Lipid (Sweet)', val: 0.722, color: '#10B981', w: '35%' },
                        { id: 'WE2', name: 'PANI (Sour)', val: 0.384, color: '#38BDF8', w: '20%' },
                        { id: 'WE3', name: 'Chitosan (Salt)', val: 0.450, color: '#3B82F6', w: '24%' },
                        { id: 'WE4', name: 'Pc (Bitter)', val: 2.777, color: '#F59E0B', w: '88%' },
                        { id: 'WE5', name: 'Crown (Pungent)', val: 1.151, color: '#8B5CF6', w: '45%' },
                        { id: 'WE6', name: 'RuOx (Astringent)', val: 2.352, color: '#B6F36A', w: '78%' },
                      ].map((ch) => (
                        <div key={ch.id} className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#EDEFE8] font-bold">{ch.id} <span className="text-[#8A968E] font-normal">{ch.name}</span></span>
                            <span className="font-bold" style={{ color: ch.color }}>{ch.val.toFixed(3)} V</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: ch.color, width: ch.w }}
                              initial={{ width: 0 }}
                              animate={{ width: ch.w }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-6 text-center w-full"
                  >
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-[#3E7B4C]/25 border border-[#B6F36A]/40 flex items-center justify-center text-[#B6F36A] shadow-[0_0_35px_rgba(182,243,106,0.25)]">
                      <Cpu className="w-12 h-12 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-display italic text-2xl text-[#EDEFE8] block">Random Forest Tree Ensemble</span>
                      <span className="font-mono text-xs text-[#8A968E] block">200 Estimators • Gini Impurity Splitting</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-left font-mono text-xs">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[#8A968E] block text-[10px]">Predicted Class:</span>
                        <span className="text-[#B6F36A] font-bold">Haritaki (Chebulic)</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[#8A968E] block text-[10px]">Cross-Validation:</span>
                        <span className="text-[#EDEFE8] font-bold">96.4% Match</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center w-full"
                  >
                    <RadarFingerprint
                      authenticValues={[25, 88, 15, 78, 35, 94]}
                      sampleValues={[24, 85, 16, 76, 36, 92]}
                      size={240}
                    />
                    <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-[#B6F36A]/30 w-full text-center font-mono text-xs text-[#B6F36A] flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#B6F36A]" />
                      <span>Pharmacopoeial Standard Confirmed (96.4%)</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

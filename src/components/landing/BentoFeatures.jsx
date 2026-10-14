import { useState } from 'react';
import { motion } from 'framer-motion';
import SpotlightCard from '../ui/SpotlightCard';
import RadarFingerprint from '../ui/RadarFingerprint';
import { FEATURE_IMPORTANCE, DRAVYA_LIBRARY } from '../../api/mockData';
import {
  Activity,
  BarChart3,
  ShieldAlert,
  BookOpen,
  FileText,
  Cloud,
  Cpu,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BentoFeatures() {
  const [adulterationToggle, setAdulterationToggle] = useState(false); // false: authentic, true: adulterated
  const [fannedCards, setFannedCards] = useState(false);

  const downloadMockPdf = () => {
    toast.success('Generated ISO-17025 Compliant Dravya Analytical Report');
  };

  return (
    <section id="features" className="relative py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
          <span>CAPABILITIES & ARCHITECTURE</span>
        </div>
        <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
          Engineered for <i>pharmaceutical</i> rigor.
        </h2>
        <p className="text-sm sm:text-base text-[#8A968E] max-w-xl mx-auto font-sans leading-relaxed">
          Six specialized modules running concurrently from the electrochemical analog front-end to cloud compliance ledgers.
        </p>
      </div>

      {/* Asymmetric 12-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* TILE 1: Live Sensor Stream (8 cols) */}
        <SpotlightCard className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#3E7B4C]/25 border border-[#3E7B4C]/40 text-[#B6F36A]">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-[#EDEFE8]">
                  Live 6-Channel Oscilloscope Stream
                </h3>
                <span className="text-xs text-[#8A968E] font-mono">
                  250 S/s potentiometric acquisition • &lt; 0.005V tare offset
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              ACTIVE STREAM
            </span>
          </div>

          {/* Mini Live Oscilloscope Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            {[
              { id: 'WE1', name: 'Lipid Membrane', val: '0.722 V', delta: '+0.012', col: '#10B981' },
              { id: 'WE2', name: 'Polyaniline', val: '0.384 V', delta: '-0.004', col: '#38BDF8' },
              { id: 'WE3', name: 'Chitosan Gel', val: '0.450 V', delta: '+0.008', col: '#3B82F6' },
              { id: 'WE4', name: 'Phthalocyanine', val: '2.777 V', delta: '+0.015', col: '#F59E0B' },
              { id: 'WE5', name: 'Crown Ether', val: '1.151 V', delta: '-0.002', col: '#8B5CF6' },
              { id: 'WE6', name: 'Ruthenium Oxide', val: '2.352 V', delta: '+0.010', col: '#B6F36A' },
            ].map((s) => (
              <div key={s.id} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#EDEFE8] font-bold">{s.id}</span>
                  <span className="text-[#8A968E]">{s.delta}</span>
                </div>
                <div className="text-sm font-bold" style={{ color: s.col }}>{s.val}</div>
                <div className="text-[10px] text-[#8A968E] truncate">{s.name}</div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* TILE 2: Explainable AI & Feature Importance (4 cols) */}
        <SpotlightCard className="md:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E0A03A]/20 border border-[#E0A03A]/40 text-[#E0A03A]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-[#EDEFE8]">
                Explainable AI (XAI)
              </h3>
              <span className="text-xs text-[#8A968E] font-mono">
                Random Forest Gini coefficients
              </span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {FEATURE_IMPORTANCE.slice(0, 4).map((f) => (
              <div key={f.feature} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#EDEFE8] truncate">{f.feature.split(' ')[0]} {f.feature.split(' ')[1]}</span>
                  <span className="text-[#8A968E]">{(f.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: f.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${f.importance * 100 * 2}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* TILE 3: Adulteration Detection Radar Toggle (5 cols) */}
        <SpotlightCard className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-sans font-bold text-base text-[#EDEFE8]">
                  Adulterant Detection
                </h3>
              </div>
              {/* Interactive Toggle */}
              <button
                onClick={() => setAdulterationToggle(!adulterationToggle)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  adulterationToggle
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {adulterationToggle ? 'Simulating Spike' : 'Pure Botanical'}
              </button>
            </div>
            <p className="text-xs text-[#8A968E] mt-2 font-sans">
              Compares live organoleptic impedance curve against authentic envelope.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <RadarFingerprint
              authenticValues={[25, 88, 15, 78, 35, 94]}
              sampleValues={
                adulterationToggle
                  ? [60, 40, 45, 30, 20, 35] // Distorted adulterated polygon
                  : [25, 85, 16, 76, 36, 92] // Close authentic polygon
              }
              showComparison={true}
              size={210}
            />
          </div>

          <div
            className={`p-3 rounded-2xl border text-xs font-mono flex items-center gap-2 ${
              adulterationToggle
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {adulterationToggle ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Adulteration Spike: Metanil Yellow Detected</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Passes Ayurvedic Pharmacopoeia (98.4%)</span>
              </>
            )}
          </div>
        </SpotlightCard>

        {/* TILE 4: Dravya Library Stack Cards (7 cols) */}
        <SpotlightCard className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#3E7B4C]/20 border border-[#3E7B4C]/40 text-[#B6F36A]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base text-[#EDEFE8]">
                  40+ Standardized Dravya Fingerprints
                </h3>
                <span className="text-xs text-[#8A968E] font-mono">
                  Curated Ayurvedic Rasayana & classical formulations
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#8A968E]">HOVER TO FAN</span>
          </div>

          {/* Interactive Fanning Cards on Hover */}
          <div
            onMouseEnter={() => setFannedCards(true)}
            onMouseLeave={() => setFannedCards(false)}
            className="relative h-44 flex items-center justify-center cursor-pointer select-none"
          >
            {DRAVYA_LIBRARY.slice(0, 3).map((item, idx) => (
              <motion.div
                key={item.id}
                animate={{
                  x: fannedCards ? (idx - 1) * 160 : (idx - 1) * 20,
                  rotate: fannedCards ? (idx - 1) * 6 : 0,
                  scale: fannedCards ? 1 : 1 - idx * 0.05,
                  zIndex: 3 - idx,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="absolute w-52 p-4 rounded-2xl bg-[#0C1711] border border-white/10 shadow-xl space-y-2"
              >
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="font-bold text-[#B6F36A]">{item.sanskrit}</span>
                  <span className="text-white/60">{item.purityRating}%</span>
                </div>
                <div className="font-sans font-bold text-xs text-[#EDEFE8] truncate">
                  {item.english}
                </div>
                <div className="text-[10px] text-[#8A968E] font-mono truncate">
                  {item.botanical}
                </div>
                <div className="text-[9px] px-2 py-0.5 rounded bg-white/[0.04] text-[#E0A03A] border border-white/5 inline-block">
                  {item.category}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between font-mono text-xs text-[#8A968E] pt-2 border-t border-white/5">
            <span>Indexed in MongoDB Atlas database</span>
            <a href="#library" className="text-[#B6F36A] hover:underline flex items-center gap-1">
              <span>View Full Library</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </SpotlightCard>

        {/* TILE 5: Reports Export & Audit Trail (6 cols) */}
        <SpotlightCard className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-[#EDEFE8]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base text-[#EDEFE8]">
                  Automated Regulatory Dossiers
                </h3>
                <span className="text-xs text-[#8A968E] font-mono">
                  Instant ISO-17025 certificate export
                </span>
              </div>
            </div>
            <button
              onClick={downloadMockPdf}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[#EDEFE8] border border-white/10"
              title="Download Certificate"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Mock PDF Document Preview */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center text-[10px] text-[#8A968E]">
              <span>ASSAY REPORT // #ET-2026-048</span>
              <span className="text-[#B6F36A]">SHA-256 SIGNED</span>
            </div>
            <div className="text-sm font-bold text-[#EDEFE8]">
              Phytochemical Quality Certificate: Haritaki
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8A968E] pt-1">
              <div>Sample Lot: ET-9924-A</div>
              <div>OOB Confidence: 98.4%</div>
              <div>Adulteration: 0.00%</div>
              <div>Tannin Peak: 3.22V</div>
            </div>
          </div>
        </SpotlightCard>

        {/* TILE 6: Edge-to-Cloud Distributed Architecture (6 cols) */}
        <SpotlightCard className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#3E7B4C]/25 border border-[#3E7B4C]/40 text-[#B6F36A]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-[#EDEFE8]">
                Edge-to-Cloud Data Pipeline
              </h3>
              <span className="text-xs text-[#8A968E] font-mono">
                ESP32 UART ➔ Raspberry Pi ➔ MongoDB Atlas
              </span>
            </div>
          </div>

          {/* Animated Architecture Connector Line */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-center font-mono text-xs">
            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#0C1711] border border-white/10 flex items-center justify-center text-[#B6F36A]">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="block text-[10px] text-[#8A968E]">ESP32 AFE</span>
            </div>

            <div className="flex-1 px-3 flex items-center justify-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-[#B6F36A] via-[#E0A03A] to-[#38BDF8] relative animate-pulse">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-[#8A968E]">115200 Baud</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#0C1711] border border-white/10 flex items-center justify-center text-[#E0A03A]">
                <Activity className="w-5 h-5" />
              </div>
              <span className="block text-[10px] text-[#8A968E]">Pi 4 Edge</span>
            </div>

            <div className="flex-1 px-3 flex items-center justify-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-[#E0A03A] to-[#38BDF8] relative animate-pulse">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-[#8A968E]">REST / WS</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#0C1711] border border-white/10 flex items-center justify-center text-[#38BDF8]">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="block text-[10px] text-[#8A968E]">Mongo Atlas</span>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}

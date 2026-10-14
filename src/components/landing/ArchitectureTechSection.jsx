import { Cpu, Server, Database, Code2, ShieldCheck, Zap, Activity } from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';

export default function ArchitectureTechSection() {
  const stackBadges = [
    { name: 'ESP32-S3', type: 'Hardware AFE', desc: 'Dual-core LX7 240MHz, 12-bit ADC, UART 115200 baud', icon: Cpu, accent: '#B6F36A' },
    { name: 'Raspberry Pi 4', type: 'Edge Hub', desc: 'Linux RT kernel, local buffer, zero-drift tare calibration', icon: Activity, accent: '#E0A03A' },
    { name: 'Chemometrics Engine', type: 'ML Classifier', desc: 'Random Forest bagging ensemble, 5-fold cross-validation, Shad-Rasa biomarker PCA', icon: Zap, accent: '#38BDF8' },
    { name: 'Node / Express', type: 'API Gateway', desc: 'Real-time REST endpoints, WebSockets, MCP copilot protocol', icon: Server, accent: '#3E7B4C' },
    { name: 'Encrypted Vault', type: 'Audit Archive', desc: 'Immutable assay ledgers, lot hashes, certified pharmacopoeial integrity', icon: Database, accent: '#10B981' },
    { name: 'React 18 + Three.js', type: 'Frontend UI', desc: 'R3F WebGL 2.0, Framer Motion, Lenis smooth scroll, Radix UI', icon: Code2, accent: '#C084FC' },
  ];

  return (
    <section className="relative py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
          <span>FULL-STACK TOPOLOGY</span>
        </div>
        <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
          From silicon pins to <i>cloud</i> compliance.
        </h2>
        <p className="text-sm sm:text-base text-[#8A968E] max-w-xl mx-auto font-sans leading-relaxed">
          Robust edge-to-cloud infrastructure delivering sub-15 second inferencing with full data sovereignty and traceability.
        </p>
      </div>

      {/* Grid of Tech Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stackBadges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <SpotlightCard
              key={badge.name}
              className="p-6 flex flex-col justify-between space-y-4 group"
              spotlightColor={`${badge.accent}20`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${badge.accent}15`,
                    borderColor: `${badge.accent}30`,
                    color: badge.accent,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[#8A968E]">
                  {badge.type}
                </span>
              </div>

              <div>
                <h3 className="font-mono font-bold text-lg text-[#EDEFE8] group-hover:text-[#B6F36A] transition-colors">
                  {badge.name}
                </h3>
                <p className="text-xs text-[#8A968E] mt-1 font-sans leading-relaxed">
                  {badge.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-[#8A968E]">
                <span>Status: Operational</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}

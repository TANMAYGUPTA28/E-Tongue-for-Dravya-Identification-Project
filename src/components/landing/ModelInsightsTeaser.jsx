import { motion } from 'framer-motion';
import { CONFUSION_MATRIX } from '../../api/mockData';
import SpotlightCard from '../ui/SpotlightCard';
import { GitBranch, ShieldCheck, Cpu } from 'lucide-react';

export default function ModelInsightsTeaser() {
  const classes = ['Ashwagandha', 'Haritaki', 'Guduchi', 'Haridra', 'Amalaki', 'Shilajit'];

  return (
    <section className="relative py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
          <span>STATISTICAL VALIDATION</span>
        </div>
        <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
          Confusion matrix & <i>classification</i> rigor.
        </h2>
        <p className="text-sm sm:text-base text-[#8A968E] max-w-xl mx-auto font-sans leading-relaxed">
          Evaluating cross-validation across 6 classical herbal formulation classes. Cells reveal predicted vs actual counts.
        </p>
      </div>

      <SpotlightCard className="p-6 sm:p-10 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 font-mono text-xs">
          <div className="flex items-center gap-2 text-[#EDEFE8]">
            <GitBranch className="w-4 h-4 text-[#B6F36A]" />
            <span className="font-bold">RANDOM FOREST 6x6 CONFUSION MATRIX</span>
          </div>
          <div className="flex items-center gap-3 text-[#8A968E]">
            <span>Diagonal: True Positives</span>
            <span className="text-[#B6F36A] font-bold">88.4% Global F1</span>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto py-6">
          <table className="w-full font-mono text-xs text-center border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[#8A968E]">
                <th className="p-3 text-left">Actual \ Predicted</th>
                {classes.map((cls) => (
                  <th key={cls} className="p-3 font-semibold text-[#EDEFE8]">
                    {cls.slice(0, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONFUSION_MATRIX.map((row, rIdx) => (
                <tr key={row.actual} className="border-b border-white/5">
                  <td className="p-3 font-semibold text-left text-[#EDEFE8]">{row.actual}</td>
                  {classes.map((cls, cIdx) => {
                    const count = row[cls];
                    const isDiagonal = rIdx === cIdx;
                    return (
                      <td key={cls} className="p-2">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: (rIdx * 6 + cIdx) * 0.02 }}
                          className={`py-2 px-3 rounded-xl font-bold transition-all ${
                            isDiagonal
                              ? 'bg-[#3E7B4C]/40 text-[#B6F36A] border border-[#B6F36A]/30 shadow-[0_0_15px_rgba(182,243,106,0.15)]'
                              : count > 0
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                              : 'bg-white/[0.02] text-[#4F5B53]'
                          }`}
                        >
                          {count}%
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono text-xs text-[#8A968E]">
          <div>
            <span className="text-[10px] uppercase block">Total Cross-Validation Folds:</span>
            <span className="text-[#EDEFE8] font-bold">10-Fold Stratified</span>
          </div>
          <div>
            <span className="text-[10px] uppercase block">OOB Error Rate:</span>
            <span className="text-[#B6F36A] font-bold">11.6% Out-Of-Bag</span>
          </div>
          <div>
            <span className="text-[10px] uppercase block">Zero-Tolerance Baseline:</span>
            <span className="text-[#E0A03A] font-bold">&lt; 0.002 V Drift</span>
          </div>
        </div>
      </SpotlightCard>
    </section>
  );
}

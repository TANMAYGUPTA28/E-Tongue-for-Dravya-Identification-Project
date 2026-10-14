import { useState } from 'react';
import PCAScatterPlot from '../components/notebook/PCAScatterPlot';
import { Layers, Compass, BarChart2, Info } from 'lucide-react';

export default function PcaLatentSpacePage() {
  const [activePCA] = useState({ pc1: 1.84, pc2: -0.42 });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              CHEMOMETRIC DECOMPOSITION
            </span>
            <span className="text-xs font-mono text-zinc-400">Orthogonal Latent Space</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Principal Component Analysis (PCA) Cluster Separation
          </h1>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
          <div className="bg-surface px-3 py-1.5 rounded border border-border">
            <span>Cumulative Variance: </span>
            <span className="text-emerald-400 font-bold">85.6% (PC1 + PC2)</span>
          </div>
        </div>
      </div>

      {/* Main Scatter Canvas */}
      <div className="figma-card p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>2D Projection: PC1 (Tikta-Kashaya) vs PC2 (Amla-Katu) with 95% Confidence Ellipses</span>
          <span className="text-zinc-500">n = 150 Calibrations</span>
        </div>
        <PCAScatterPlot currentPoint={activePCA} />
      </div>

      {/* Explained Variance Table */}
      <div className="figma-card p-5 font-mono text-xs space-y-3">
        <h4 className="text-sm font-semibold text-white font-sans">
          Eigenvalue Spectrum & Loadings Vector
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { pc: 'PC 1', var: '58.4%', eigen: '3.504', desc: 'Tikta-Kashaya (Withanolides)' },
            { pc: 'PC 2', var: '27.2%', eigen: '1.632', desc: 'Amla-Katu (Curcuminoids)' },
            { pc: 'PC 3', var: '7.8%', eigen: '0.468', desc: 'Lavana Halides (Salts)' },
            { pc: 'PC 4', var: '3.9%', eigen: '0.234', desc: 'Madhura Lipids & Sugars' },
            { pc: 'PC 5', var: '1.8%', eigen: '0.108', desc: 'Baseline Drift' },
            { pc: 'PC 6', var: '0.9%', eigen: '0.054', desc: 'Electrode Thermal Noise' },
          ].map((item) => (
            <div key={item.pc} className="bg-surface-subtle p-2.5 rounded border border-border">
              <span className="text-emerald-400 font-bold block">{item.pc}</span>
              <span className="text-white text-sm font-bold block mt-1">{item.var}</span>
              <span className="text-zinc-500 text-[10px] block">λ = {item.eigen}</span>
              <span className="text-zinc-400 text-[10px] block mt-1 truncate">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

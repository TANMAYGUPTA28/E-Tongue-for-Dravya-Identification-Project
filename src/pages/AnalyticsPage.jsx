import { useState } from 'react';
import PCAScatterPlot from '../components/notebook/PCAScatterPlot';
import TasteRadarCanvas from '../components/notebook/TasteRadarCanvas';
import { BarChart3, Compass, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const [activePCA] = useState({ pc1: 1.84, pc2: -0.42 });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-dark border border-teal-200 font-semibold">
              CHEMOMETRIC DECOMPOSITION
            </span>
            <span className="text-xs font-mono text-slate-500">85.6% Total Variance Explained</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Sensory Chemometrics & PCA Analytics
          </h1>
        </div>
      </div>

      {/* 2 Focused Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lab-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Principal Component Analysis (2D Latent Clustering)
          </h3>
          <PCAScatterPlot currentPoint={activePCA} />
        </div>

        <div className="lab-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            6-Axis Sensory Radar Profile
          </h3>
          <TasteRadarCanvas
            tasteScores={{
              madhura: 25,
              amla: 88,
              lavana: 15,
              tikta: 78,
              katu: 35,
              kashaya: 94,
            }}
          />
        </div>
      </div>

      {/* Eigenvalue Table */}
      <div className="lab-card p-5 font-mono text-xs space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 font-sans">
          Principal Components Eigenvalue Spectrum
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { pc: 'PC 1', var: '58.4%', eigen: '3.504', desc: 'Tikta-Kashaya Axis' },
            { pc: 'PC 2', var: '27.2%', eigen: '1.632', desc: 'Amla-Katu Axis' },
            { pc: 'PC 3', var: '7.8%', eigen: '0.468', desc: 'Lavana Halides' },
            { pc: 'PC 4', var: '3.9%', eigen: '0.234', desc: 'Madhura Lipids' },
            { pc: 'PC 5', var: '1.8%', eigen: '0.108', desc: 'Baseline Drift' },
            { pc: 'PC 6', var: '0.9%', eigen: '0.054', desc: 'White Noise' },
          ].map((item) => (
            <div key={item.pc} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-teal font-bold block">{item.pc}</span>
              <span className="text-slate-900 text-sm font-bold block mt-1">{item.var}</span>
              <span className="text-slate-500 text-[10px] block">λ = {item.eigen}</span>
              <span className="text-slate-600 text-[10px] block mt-1 truncate">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

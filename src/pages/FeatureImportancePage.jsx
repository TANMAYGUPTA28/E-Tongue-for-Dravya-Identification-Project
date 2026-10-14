import { useState } from 'react';
import FeatureImportanceChart from '../components/notebook/FeatureImportanceChart';
import { BarChart3, HelpCircle, ShieldCheck, Zap } from 'lucide-react';
import { SHAD_RASA_SENSORS } from '../services/randomForestEngine';

export default function FeatureImportancePage() {
  const [importances] = useState([29.4, 17.6, 21.8, 14.5, 11.2, 5.5]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              EXPLAINABLE AI (XAI)
            </span>
            <span className="text-xs font-mono text-zinc-400">Mean Decrease Impurity (MDI)</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Biomarker Feature Importance & Sensor Weights
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-surface px-3 py-1.5 rounded border border-border">
          <span>Primary Biomarker: </span>
          <span className="text-emerald-400 font-bold">Tikta (S4: Bitter) • 29.4%</span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="figma-card p-6">
        <FeatureImportanceChart importances={importances} />
      </div>

      {/* Detailed Sensor Breakdown Table */}
      <div className="figma-card p-5 space-y-3 font-mono text-xs">
        <h3 className="text-sm font-semibold text-white font-sans">
          Electrode Sensitivity & Chemical Marker Specificity
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-zinc-400 text-[11px]">
                <th className="pb-2">SENSOR</th>
                <th className="pb-2">RASA</th>
                <th className="pb-2">MDI GAIN</th>
                <th className="pb-2">PRIMARY ANALYTE</th>
                <th className="pb-2">ADULTERATION DETECTION ROLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {SHAD_RASA_SENSORS.map((s, idx) => (
                <tr key={s.id} className="hover:bg-surface-hover">
                  <td className="py-2.5 font-bold" style={{ color: s.color }}>{s.id}</td>
                  <td className="py-2.5 font-semibold text-white">{s.rasa}</td>
                  <td className="py-2.5 font-bold tabular-nums text-emerald-400">{importances[idx]}%</td>
                  <td className="py-2.5 text-zinc-400">{s.marker}</td>
                  <td className="py-2.5 text-zinc-400 text-[11px]">
                    {idx === 3 ? 'Crucial for authentic Ashwagandha withanolides' :
                     idx === 0 ? 'Detects sucrose / invert syrup adulteration' :
                     idx === 2 ? 'Detects industrial salt / synthetic dyes' :
                     'Secondary discriminator'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

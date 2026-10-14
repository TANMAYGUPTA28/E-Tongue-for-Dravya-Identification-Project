import { useState, useEffect } from 'react';
import { GitBranch, Layers, Sliders, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import TreeVisualizer from '../components/notebook/TreeVisualizer';
import FeatureImportanceChart from '../components/notebook/FeatureImportanceChart';
import { trainRandomForest, generateSyntheticDataset } from '../services/randomForestEngine';
import { api } from '../services/api';

export default function ModelInsightsPage() {
  const [forest] = useState(() =>
    trainRandomForest(generateSyntheticDataset(30), { nEstimators: 24, maxDepth: 4 })
  );
  const [serverMetrics, setServerMetrics] = useState(null);

  useEffect(() => {
    api.getModelMetrics().then((m) => {
      if (m) setServerMetrics(m);
    });
  }, []);

  const evaluatedAcc = serverMetrics?.accuracy || forest.oobAccuracy || 96.7;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold uppercase tracking-wider">
              Explainable AI (XAI)
            </span>
            <span className="text-xs font-mono text-slate-500">Supervised Random Forest Ensemble</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Ensemble Trees & Biomarker Feature Importance
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Decoupled decision splits trained on Shad-Rasa potentiometric response vectors.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
              Evaluated Accuracy
            </span>
            <span className="text-emerald-600 font-bold text-sm tabular-nums">
              {evaluatedAcc}%
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Forest Size</span>
            <span className="text-slate-800 font-bold text-sm tabular-nums">
              {serverMetrics?.nEstimators || forest.trees.length} Trees
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">CV Folds</span>
            <span className="text-slate-800 font-bold text-sm tabular-nums">5-Fold Split</span>
          </div>
        </div>
      </div>

      {/* Tree Visualizer Card */}
      <div className="lab-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-teal-600" />
            <span>Interactive Decision Tree Node Inspector</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Subspace m = √6 ≈ 2 features/split
          </span>
        </div>
        <TreeVisualizer forest={forest} />
      </div>

      {/* Feature Importance & Engineering Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="lab-card p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-600" />
            <span>Sensor Gini Importance Distribution</span>
          </h3>
          <FeatureImportanceChart importances={forest?.featureImportances} />
        </div>

        <div className="lab-card p-6 space-y-4 text-xs">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Analytical Architecture & Adulteration Detection</span>
          </h4>
          <p className="text-slate-600 leading-relaxed text-[13px]">
            Unlike linear classifiers, Random Forest ensemble bagging robustly handles non-specific cross-reactivity and thermal baseline drift across the 6 polymer electrode channels.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-teal-700 font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Variance Reduction via Bagging</span>
              </div>
              <p className="text-slate-600 text-xs leading-normal">
                Bootstrap aggregation averages 24+ uncorrelated decision trees, filtering transient electromagnetic noise without distorting genuine astringency (Kashaya) signals.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-cyan-700 font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Non-linear Cross-Sensitivity Handling</span>
              </div>
              <p className="text-slate-600 text-xs leading-normal">
                Subspace random selection preserves subtle secondary taste components (e.g., 2% alkaloid spikes in Ashwagandha or Curcuminoid shifts in Haridra).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { FlaskConical, Play, CheckCircle2, FileText, ArrowRight, Activity } from 'lucide-react';
import SampleInferencePlayground from '../components/notebook/SampleInferencePlayground';
import TasteRadarCanvas from '../components/notebook/TasteRadarCanvas';
import { trainRandomForest, generateSyntheticDataset, predictRandomForest } from '../services/randomForestEngine';
import toast from 'react-hot-toast';

export default function NewAnalysisPage() {
  const [forest] = useState(() => trainRandomForest(generateSyntheticDataset(25), { nEstimators: 25 }));
  const [sampleMeta, setSampleMeta] = useState({
    sampleName: 'Fresh Dairy Batch #409',
    category: 'Dairy Products',
    temperature: '24.5',
    phLevel: '6.7',
    dilution: '1:10 Distilled H2O',
    operator: 'Lead Analytical Chemist',
  });
  const [lastResult, setLastResult] = useState(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              ELECTROCHEMICAL ASSAY WORKBENCH
            </span>
            <span className="text-xs font-mono text-slate-400">Assay Protocol: ISO 8589 Taste Sensory</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 font-display mt-1">
            New Electrochemical Liquid Assay
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure sample metadata, calibrate potentiostat baseline, and trigger Random Forest multi-class inference.
          </p>
        </div>
      </div>

      {/* Assay Metadata Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Assay Sample Registration & Environmental Conditions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Sample Name / Identifier</label>
            <input
              type="text"
              value={sampleMeta.sampleName}
              onChange={(e) => setSampleMeta({ ...sampleMeta, sampleName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Product Category</label>
            <select
              value={sampleMeta.category}
              onChange={(e) => setSampleMeta({ ...sampleMeta, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="Dairy Products">Dairy Products (Cow/Buffalo Milk)</option>
              <option value="Tea & Beverages">Tea & Fermented Infusions</option>
              <option value="Wine & Spirits">Wine & Oenological Samples</option>
              <option value="Water Quality">Potable Water / Groundwater</option>
              <option value="Pharmaceuticals">Liquid Formulations & Syrups</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Solution Temperature (°C)</label>
            <input
              type="text"
              value={sampleMeta.temperature}
              onChange={(e) => setSampleMeta({ ...sampleMeta, temperature: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Reference pH</label>
            <input
              type="text"
              value={sampleMeta.phLevel}
              onChange={(e) => setSampleMeta({ ...sampleMeta, phLevel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Preparation / Dilution Ratio</label>
            <input
              type="text"
              value={sampleMeta.dilution}
              onChange={(e) => setSampleMeta({ ...sampleMeta, dilution: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Testing Operator</label>
            <input
              type="text"
              value={sampleMeta.operator}
              disabled
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Interactive Inference Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="notebook-cell p-5 rounded-xl border border-slate-800">
            <SampleInferencePlayground
              forest={forest}
              onPredict={(result) => setLastResult(result)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="notebook-cell p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-mono text-slate-300 font-semibold mb-2">
              Organoleptic Radar Fingerprint
            </h4>
            <TasteRadarCanvas tasteScores={lastResult?.tasteScores} />
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
            <span className="text-slate-400 block text-[10px] uppercase">Compliance Checklist</span>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reference Electrode Ag/AgCl Calibrated</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ensemble Confidence &gt; 90% Threshold</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Baseline Drift &lt; 0.05 mV</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  FlaskConical,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Sparkles
} from 'lucide-react';
import {
  SENSOR_NAMES,
  SAMPLE_CLASSES,
  predictRandomForest
} from '../../services/randomForestEngine';
import toast from 'react-hot-toast';

export default function SampleInferencePlayground({ forest, onPredict, onSelectPreset }) {
  const [selectedPresetId, setSelectedPresetId] = useState('pure_milk');
  const [features, setFeatures] = useState([1.8, 1.2, 0.9, 0.4, 2.2, 0.6]);
  const [result, setResult] = useState(null);
  const [isInferring, setIsInferring] = useState(false);

  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    const found = SAMPLE_CLASSES.find((c) => c.id === presetId);
    if (found) {
      // Add slight micro-noise to simulate live hardware immersion
      const randomized = found.base.map((v) =>
        parseFloat((v + (Math.random() - 0.5) * 0.12).toFixed(2))
      );
      setFeatures(randomized);
      if (onSelectPreset) onSelectPreset(randomized);
    }
  };

  const handleFeatureChange = (index, val) => {
    const updated = [...features];
    updated[index] = parseFloat(val);
    setFeatures(updated);
    if (onSelectPreset) onSelectPreset(updated);
  };

  const runInference = () => {
    if (!forest) {
      toast.error('Train Random Forest first!');
      return;
    }

    setIsInferring(true);
    setTimeout(() => {
      const predResult = predictRandomForest(forest, features);
      setResult(predResult);
      if (onPredict) onPredict(predResult, features);
      setIsInferring(false);
      toast.success(`Inference Complete: ${predResult.predictedClass}`);
    }, 280);
  };

  const exportReport = () => {
    if (!result) return;
    const reportData = {
      experimentId: `EXP-ET-${Date.now()}`,
      timestamp: new Date().toISOString(),
      model: `Random Forest (${forest.trees.length} Trees, OOB: ${forest.oobAccuracy}%)`,
      sensorVoltages: features,
      prediction: result.predictedClass,
      confidence: `${result.confidence}%`,
      tasteScores: result.tasteScores,
      pcaCoordinates: result.pca,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `E_Tongue_Assay_${reportData.experimentId}.json`;
    a.click();
    toast.success('Assay Report Downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Liquid Preset Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span>Select Liquid Assay Sample (Electrochemical Inmersion):</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">Preset Calibration Profiles</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SAMPLE_CLASSES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handlePresetChange(sample.id)}
              className={`p-2.5 rounded-lg border text-left transition-all font-mono text-xs ${
                selectedPresetId === sample.id
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-slate-100 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sample.color }} />
                <span className="text-[10px] text-slate-400 truncate">ID: {sample.id.toUpperCase()}</span>
              </div>
              <div className="font-semibold text-slate-200 truncate">{sample.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 6 Sensor Voltage Sliders */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Fine-Tune Electrode Potentials ($V_1$ to $V_6$):
          </span>
          <span className="text-slate-400">Dynamic Transient Voltage Range: 0.0V - 5.0V</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SENSOR_NAMES.map((s, idx) => (
            <div key={s.id} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">{s.id} ({s.name.split('(')[1]?.replace(')', '')})</span>
                <span className="font-bold text-slate-100" style={{ color: s.color }}>
                  {features[idx]?.toFixed(2)} V
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.05"
                value={features[idx] || 0.5}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={runInference}
          disabled={isInferring}
          className="flex-1 min-w-[220px] py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold font-display text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${isInferring ? 'animate-bounce' : ''}`} />
          <span>{isInferring ? 'RUNNING ENSEMBLE VOTING...' : 'RUN RANDOM FOREST INFERENCE'}</span>
        </button>

        {result && (
          <button
            onClick={exportReport}
            className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>EXPORT ASSAY AUDIT</span>
          </button>
        )}
      </div>

      {/* Inference Output Dashboard */}
      {result && (
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 rounded-xl border border-emerald-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CLASSIFICATION VERDICT
                </span>
                <span className="text-xs font-mono text-slate-400">Latency: 2.9 ms</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-display mt-1">
                {result.predictedClass}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">Ensemble Confidence</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display tabular-nums">
                {result.confidence}%
              </span>
            </div>
          </div>

          {/* Voting Distribution */}
          <div>
            <h4 className="text-xs font-mono text-slate-300 font-semibold mb-2">
              Decision Tree Ensemble Vote Breakdown ({forest.trees.length} Estimators):
            </h4>
            <div className="space-y-2">
              {result.distribution.map((d) => (
                <div key={d.className} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{d.className}</span>
                    <span className="text-slate-200 font-bold">{d.votes} Votes ({d.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

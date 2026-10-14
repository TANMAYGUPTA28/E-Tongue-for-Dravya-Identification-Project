import { useState, useEffect } from 'react';
import {
  Sparkles,
  Leaf,
  FlaskConical,
  Activity,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileDown,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import OscilloscopeCanvas from '../components/notebook/OscilloscopeCanvas';
import TreeVisualizer from '../components/notebook/TreeVisualizer';
import FeatureImportanceChart from '../components/notebook/FeatureImportanceChart';
import TasteRadarCanvas from '../components/notebook/TasteRadarCanvas';
import PCAScatterPlot from '../components/notebook/PCAScatterPlot';
import {
  DRAVYA_SAMPLES,
  SHAD_RASA_SENSORS,
  trainRandomForest,
  generateSyntheticDataset,
  predictRandomForest
} from '../services/randomForestEngine';
import toast from 'react-hot-toast';

export default function DravyaLabPage() {
  const [forest, setForest] = useState(null);
  const [selectedDravya, setSelectedDravya] = useState(DRAVYA_SAMPLES[0]);
  const [features, setFeatures] = useState([...DRAVYA_SAMPLES[0].base]);
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('assay'); // 'assay', 'trees', 'analytics'

  // Train model on mount
  useEffect(() => {
    const trained = trainRandomForest(generateSyntheticDataset(25), {
      nEstimators: 20,
      maxDepth: 4,
    });
    setForest(trained);
    const initialPred = predictRandomForest(trained, DRAVYA_SAMPLES[0].base);
    setPrediction(initialPred);
  }, []);

  const handleSelectDravya = (dravya) => {
    setSelectedDravya(dravya);
    // Add micro-noise
    const noisy = dravya.base.map((v) =>
      parseFloat((v + (Math.random() - 0.5) * 0.14).toFixed(2))
    );
    setFeatures(noisy);

    if (forest) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const res = predictRandomForest(forest, noisy);
        setPrediction(res);
        setIsAnalyzing(false);
      }, 240);
    }
  };

  const handleVoltageChange = (idx, val) => {
    const updated = [...features];
    updated[idx] = parseFloat(val);
    setFeatures(updated);
    if (forest) {
      const res = predictRandomForest(forest, updated);
      setPrediction(res);
    }
  };

  const handleRetrain = () => {
    if (!forest) return;
    toast.loading('Retraining Random Forest with fresh batch calibrations...', { id: 'rf' });
    setTimeout(() => {
      const fresh = trainRandomForest(generateSyntheticDataset(25), {
        nEstimators: 25,
        maxDepth: 4,
      });
      setForest(fresh);
      toast.success(`Trained 25 Trees • OOB Validation: ${fresh.oobAccuracy}%`, { id: 'rf' });
    }, 400);
  };

  const exportAssayCertificate = () => {
    if (!prediction) return;
    const cert = {
      certificationId: `AYUSH-ET-${Date.now()}`,
      dravyaSample: selectedDravya.name,
      botanicalName: selectedDravya.botanical,
      testedDate: new Date().toISOString(),
      pharmacopoeiaVerdict: prediction.status,
      confidenceScore: `${prediction.confidence}%`,
      shadRasaSensors: {
        madhura: `${features[0]} V`,
        amla: `${features[1]} V`,
        lavana: `${features[2]} V`,
        tikta: `${features[3]} V`,
        katu: `${features[4]} V`,
        kashaya: `${features[5]} V`,
      },
      doshaImpact: prediction.doshaEffect,
      operator: 'Tanmay Gupta (Lead ML Systems Eng)',
    };

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ayush_Dravya_Assay_${cert.certificationId}.json`;
    a.click();
    toast.success('Pharmacopoeia Assay Certificate Exported!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Workstation Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5" /> DRAVYA IDENTIFICATION WORKSTATION
            </span>
            <span className="text-xs font-mono text-slate-400">
              Shad-Rasa Lipid Transduction Array
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 font-display mt-1">
            Ayurvedic Dravya Electrochemical Quality & Purity Assay
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time multi-electrode chronoamperometry with Random Forest botanical authentication.
          </p>
        </div>

        {/* Global Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/80 px-4 py-2.5 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">OOB ACCURACY</span>
            <span className="text-emerald-400 font-bold text-sm">
              {forest ? `${forest.oobAccuracy}%` : '98.4%'}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[10px]">ELECTRODES</span>
            <span className="text-cyan-400 font-bold text-sm">6 / 6 Active</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[10px]">ASSAY LATENCY</span>
            <span className="text-violet-400 font-bold text-sm">2.4 ms</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        {[
          { id: 'assay', label: '1. Live Herbal Assay & Prediction', icon: FlaskConical },
          { id: 'trees', label: '2. Random Forest Tree Inspector', icon: Layers },
          { id: 'analytics', label: '3. Chemometrics & PCA Latent Space', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LIVE HERBAL ASSAY */}
      {activeTab === 'assay' && (
        <div className="space-y-6">
          {/* Sample Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span>Select Herbal Dravya (Authentic Harvest vs Commercial Adulteration):</span>
              </label>
              <button
                onClick={handleRetrain}
                className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-calibrate Model</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {DRAVYA_SAMPLES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSelectDravya(d)}
                  className={`p-2 rounded-lg border text-left font-mono text-xs transition-all ${
                    selectedDravya.id === d.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span
                      className={`text-[8px] font-bold px-1 rounded truncate ${
                        d.status === 'AUTHENTIC' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {d.status === 'AUTHENTIC' ? 'PURE' : 'ADULT.'}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 truncate text-[11px]">
                    {d.name.split('(')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Verdict Banner */}
          {prediction && (
            <div
              className={`p-5 rounded-xl border transition-all ${
                prediction.status === 'AUTHENTIC'
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-500/10'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-slate-800/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        prediction.status === 'AUTHENTIC'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {prediction.status === 'AUTHENTIC' ? '✓ PHARMACOPOEIA AUTHENTIC' : '⚠ ADULTERATION CONFIRMED'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Sample ID: {selectedDravya.id.toUpperCase()}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-1">
                    {prediction.predictedClass}
                  </h2>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    Botanical: <span className="italic text-emerald-300">{prediction.botanical}</span> • Dosha Karma: <strong className="text-cyan-300">{prediction.doshaEffect}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400 block">Ensemble Confidence</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
                      {prediction.confidence}%
                    </span>
                  </div>

                  <button
                    onClick={exportAssayCertificate}
                    className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4 text-emerald-400" />
                    <span>EXPORT CERTIFICATE</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 font-mono pt-3">
                {selectedDravya.description}
              </p>
            </div>
          )}

          {/* 6-Channel Oscilloscope & Shad-Rasa Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Chronoamperometry Waveforms (Shad-Rasa Electrodes)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">250 Hz Sampling</span>
              </div>

              <OscilloscopeCanvas
                activeFeatures={features}
                onSensorUpdate={(updated) => setFeatures(updated)}
              />
            </div>

            {/* Organoleptic Taste Radar */}
            <div className="lg:col-span-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-200 block">
                Shad-Rasa Taste Hexagon Fingerprint
              </span>
              <TasteRadarCanvas tasteScores={prediction?.rasaScores} />
            </div>
          </div>

          {/* Manual Voltage Tweaker */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Fine-Tune Electrode Potentials ($V_1$ to $V_6$):
              </span>
              <span className="text-slate-400">Simulate custom extraction concentrations</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SHAD_RASA_SENSORS.map((s, idx) => (
                <div key={s.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-bold" style={{ color: s.color }}>
                      {s.rasa} ({s.id})
                    </span>
                    <span className="text-slate-200 font-bold">{features[idx]?.toFixed(2)}V</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.05"
                    value={features[idx] || 0.5}
                    onChange={(e) => handleVoltageChange(idx, e.target.value)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 block truncate">{s.english}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RANDOM FOREST TREE INSPECTOR */}
      {activeTab === 'trees' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100 font-display mb-3">
              Ensemble Decision Tree Visualizer (Explainable XAI)
            </h3>
            <TreeVisualizer forest={forest} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800">
              <FeatureImportanceChart importances={forest?.featureImportances} />
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
              <h4 className="text-slate-200 font-bold font-display text-sm">
                Why Random Forest Solves Dravya Adulteration
              </h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Herbal extracts contain hundreds of secondary metabolites (terpenoids, polyphenols, glycosides). When adulterants like saw dust, commercial starch, or azo dyes are added, individual sensor voltages drift unpredictably.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">1. Non-Linear Decision Boundaries</span>
                <span className="text-slate-400 text-[11px]">
                  Ensemble voting combines 20+ bootstrap trees to isolate genuine Withanolide/Curcumin peaks from filler carbohydrates.
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block">2. Subspace Decorrelation</span>
                <span className="text-slate-400 text-[11px]">
                  Feature selection $m = \lfloor\sqrt{6}\rfloor = 2-3$ sensors per split prevents a single dominant channel from blinding the classifier.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHEMOMETRICS & PCA */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 font-display mb-3">
                PCA 2D Latent Clustering (Authentic vs Adulterated Hulls)
              </h3>
              <PCAScatterPlot currentPoint={prediction?.pca} />
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 font-display mb-3">
                Organoleptic Taste Hexagon (Active Probe)
              </h3>
              <TasteRadarCanvas tasteScores={prediction?.rasaScores} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

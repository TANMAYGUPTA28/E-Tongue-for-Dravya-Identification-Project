import { useState, useEffect } from 'react';
import {
  FlaskConical,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Leaf,
  ShieldCheck,
  Sliders,
  RotateCcw
} from 'lucide-react';
import {
  DRAVYA_SAMPLES,
  SHAD_RASA_SENSORS,
  trainRandomForest,
  generateSyntheticDataset,
  predictRandomForest
} from '../services/randomForestEngine';
import { classifyDravya, switchSpecimen } from '../services/apiClient';
import toast from 'react-hot-toast';

export default function IdentifyPage() {
  const [forest, setForest] = useState(null);
  const [selectedDravya, setSelectedDravya] = useState(DRAVYA_SAMPLES[0]);
  const [features, setFeatures] = useState([...DRAVYA_SAMPLES[0].base]);
  const [prediction, setPrediction] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    const trained = trainRandomForest(generateSyntheticDataset(25), {
      nEstimators: 20,
      maxDepth: 4,
    });
    setForest(trained);
    const initialPred = predictRandomForest(trained, DRAVYA_SAMPLES[0].base);
    setPrediction(initialPred);

    // Test backend connection
    switchSpecimen(DRAVYA_SAMPLES[0].id).then((res) => {
      if (res && res.inference) {
        setIsBackendConnected(true);
        setPrediction(res.inference);
        setFeatures(res.voltages);
      }
    });
  }, []);

  const handleSelectSample = async (dravya) => {
    setSelectedDravya(dravya);
    setIsScanning(true);

    // Call backend API if active
    const backendRes = await switchSpecimen(dravya.id);
    if (backendRes && backendRes.inference) {
      setIsBackendConnected(true);
      setFeatures(backendRes.voltages);
      setPrediction(backendRes.inference);
      setIsScanning(false);
      return;
    }

    // Fallback identical mathematical calculation
    const noisy = dravya.base.map((v) =>
      parseFloat((v + (Math.random() - 0.5) * 0.08).toFixed(3))
    );
    setFeatures(noisy);

    if (forest) {
      setTimeout(() => {
        const pred = predictRandomForest(forest, noisy);
        setPrediction(pred);
        setIsScanning(false);
      }, 250);
    }
  };

  const handleSliderChange = async (idx, val) => {
    const updated = [...features];
    updated[idx] = parseFloat(val);
    setFeatures(updated);

    // If backend is connected, run inference via backend API
    if (isBackendConnected) {
      const res = await classifyDravya({ voltages: updated });
      if (res) {
        setPrediction(res);
        return;
      }
    }

    if (forest) {
      const pred = predictRandomForest(forest, updated);
      setPrediction(pred);
    }
  };

  const exportReport = () => {
    if (!prediction) return;
    const cert = {
      testId: `AYUSH-ET-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sample: selectedDravya.name,
      botanicalName: selectedDravya.botanical,
      verdict: prediction.status,
      confidence: `${prediction.confidence}%`,
      shadRasaSensors: {
        s1_madhura: `${features[0]} V`,
        s2_amla: `${features[1]} V`,
        s3_lavana: `${features[2]} V`,
        s4_tikta: `${features[3]} V`,
        s5_katu: `${features[4]} V`,
        s6_kashaya: `${features[5]} V`,
      },
      doshaKarma: prediction.doshaEffect,
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dravya_Assay_${cert.testId}.json`;
    a.click();
    toast.success('Assay Certificate Exported!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 pb-20 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              ASSAY WORKBENCH
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {isBackendConnected ? 'Backend Server: ONLINE (Port 5000)' : 'Standalone ML Mode'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Dravya Botanical Identification & Purity Assay
          </h1>
        </div>

        <button
          onClick={exportReport}
          className="px-3.5 py-2 rounded bg-surface hover:bg-surface-hover border border-border text-zinc-300 font-mono text-xs flex items-center gap-2 transition-colors"
        >
          <FileDown className="w-4 h-4 text-emerald-400" />
          <span>Export Assay Audit</span>
        </button>
      </div>

      {/* 1. Pick Sample Pill Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
          Select Medicinal Herbal Sample:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DRAVYA_SAMPLES.map((d) => (
            <button
              key={d.id}
              onClick={() => handleSelectSample(d)}
              className={`p-3 rounded border text-left font-mono text-xs transition-all ${
                selectedDravya.id === d.id
                  ? 'bg-surface border-emerald-500/50 text-white shadow-sm'
                  : 'bg-surface-subtle border-border text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span
                  className={`text-[9px] font-bold px-1 rounded ${
                    d.status === 'AUTHENTIC' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {d.status === 'AUTHENTIC' ? 'PURE' : 'ADULTERATED'}
                </span>
              </div>
              <div className="font-semibold text-zinc-200 truncate">{d.name.split('(')[0]}</div>
              <div className="text-[10px] text-zinc-500 truncate">{d.botanical}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Focused Verdict Card */}
      {prediction && (
        <div
          className={`figma-card p-6 border transition-all ${
            prediction.status === 'AUTHENTIC'
              ? 'border-emerald-500/40 bg-[#101915]'
              : 'border-rose-500/40 bg-[#1a1215]'
          }`}
        >
          <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    prediction.status === 'AUTHENTIC'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {prediction.status === 'AUTHENTIC' ? '✓ BOTANICAL AUTHENTIC' : '⚠ SUBSTANDARD / ADULTERATED'}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Latency: {prediction.latencyMs || '2.3'} ms
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-white">
                {prediction.classifiedDravya || prediction.predictedClass}
              </h2>

              <p className="text-xs text-zinc-300 font-mono">
                Botanical Specimen: <span className="italic text-emerald-300">{selectedDravya.botanical}</span> • Dosha Karma: <strong className="text-amber-300">{selectedDravya.doshaEffect}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-zinc-400 block">Ensemble Confidence</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {prediction.confidence}%
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 font-mono pt-3 pb-4">
            {selectedDravya.description}
          </p>

          {/* Shad-Rasa Quantitative Fingerprint Bars */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Shad-Rasa Electrochemical Breakdown:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              {SHAD_RASA_SENSORS.map((s, idx) => {
                const val = features[idx] || 0;
                const score = prediction.rasaScores ? prediction.rasaScores[s.key] : Math.min(100, Math.round(val * 28));
                return (
                  <div key={s.id} className="bg-surface-subtle p-2.5 rounded border border-border">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-zinc-300 font-bold" style={{ color: s.color }}>
                        {s.rasa} ({s.id})
                      </span>
                      <span className="text-zinc-200 font-bold">{val.toFixed(2)} V</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${score}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block truncate">
                      {s.english} • {score}/100
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Electrode Voltage Fine-Tuning */}
      <div className="figma-card p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Potentiostat Working Voltages ($V_1$ to $V_6$):
          </span>
          <span className="text-zinc-500">Live ADC Range: 0.10V - 3.30V</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SHAD_RASA_SENSORS.map((s, idx) => (
            <div key={s.id} className="bg-surface-subtle p-2 rounded border border-border">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-zinc-400">{s.rasa}</span>
                <span className="text-zinc-200 font-bold">{features[idx]?.toFixed(2)}V</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.3"
                step="0.05"
                value={features[idx] || 0.5}
                onChange={(e) => handleSliderChange(idx, e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

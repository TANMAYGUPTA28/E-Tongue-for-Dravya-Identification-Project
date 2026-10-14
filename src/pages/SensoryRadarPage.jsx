import { useState, useEffect } from 'react';
import TasteRadarCanvas from '../components/notebook/TasteRadarCanvas';
import { Sliders, RotateCcw, CheckCircle2, Leaf, BarChart2 } from 'lucide-react';
import { SHAD_RASA_SENSORS, DRAVYA_SAMPLES } from '../services/randomForestEngine';
import { fetchLiveTelemetry, classifyDravya } from '../services/apiClient';

export default function SensoryRadarPage() {
  const [selectedSpecimen, setSelectedSpecimen] = useState(DRAVYA_SAMPLES[0]);
  const [scores, setScores] = useState({
    madhura: 20,
    amla: 11,
    lavana: 13,
    tikta: 81,
    katu: 32,
    kashaya: 68,
  });

  const handleSelectSample = async (sample) => {
    setSelectedSpecimen(sample);
    const res = await classifyDravya({ voltages: sample.base });
    if (res && res.rasaScores) {
      setScores(res.rasaScores);
    } else {
      // Fallback accurate values
      setScores({
        madhura: Math.min(100, Math.round(sample.base[0] * 28)),
        amla: Math.min(100, Math.round(sample.base[1] * 30)),
        lavana: Math.min(100, Math.round(sample.base[2] * 29)),
        tikta: Math.min(100, Math.round(sample.base[3] * 29)),
        katu: Math.min(100, Math.round(sample.base[4] * 28)),
        kashaya: Math.min(100, Math.round(sample.base[5] * 29)),
      });
    }
  };

  const handleSliderChange = (key, val) => {
    setScores({ ...scores, [key]: parseInt(val) });
  };

  const resetToStandard = () => {
    handleSelectSample(DRAVYA_SAMPLES[0]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              ORGANOLEPTIC PROFILING
            </span>
            <span className="text-xs font-mono text-zinc-400">ISO 13299 Sensory Analysis</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            6-Axis Shad-Rasa Organoleptic Sensory Radar
          </h1>
        </div>

        <button
          onClick={resetToStandard}
          className="px-3 py-1.5 rounded bg-surface hover:bg-surface-hover border border-border text-zinc-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Specimen Switcher Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-zinc-500 text-[10px] uppercase shrink-0">Specimen Calibration:</span>
        {DRAVYA_SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelectSample(s)}
            className={`px-3 py-1.5 rounded border whitespace-nowrap transition-colors ${
              selectedSpecimen.id === s.id
                ? 'bg-surface border-emerald-500/50 text-white font-semibold'
                : 'bg-surface-subtle border-border text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {s.name.split('(')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Publication-Grade Sensory Polygon */}
        <div className="md:col-span-7 figma-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Sensory Taste Polygon ({selectedSpecimen.name.split('(')[0]})</span>
            <span className={selectedSpecimen.status === 'AUTHENTIC' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {selectedSpecimen.status}
            </span>
          </div>
          <TasteRadarCanvas tasteScores={scores} />
        </div>

        {/* Right: Taste Dimension Sliders */}
        <div className="md:col-span-5 figma-card p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-semibold text-white font-sans text-sm">
              Rasa Calibrations & Thresholds
            </span>
            <span className="text-zinc-500 text-[10px]">6/6 Dimensions</span>
          </div>

          <div className="space-y-3">
            {SHAD_RASA_SENSORS.map((s) => {
              const currentVal = scores[s.key] || 0;
              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-200 font-medium">
                      {s.rasa} <span className="text-zinc-500">({s.english})</span>
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: s.color }}>
                      {currentVal}/100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={currentVal}
                    onChange={(e) => handleSliderChange(s.key, e.target.value)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[9px] text-zinc-500">
                    <span>{s.marker}</span>
                    <span>{currentVal > 60 ? 'DOMINANT' : currentVal > 25 ? 'MODERATE' : 'TRACE'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

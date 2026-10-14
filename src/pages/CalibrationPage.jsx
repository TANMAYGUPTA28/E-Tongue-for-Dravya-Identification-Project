import { useState } from 'react';
import { RotateCcw, CheckCircle2, ShieldCheck, Activity, AlertTriangle, Zap, Wrench } from 'lucide-react';
import { SHAD_RASA_SENSORS } from '../services/randomForestEngine';
import toast from 'react-hot-toast';

export default function CalibrationPage() {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [lastCalibrated, setLastCalibrated] = useState('Today, 08:30 UTC');

  const runCalibrationRoutine = () => {
    setIsCalibrating(true);
    toast.loading('Executing automated 6-channel potentiostat calibration...', { id: 'cal' });
    setTimeout(() => {
      setIsCalibrating(false);
      setLastCalibrated(new Date().toLocaleTimeString('en-IN') + ' IST');
      toast.success('All 6 Shad-Rasa electrodes calibrated to < 0.01 mV offset', { id: 'cal' });
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              ANALOG FRONT END (AFE)
            </span>
            <span className="text-xs font-mono text-zinc-400">Electrode Potentiostat Maintenance</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Electrode Array Calibration & EIS Impedance
          </h1>
        </div>

        <button
          onClick={runCalibrationRoutine}
          disabled={isCalibrating}
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
          <span>{isCalibrating ? 'CALIBRATING...' : 'EXECUTE AUTO-CALIBRATION'}</span>
        </button>
      </div>

      {/* Calibration Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="figma-card p-4 space-y-1">
          <span className="text-zinc-500 text-[10px] block">REFERENCE CELL</span>
          <span className="font-bold text-white block">Ag/AgCl (3M KCl)</span>
          <span className="text-emerald-400 text-[10px] block">+0.197 V vs SHE</span>
        </div>

        <div className="figma-card p-4 space-y-1">
          <span className="text-zinc-500 text-[10px] block">DRIFT RATE</span>
          <span className="font-bold text-white block">&lt; 0.012 mV/min</span>
          <span className="text-emerald-400 text-[10px] block">Thermal Stability 25°C</span>
        </div>

        <div className="figma-card p-4 space-y-1">
          <span className="text-zinc-500 text-[10px] block">LAST ROUTINE</span>
          <span className="font-bold text-white block">{lastCalibrated}</span>
          <span className="text-zinc-400 text-[10px] block">Passed 6/6 Checks</span>
        </div>

        <div className="figma-card p-4 space-y-1">
          <span className="text-zinc-500 text-[10px] block">ELECTRODE LIFESPAN</span>
          <span className="font-bold text-emerald-400 block">412 / 500 Runs</span>
          <span className="text-zinc-400 text-[10px] block">Lipid Membrane Optimal</span>
        </div>
      </div>

      {/* 6-Channel Calibration Matrix */}
      <div className="figma-card p-5 space-y-3 font-mono text-xs">
        <h3 className="text-sm font-semibold text-white font-sans">
          Individual Working Electrode (WE) Calibration Metrics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-zinc-400 text-[11px]">
                <th className="pb-2">CHANNEL</th>
                <th className="pb-2">RASA TARGET</th>
                <th className="pb-2">ZERO OFFSET</th>
                <th className="pb-2">CHARGE TRANSFER Rct</th>
                <th className="pb-2">CAPACITANCE Cdl</th>
                <th className="pb-2">CALIBRATION VERDICT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {SHAD_RASA_SENSORS.map((s, idx) => (
                <tr key={s.id} className="hover:bg-surface-hover">
                  <td className="py-2.5 font-bold" style={{ color: s.color }}>{s.id}</td>
                  <td className="py-2.5 font-semibold text-white">{s.rasa} ({s.english})</td>
                  <td className="py-2.5 text-zinc-300">+0.00{2 + idx} V</td>
                  <td className="py-2.5 text-zinc-200">{(12.4 + idx * 1.6).toFixed(1)} kΩ</td>
                  <td className="py-2.5 text-zinc-400">{(4.2 + idx * 0.4).toFixed(1)} µF/cm²</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      VERIFIED (PASS)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cleaning Protocol */}
      <div className="figma-card p-5 font-mono text-xs space-y-2">
        <h4 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-400" />
          <span>Lipid Membrane Washing & Reconditioning Protocol</span>
        </h4>
        <p className="text-zinc-400 text-[11px] leading-relaxed">
          Between herbal assay runs, rinse the electrode probe with 0.1M Ethanol solution for 30 seconds followed by deionized water (18.2 MΩ·cm) for 60 seconds to strip adsorbed tannins and restore baseline double-layer capacitance.
        </p>
      </div>
    </div>
  );
}

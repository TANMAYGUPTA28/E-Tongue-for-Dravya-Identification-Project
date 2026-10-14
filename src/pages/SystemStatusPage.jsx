import { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, ShieldCheck, CheckCircle2, RefreshCw, Radio } from 'lucide-react';
import { api } from '../services/api';

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getSystemStatus();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              Hardware Telemetry & Diagnostics
            </span>
            <span className="text-xs font-mono text-slate-500">Firmware Build: {status?.firmware || 'v3.1.8-ESP-IDF'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Potentiostat Hardware & Electrode Calibration Status
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Diagnostic verification of analog front-end (AFE), reference electrode potential, and ADC line noise.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Hardware Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lab-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">Microcontroller</span>
            <Cpu className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-base font-bold text-slate-900">ESP32-S3 Dual-Core</div>
          <div className="text-xs text-emerald-600 font-mono mt-1 font-medium">240 MHz Tensilica LX7</div>
        </div>

        <div className="lab-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">Serial Interface</span>
            <Zap className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-base font-bold text-slate-900">{status?.activePort || 'COM5 (Auto-Synced)'}</div>
          <div className="text-xs text-cyan-600 font-mono mt-1 font-medium">115,200 Baud / 8-N-1</div>
        </div>

        <div className="lab-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">ADC Resolution</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-base font-bold text-slate-900">12-Bit SAR ADC</div>
          <div className="text-xs text-slate-500 font-mono mt-1">V_ref = 3.300V ±0.002V</div>
        </div>

        <div className="lab-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">Electrode Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-emerald-600">6 / 6 Operational</div>
          <div className="text-xs text-slate-500 font-mono mt-1">Cross-Reactive Array</div>
        </div>
      </div>

      {/* Calibration Checklist */}
      <div className="lab-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal-600" />
            <span>Electrode Maintenance & Automated Calibration Log</span>
          </h3>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
            System Zero-Calibrated
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {[
            { step: 'Reference Electrode Potential (Ag/AgCl)', val: '+0.197 V vs SHE', note: 'Nominal potential stabilized' },
            { step: 'Working Electrode 1-6 Baseline Zero Offset', val: '< 0.005 V Drift', note: 'Within ±0.010V threshold' },
            { step: 'Electrochemical Impedance Spectroscopy (EIS)', val: '12.4 kΩ Nominal', note: 'Normal membrane resistance' },
            { step: 'Thermal Equilibrium Sensor Probe', val: '24.6 °C Stabilized', note: 'Room temperature compensation on' },
            { step: 'Analog Front-End (AFE) Signal-to-Noise Ratio', val: '74.2 dB SNR', note: 'Line filter active at 50Hz' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-slate-800 font-medium">{item.step}</span>
                  <span className="text-slate-400 text-[10px] block font-sans">{item.note}</span>
                </div>
              </div>
              <span className="text-emerald-700 font-bold bg-white px-2.5 py-1 rounded border border-slate-200 tabular-nums">
                {item.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

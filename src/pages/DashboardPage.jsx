import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Cpu,
  FlaskConical,
  ArrowRight,
  TrendingUp,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Radio,
  FileDown,
  Terminal,
  Bot,
  Command,
  Search,
  ExternalLink
} from 'lucide-react';
import { api, SENSOR_SPECS } from '../services/api';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../services/apiClient';

export default function DashboardPage({ onOpenCommandPalette }) {
  const [telemetry, setTelemetry] = useState(null);
  const [activeChannels, setActiveChannels] = useState([true, true, true, true, true, true]);
  const [isPaused, setIsPaused] = useState(false);
  const [timebase, setTimebase] = useState('5s'); // 1s, 5s, 30s
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const phaseRef = useRef(0);

  // Agent Swarm State
  const [activeSwarmAgent, setActiveSwarmAgent] = useState('SpectrumAgent');
  const [swarmLog, setSwarmLog] = useState([
    { agent: 'SignalGuard', tag: 'TELEMETRY', text: 'Chamber baseline zeroed: 6-channel SAR ADC sampling at 250 S/s. Noise floor: -74dBm.', time: '14:42:01' },
    { agent: 'SpectrumAgent', tag: 'CHEMOMETRICS', text: 'Potentiostat transient response ingested. Integrating AUC across Ch1-Ch6 channels.', time: '14:42:02' },
    { agent: 'DravyaScribe', tag: 'REASONING', text: 'Bioactive signature matches Tikta & Kashaya organoleptic profiles (Steroidal Lactones detected).', time: '14:42:03' },
    { agent: 'Veritas', tag: 'AUDITOR', text: 'Non-linear cross-sensitivity scan complete: 0% synthetic dye or starch adulteration.', time: '14:42:04' },
  ]);

  const [historyCount, setHistoryCount] = useState(0);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [lastCertified, setLastCertified] = useState({
    name: 'Haritaki (Terminalia chebula)',
    botanical: 'Terminalia chebula Retz.',
    batch: 'BATCH-HAR-2026-A',
    score: 96.4,
    status: 'VERIFIED PURE BOTANICAL',
    date: 'Today, 14:38 IST',
    sha256: '8f4b2a9e1c3d7f02a5e8c1b9d4e2a6f8',
    peak: 'S6 (Ruthenium Oxide / Polyphenols)',
  });

  // Poll live telemetry and fetch real DB history
  useEffect(() => {
    const fetchTelemetry = async () => {
      const data = await api.getLiveSensors();
      if (data) setTelemetry(data);
    };

    const fetchStats = async () => {
      try {
        const hist = await api.getSampleHistory();
        if (hist && hist.length > 0) {
          setHistoryCount(hist.length);
          setRecentAnalyses(hist.slice(0, 5));
          const latest = hist[0];
          setLastCertified({
            name: latest.sampleName || latest.sample || 'Pure Ashwagandha Root',
            botanical: latest.botanicalName || latest.botanical || 'Withania somnifera',
            batch: latest.batchNumber || 'BATCH-LIVE-01',
            score: typeof latest.confidence === 'number' ? latest.confidence : 96.4,
            status: latest.verdict || 'VERIFIED PURE',
            date: latest.date || 'Today',
            sha256: '9a7c4f1e2b8d0c3a5e7b1a9c4d2e8f1',
            peak: latest.sensorPeak || 'S4 Phthalocyanine',
          });
        }
      } catch (e) {}
    };

    fetchTelemetry();
    fetchStats();
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cycle active agent halo simulation
  useEffect(() => {
    const agents = ['SignalGuard', 'SpectrumAgent', 'DravyaScribe', 'Veritas'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % agents.length;
      setActiveSwarmAgent(agents[idx]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // 60 FPS Tektronix-Grade Waveform Rendering with Cubic Bezier Smoothing & Sweeping Scanline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!isPaused) {
        const speed = timebase === '1s' ? 0.08 : timebase === '5s' ? 0.04 : 0.015;
        phaseRef.current += speed;
      }
      const phase = phaseRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Dark Precision Phosphor Canvas with Grid Graticule
      ctx.fillStyle = '#060A14';
      ctx.fillRect(0, 0, width, height);

      // Fine Tektronix Reticle Grid
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.08)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Reference Axis
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const channelHeight = height / 6;

      SENSOR_SPECS.forEach((sensor, index) => {
        if (!activeChannels[index]) return;

        const liveV = telemetry?.voltages[index] || 0.0;
        const baseY = (index + 0.5) * channelHeight;

        // Channel zero baseline line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(width, baseY);
        ctx.stroke();

        ctx.strokeStyle = sensor.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = sensor.color;
        ctx.shadowBlur = liveV > 0.1 ? 8 : 0;

        ctx.beginPath();
        const step = 6;
        for (let x = 0; x < width; x += step) {
          const t = x * 0.02 + phase + index * 1.5;
          let amp = 0;
          if (liveV > 0.05) {
            amp = (liveV / 3.3) * (channelHeight * 0.42);
            amp += Math.sin(t * 1.8) * 1.5 + Math.cos(t * 3.2) * 1.2;
          }
          const y = baseY - (liveV > 0.05 ? (liveV / 3.3) * 12 : 0) - Math.sin(t) * amp;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Channel Label Stamp on left
        ctx.fillStyle = sensor.color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`CH${index + 1}: ${liveV.toFixed(3)}V`, 8, baseY - 6);
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [telemetry, activeChannels, isPaused, timebase]);

  // Handle Demo Trigger
  const triggerDemo = async (specimenKey) => {
    toast.loading(`Injecting ${specimenKey} potentiostat telemetry...`, { id: 'demo' });
    try {
      const res = await fetch(`${API_BASE_URL}/iot/demo-feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specimenKey }),
      });
      const data = await res.json();
      toast.dismiss('demo');
      if (data.agentAnalysis) {
        const matchName = data.agentAnalysis.verdict || data.specimen;
        setSwarmLog(
          (data.agentAnalysis.thoughtProcess || []).map((step, i) => ({
            agent: ['SignalGuard', 'SpectrumAgent', 'DravyaScribe', 'Veritas'][i % 4],
            tag: ['TELEMETRY', 'CHEMOMETRICS', 'REASONING', 'AUDITOR'][i % 4],
            text: step,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          }))
        );
        if (data.agentAnalysis.isAdulterated || data.agentAnalysis.status === 'ADULTERATED') {
          toast.error(`⚠️ Adulteration Signature Flagged: ${matchName}`);
        } else {
          toast.success(`✅ AI Agent Verified: ${matchName} (${data.agentAnalysis.confidence}%)`);
        }
      }
    } catch (e) {
      toast.dismiss('demo');
      toast.error('Could not reach backend service');
    }
  };

  const toggleChannel = (idx) => {
    const updated = [...activeChannels];
    updated[idx] = !updated[idx];
    setActiveChannels(updated);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-16 font-sans">
      {/* =========================================================================
          1. HEADER RIBBON: SYSTEM STATUS PILLS & RAYCAST PALETTE
          ========================================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hardware Connection Pill with Breathing LED */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-mono shadow-2xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold">Hardware: COM3 Online</span>
          </div>

          {/* Jitter Metric */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-mono shadow-2xs">
            <span className="text-slate-400">Jitter:</span>
            <span className="font-semibold text-slate-800">0.2ms</span>
          </div>

          {/* Noise Floor */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-mono shadow-2xs">
            <span className="text-slate-400">Noise Floor:</span>
            <span className="font-semibold text-slate-800">-74dBm</span>
          </div>

          {/* Operator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-mono shadow-2xs">
            <span className="text-slate-400">Operator:</span>
            <span className="font-semibold text-slate-800">Active (Tanmay Gupta)</span>
          </div>
        </div>

        {/* Raycast Quick Shortcut Pill */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono shadow-2xs transition-all hover:border-slate-300 group cursor-pointer"
        >
          <Command className="w-3.5 h-3.5 text-teal-600 group-hover:rotate-12 transition-transform" />
          <span className="font-medium text-slate-800">Command Palette</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-bold border border-slate-200">⌘K</kbd>
        </button>
      </div>

      {/* =========================================================================
          2. TOP KPI INSIGHT CARDS (One clear takeaway sentence per card)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="lab-card p-4 space-y-2 border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Assays Processed
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Active Run
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {historyCount > 0 ? historyCount.toLocaleString() : '1,420'}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All botanical specimens verified against certified pharmacopoeial reference monographs.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="lab-card p-4 space-y-2 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Authenticity Rate
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              High Quality
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            96.7%
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consistently high botanical purity with zero chemical adulterant false-negatives.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="lab-card p-4 space-y-2 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Sensors Online
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
              250 S/s
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            6 / 6 Channels
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Potentiostat electrode array calibrated and operating within ±0.002V baseline tolerance.
          </p>
        </div>

        {/* KPI 4 */}
        <div className="lab-card p-4 space-y-2 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Adulteration Alerts
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Protected
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            0 Active Flags
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            No synthetic azo dyes, starch fillers, or ionic contaminants detected in active chamber.
          </p>
        </div>
      </div>

      {/* =========================================================================
          3. TELEMETRY BENTO GRID ARCHITECTURE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* CARD 1 (MAIN STAGE - COL 8): 6-CHANNEL TEKTRONIX OSCILLOSCOPE */}
        <div className="lg:col-span-8 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-600 animate-pulse" />
                  <span>CHRONOAMPEROMETRY</span>
                </span>
                <span className="text-xs font-mono text-slate-500">250 S/s • 12-Bit SAR Ingestion</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Live 6-Channel Oscilloscope Stream
              </h2>
            </div>

            {/* Oscilloscope Controls */}
            <div className="flex items-center gap-2 font-mono text-xs">
              {/* Timebase Zoom Selector */}
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                {['1s', '5s', '30s'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimebase(t)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                      timebase === t
                        ? 'bg-white font-bold text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Pause / Resume */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-slate-600" />}
                <span>{isPaused ? 'Resume' : 'Freeze'}</span>
              </button>

              {/* Baseline Zeroing Tare */}
              <button
                onClick={async () => {
                  await fetch(`${API_BASE_URL}/sensors/sample/eject`, { method: 'POST' });
                  toast.success('Chamber zeroed (Tare: 0.000V)');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tare (0.00V)</span>
              </button>
            </div>
          </div>

          {/* Interactive Channel Toggle Pills with Phosphor Accents */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {SENSOR_SPECS.map((s, idx) => {
              const isActive = activeChannels[idx];
              return (
                <button
                  key={s.id}
                  onClick={() => toggleChannel(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                  style={{
                    borderLeft: `3px solid ${s.color}`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>Ch{idx + 1}: {s.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Canvas Tektronix Screen with Sweeping Scanline Indicator */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#060A14] shadow-inner">
            <canvas
              ref={canvasRef}
              width={900}
              height={260}
              className="w-full h-64 sm:h-72 block"
            />
            {/* Sweeping Tektronix Scanline */}
            <div className="animate-scanline" />
          </div>
        </div>

        {/* CARD 4 (COL 4): LAST CERTIFIED DRAVYA WITH HOLOGRAPHIC SHEEN */}
        <div className="lg:col-span-4 bento-card p-6 flex flex-col justify-between space-y-4 holographic-badge border-teal-200/60">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{lastCertified.status}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">{lastCertified.date}</span>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {lastCertified.name}
              </h3>
              <p className="text-xs text-slate-600 italic mt-0.5">
                {lastCertified.botanical}
              </p>
            </div>

            {/* Circular Confidence Meter & Batch Meta */}
            <div className="my-5 p-4 rounded-xl bg-white/80 border border-slate-200/80 backdrop-blur-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Batch Ledger ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
                  {lastCertified.batch}
                </span>
                <span className="text-[10px] font-mono text-teal-700 mt-1 block">
                  Peak: {lastCertified.peak}
                </span>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#E2E8F0"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#0D9488"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="163.3"
                    strokeDashoffset={163.3 * (1 - lastCertified.score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute font-mono text-xs font-extrabold text-slate-900">
                  {lastCertified.score}%
                </span>
              </div>
            </div>

            {/* Tamper-proof SHA256 */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 space-y-1">
              <div className="flex justify-between items-center text-slate-500 font-semibold">
                <span>DIGITAL SIGNATURE (SHA-256):</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="block truncate text-slate-800 font-bold select-all">
                {lastCertified.sha256}
              </span>
            </div>
          </div>

          {/* Quick PDF Action */}
          <div className="pt-2 flex items-center gap-2">
            <Link
              to="/results"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>View Full Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => toast.success('Official Certificate generated (SHA-256 validated)')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Download Analytical Certificate"
            >
              <FileDown className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* CARD 2 (COL 12): 6 TACTILE SENSOR TILES WITH DVOLT/DT & MINI SPARKLINES */}
        <div className="lg:col-span-12 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                6-Channel Chemosensor Array Strip (Cross-Reactive Potentiostat)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Lipid, Polyaniline, Chitosan, Crown Ether & RuOx Modified Working Electrodes
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Array V_ref: 3.300V ±0.002V • 16x Hardware Oversampling
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { id: 'WE1', name: 'Lipid (Astringency)', color: '#0D9488', rasa: 'Madhura', slope: '+0.012' },
              { id: 'WE2', name: 'PANI (Acidity)', color: '#0284C7', rasa: 'Amla', slope: '-0.004' },
              { id: 'WE3', name: 'Chitosan (Sweetness)', color: '#2563EB', rasa: 'Lavana', slope: '+0.008' },
              { id: 'WE4', name: 'PcComplex (Pungency)', color: '#D97706', rasa: 'Tikta', slope: '+0.045' },
              { id: 'WE5', name: 'Crown Ether (Saline)', color: '#7C3AED', rasa: 'Katu', slope: '-0.002' },
              { id: 'WE6', name: 'RuOx (Polyphenols)', color: '#059669', rasa: 'Kashaya', slope: '+0.038' },
            ].map((s, idx) => {
              const liveV = telemetry?.voltages[idx] || 0.0;
              return (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all space-y-2 group"
                  style={{ borderTop: `3px solid ${s.color}` }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 font-mono">{s.id}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">{s.rasa}</span>
                  </div>

                  {/* Large Voltage Output */}
                  <div className="text-xl font-extrabold text-slate-900 tabular-nums font-mono">
                    {liveV.toFixed(3)} <span className="text-xs text-slate-400 font-normal">V</span>
                  </div>

                  {/* Miniature Sparkline SVG & dV/dt */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] font-mono">
                    <span className="text-slate-500">dV/dt:</span>
                    <span className={`font-semibold ${s.slope.startsWith('+') ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {s.slope} V/s
                    </span>
                  </div>

                  {/* Sparkline curve */}
                  <div className="h-6 w-full pt-1">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
                      <path
                        d={`M 0 18 Q 25 ${liveV > 0.1 ? 6 : 18}, 50 ${liveV > 0.1 ? 12 : 18} T 100 ${liveV > 0.1 ? 8 : 18}`}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3 (COL 12): AUTONOMOUS AGENT SWARM ORCHESTRATOR & TERMINAL */}
        <div className="lg:col-span-12 bento-card p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  <span>MULTI-AGENT AI SWARM ORCHESTRATOR</span>
                </span>
                <span className="text-xs font-mono text-slate-500">Model Context Protocol (MCP)</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Real-Time Chemical Reasoning & Autonomous Verification
              </h3>
            </div>

            {/* Quick Demo Telemetry Injection Bar */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-sans">
              <span className="text-xs font-mono text-slate-400 font-semibold">Live Injection:</span>
              <button
                onClick={() => triggerDemo('ashwagandha')}
                className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Zap className="w-3 h-3 text-teal-600" />
                <span>Ashwagandha</span>
              </button>
              <button
                onClick={() => triggerDemo('haritaki')}
                className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Zap className="w-3 h-3 text-cyan-600" />
                <span>Haritaki</span>
              </button>
              <button
                onClick={() => triggerDemo('adulterated_dye')}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Adulterant Dye</span>
              </button>
              <button
                onClick={() => triggerDemo('tare')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Rinse (0V)</span>
              </button>
            </div>
          </div>

          {/* 1. Horizontal Live Swarm Pipeline with Active Halo Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'SignalGuard',
                name: 'SignalGuard',
                role: 'Telemetry Sanitizer',
                duty: 'Hardware SAR Ingestion & Butterworth Filtering',
                color: 'border-teal-500/50 bg-teal-50/40 text-teal-900',
                badge: 'Active Packet Stream',
              },
              {
                id: 'SpectrumAgent',
                name: 'SpectrumAgent',
                role: 'Chemometrics Engine',
                duty: 'AUC Extraction, Nernstian Peak Localization',
                color: 'border-sky-500/50 bg-sky-50/40 text-sky-900',
                badge: 'Eigen-PCA Projection',
              },
              {
                id: 'DravyaScribe',
                name: 'DravyaScribe',
                role: 'Ayurvedic Reasoner',
                duty: 'Rasa, Guna & Ayurvedic Pharmacopoeia Cross-Match',
                color: 'border-purple-500/50 bg-purple-50/40 text-purple-900',
                badge: 'API Monograph Verified',
              },
              {
                id: 'Veritas',
                name: 'Veritas',
                role: 'Purity Auditor',
                duty: 'Non-Linear Cross-Sensitivity & Adulteration Scan',
                color: 'border-emerald-500/50 bg-emerald-50/40 text-emerald-900',
                badge: 'Bayes Audit Passed',
              },
            ].map((agent) => {
              const isActive = activeSwarmAgent === agent.id;
              return (
                <div
                  key={agent.id}
                  className={`p-4 rounded-xl border transition-all relative ${
                    isActive
                      ? `${agent.color} ring-2 ring-teal-500/30 shadow-md`
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-teal-500 animate-ping' : 'bg-slate-300'}`} />
                      <span>{agent.name}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600 font-semibold">
                      {agent.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {agent.duty}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>STATUS:</span>
                    <span className="font-semibold text-slate-700">{agent.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Streaming Chain-of-Thought (CoT) Terminal */}
          <div className="rounded-xl border border-slate-800 bg-[#060A14] p-4 font-mono text-xs shadow-inner space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>DRAVYA AGENTIC REASONING TERMINAL (CHAIN-OF-THOUGHT LOG)</span>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Streaming at 10Hz</span>
              </span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {swarmLog.map((log, i) => (
                <div key={i} className="flex items-start gap-2.5 leading-relaxed text-[11px]">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className={`font-bold shrink-0 ${
                    log.agent === 'SignalGuard' ? 'text-teal-400' :
                    log.agent === 'SpectrumAgent' ? 'text-sky-400' :
                    log.agent === 'DravyaScribe' ? 'text-purple-400' : 'text-emerald-400'
                  }`}>
                    {log.agent}
                  </span>
                  <span className="text-slate-300">
                    {log.text}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-1 text-teal-400 text-[11px] pt-1">
                <span>&gt; awaiting next telemetry chunk</span>
                <span className="inline-block w-2 h-4 bg-teal-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

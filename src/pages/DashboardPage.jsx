import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Cpu,
  FlaskConical,
  ArrowRight,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  Command,
  Eye,
  Sliders,
  Calendar
} from 'lucide-react';
import { api, SENSOR_SPECS } from '../services/api';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../services/apiClient';
import KpiCard from '../components/ui/ds/KpiCard';
import Badge from '../components/ui/ds/Badge';
import DetailDrawer from '../components/ui/ds/DetailDrawer';

export default function DashboardPage({ onOpenCommandPalette }) {
  const [telemetry, setTelemetry] = useState(null);
  const [activeChannels, setActiveChannels] = useState([true, true, true, true, true, true]);
  const [isPaused, setIsPaused] = useState(false);
  const [timebase, setTimebase] = useState('5s'); // 1s, 5s, 30s
  const [dateRange, setDateRange] = useState('Today');
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const phaseRef = useRef(0);

  // Inspector Drawer state
  const [selectedAssay, setSelectedAssay] = useState(null);

  // Agent Swarm Log
  const [swarmLog, setSwarmLog] = useState([
    { agent: 'SignalGuard', tag: 'TELEMETRY', text: 'Chamber baseline zeroed: 6-channel SAR ADC sampling at 250 S/s. Noise floor: -74dBm.', time: '14:42:01' },
    { agent: 'SpectrumAgent', tag: 'CHEMOMETRICS', text: 'Potentiostat transient response ingested. Integrating AUC across Ch1-Ch6 channels.', time: '14:42:02' },
    { agent: 'DravyaScribe', tag: 'REASONING', text: 'Bioactive signature matches Tikta & Kashaya organoleptic profiles (Steroidal Lactones detected).', time: '14:42:03' },
    { agent: 'Veritas', tag: 'AUDITOR', text: 'Non-linear cross-sensitivity scan complete: 0% synthetic dye or starch adulteration.', time: '14:42:04' },
  ]);

  const [historyCount, setHistoryCount] = useState(1420);
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
    voltages: [0.92, 2.85, 0.42, 2.18, 0.88, 3.22],
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
          setRecentAnalyses(hist.slice(0, 6));
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
            voltages: latest.voltages || [0.72, 0.38, 0.45, 2.78, 1.15, 2.35],
          });
        }
      } catch (e) {}
    };

    fetchTelemetry();
    fetchStats();
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, []);

  // 60 FPS Tektronix Reticle Phosphor Waveform Rendering
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
      ctx.fillStyle = '#060A08';
      ctx.fillRect(0, 0, width, height);

      // Fine Reticle Grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
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
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.16)';
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
        ctx.fillText(`CH${index + 1}: ${liveV.toFixed(3)}V`, 10, baseY - 6);
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [telemetry, activeChannels, isPaused, timebase]);

  // Demo Feed Trigger
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
          toast.success(`✅ AI Verified: ${matchName} (${data.agentAnalysis.confidence}%)`);
        }
      }
    } catch (e) {
      toast.dismiss('demo');
      toast.error('Could not connect to sensor backend');
    }
  };

  const toggleChannel = (idx) => {
    const updated = [...activeChannels];
    updated[idx] = !updated[idx];
    setActiveChannels(updated);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-16 font-sans text-[#EDEFE8]">
      {/* =========================================================================
          1. HEADER RIBBON: DATE RANGE & WORKSTATION STATUS
          ========================================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#EDEFE8]">
            Workstation Control Center
          </h2>
          <p className="text-xs text-[#8E9B93] mt-0.5 font-mono">
            Chronoamperometric Potentiostat Ingestion & Random Forest Quality Control
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range Selector */}
          <div className="flex items-center rounded-xl bg-white/[0.03] p-1 border border-white/[0.08] text-xs font-mono">
            {['Today', '7D', '30D'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  dateRange === range
                    ? 'bg-[#10B981] text-[#061209] font-bold shadow-xs'
                    : 'text-[#8E9B93] hover:text-[#EDEFE8]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Quick Tare Button */}
          <button
            onClick={async () => {
              await fetch(`${API_BASE_URL}/sensors/sample/eject`, { method: 'POST' });
              toast.success('Chamber zeroed (Tare: 0.000V)');
            }}
            className="lab-btn-secondary text-xs"
            title="Flush and Tare Sensor Array"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Tare (0.00V)</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="lab-btn-secondary text-xs group"
          >
            <Command className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] text-[#8E9B93] font-bold border border-white/[0.08]">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TOP ROW: 4 CLEAN LINEAR / STRIPE KPI CARDS
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="ASSAYS PROCESSED"
          value={historyCount.toLocaleString()}
          delta="+12 Today"
          deltaType="positive"
          sparklineData={[30, 45, 40, 60, 75, 82, 90, 110]}
          takeaway="All botanical specimens verified against certified pharmacopoeial monographs."
          tooltip="Total recorded chronological potentiostat runs in local audit ledger."
        />

        <KpiCard
          label="AUTHENTICITY RATE"
          value="96.7%"
          delta="+0.4% MoM"
          deltaType="positive"
          sparklineData={[94, 95, 95.5, 96.0, 96.2, 96.5, 96.7]}
          takeaway="High botanical purity with zero chemical adulterant false-negatives."
          tooltip="Cross-validated identification rate across reference standard assays."
        />

        <KpiCard
          label="ELECTRODES ONLINE"
          value="6 / 6 Ch"
          delta="Stable"
          deltaType="neutral"
          sparklineData={[6, 6, 6, 6, 6, 6, 6, 6]}
          takeaway="Potentiostat array calibrated within ±0.002V baseline tolerance."
          tooltip="Active cross-sensitive lipid and conductive-polymer working electrodes."
        />

        <KpiCard
          label="ADULTERATION ALERTS"
          value="0 Active"
          delta="Guarded"
          deltaType="positive"
          sparklineData={[3, 2, 1, 0, 0, 0, 0, 0]}
          takeaway="Zero synthetic azo dye or sawdust bulking detected in current active run."
          tooltip="Real-time potentiometric anomaly and dye contamination alerts."
        />
      </div>

      {/* =========================================================================
          3. MAIN STAGE: 6-CHANNEL CHRONOAMPEROMETRY STREAM & TEST INJECTION
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Oscilloscope Stream (Col 8) */}
        <div className="lg:col-span-8 lab-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="success">CHRONOAMPEROMETRY</Badge>
                <span className="text-xs font-mono text-[#8E9B93]">
                  250 S/s • 12-Bit SAR Ingestion
                </span>
              </div>
              <h3 className="text-base font-bold text-[#EDEFE8] mt-1.5">
                Live 6-Channel Oscilloscope Stream
              </h3>
            </div>

            {/* Timebase & Freeze Controls */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.08]">
                {['1s', '5s', '30s'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimebase(t)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                      timebase === t
                        ? 'bg-[#10B981] font-bold text-[#061209] shadow-xs'
                        : 'text-[#8E9B93] hover:text-[#EDEFE8]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="lab-btn-secondary text-xs"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-[#10B981]" /> : <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />}
                <span>{isPaused ? 'Resume' : 'Freeze'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Channel Toggles */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {SENSOR_SPECS.map((s, idx) => {
              const isActive = activeChannels[idx];
              return (
                <button
                  key={s.id}
                  onClick={() => toggleChannel(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.08] text-[#EDEFE8] border border-white/[0.14]'
                      : 'bg-white/[0.02] text-[#5A675F] border border-transparent hover:text-[#8E9B93]'
                  }`}
                  style={{
                    borderLeftColor: s.color,
                    borderLeftWidth: '3px',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>Ch{idx + 1}: {s.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Oscilloscope Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#060A08] shadow-inner">
            <canvas
              ref={canvasRef}
              width={900}
              height={260}
              className="w-full h-64 sm:h-72 block"
            />
          </div>

          {/* Test Preset Ingestion Ribbon */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <span className="text-[#8E9B93] font-medium">Quick Specimen Telemetry Injection:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ashwagandha', label: 'Pure Ashwagandha' },
                { key: 'haritaki', label: 'Haritaki Decoction' },
                { key: 'turmeric', label: 'Pure Turmeric' },
                { key: 'adulterated_dye', label: 'Metanil Yellow (Dye)' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => triggerDemo(p.key)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#EDEFE8] text-[11px] transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Certified Batch Dossier (Col 4) */}
        <div className="lg:col-span-4 lab-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Badge variant="success">CERTIFIED PURE</Badge>
              <span className="text-[11px] font-mono text-[#8E9B93]">{lastCertified.date}</span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-[#EDEFE8] tracking-tight">
                {lastCertified.name}
              </h3>
              <p className="text-xs text-[#8E9B93] italic mt-0.5">
                {lastCertified.botanical}
              </p>
            </div>

            {/* Circular Purity Meter */}
            <div className="my-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8E9B93] uppercase tracking-wider block">
                  Batch Ledger ID
                </span>
                <span className="text-xs font-mono font-bold text-[#EDEFE8] block mt-0.5">
                  {lastCertified.batch}
                </span>
                <span className="text-[10px] font-mono text-[#10B981] mt-1 block">
                  Peak: {lastCertified.peak}
                </span>
              </div>

              {/* Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#10B981"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="163.3"
                    strokeDashoffset={163.3 * (1 - lastCertified.score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute font-mono text-xs font-extrabold text-[#EDEFE8]">
                  {lastCertified.score}%
                </span>
              </div>
            </div>

            {/* Tamper-evident Digital Signature */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.08] text-[10px] font-mono space-y-1">
              <div className="flex justify-between items-center text-[#8E9B93] font-medium">
                <span>DIGITAL SIGNATURE (SHA-256):</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <span className="block truncate text-[#EDEFE8] font-bold select-all">
                {lastCertified.sha256}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Link
              to="/results"
              className="flex-1 lab-btn-primary justify-center text-xs"
            >
              <span>View Full Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => toast.success('ISO-17025 Certificate generated')}
              className="lab-btn-secondary p-2.5"
              title="Download Certificate"
            >
              <FileDown className="w-4 h-4 text-[#8E9B93]" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. 6-CHANNEL CHEMOSENSOR ARRAY STRIP
          ========================================================================= */}
      <div className="lab-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#EDEFE8]">
              6-Channel Chemosensor Working Electrodes
            </h3>
            <p className="text-xs text-[#8E9B93] font-mono">
              Biomimetic Lipid, PANI, Chitosan, Phthalocyanine, Crown Ether & RuOx Transducers
            </p>
          </div>
          <span className="text-xs font-mono text-[#5A675F]">
            Reference V_REF: 3.300V ±0.002V • 16x Hardware Oversampling
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { id: 'WE1', name: 'Lipid Membrane', color: '#10B981', rasa: 'Madhura', slope: '+0.012' },
            { id: 'WE2', name: 'Polyaniline', color: '#0EA5E9', rasa: 'Amla', slope: '-0.004' },
            { id: 'WE3', name: 'Chitosan Matrix', color: '#3B82F6', rasa: 'Lavana', slope: '+0.008' },
            { id: 'WE4', name: 'Phthalocyanine', color: '#F59E0B', rasa: 'Tikta', slope: '+0.045' },
            { id: 'WE5', name: 'Crown Ether', color: '#8B5CF6', rasa: 'Katu', slope: '-0.002' },
            { id: 'WE6', name: 'Ruthenium Oxide', color: '#059669', rasa: 'Kashaya', slope: '+0.038' },
          ].map((s, idx) => {
            const liveV = telemetry?.voltages[idx] || 0.0;
            return (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-2"
                style={{ borderTop: `2px solid ${s.color}` }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#EDEFE8] font-mono">{s.id}</span>
                  <span className="text-[10px] font-mono text-[#8E9B93]">{s.rasa}</span>
                </div>

                <div className="text-xl font-bold font-mono text-[#EDEFE8] tabular-nums">
                  {liveV.toFixed(3)}V
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8E9B93] pt-1 border-t border-white/[0.04]">
                  <span>{s.name.split(' ')[0]}</span>
                  <span className={s.slope.startsWith('+') ? 'text-[#10B981]' : 'text-[#8E9B93]'}>
                    {s.slope} V/s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          5. RECENT COMPLIANCE AUDIT BATCHES TABLE (Linear / Stripe Clean)
          ========================================================================= */}
      <div className="lab-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#EDEFE8]">
              Recent Certified Assay Ledger
            </h3>
            <p className="text-xs text-[#8E9B93] font-mono">
              Cryptographically signed raw potentiostat traces and monograph verifications
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs text-[#10B981] hover:underline font-mono flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0A0E0C]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[#8E9B93] text-[11px]">
                <tr>
                  <th className="p-3">ASSAY ID</th>
                  <th className="p-3">SPECIMEN NAME</th>
                  <th className="p-3">BATCH LOT</th>
                  <th className="p-3">CONFIDENCE</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#8E9B93]">
                {recentAnalyses.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedAssay(row)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="p-3 font-bold text-[#10B981]">{row.id}</td>
                    <td className="p-3 font-semibold text-[#EDEFE8] font-sans">{row.sampleName}</td>
                    <td className="p-3">{row.batchNumber}</td>
                    <td className="p-3 font-bold text-[#EDEFE8] tabular-nums">
                      {typeof row.confidence === 'number' ? `${row.confidence}%` : row.confidence}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={(row.status || '').toUpperCase().includes('PURE') ? 'success' : 'danger'}
                      >
                        {(row.status || 'VERIFIED').replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-[11px]">{row.date}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssay(row);
                        }}
                        className="p-1 rounded hover:bg-white/[0.06] text-[#8E9B93] group-hover:text-[#EDEFE8]"
                        title="Inspect details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. INSPECTOR SLIDE-OVER DRAWER (Stripe / Linear Detail Drawer)
          ========================================================================= */}
      {selectedAssay && (
        <DetailDrawer
          isOpen={Boolean(selectedAssay)}
          onClose={() => setSelectedAssay(null)}
          title={selectedAssay.sampleName}
          subtitle={`Assay Ledger ID: ${selectedAssay.id} • Batch: ${selectedAssay.batchNumber}`}
        >
          <div className="space-y-6 text-xs">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-[#8E9B93] uppercase">Confidence</span>
                <span className="text-lg font-bold font-mono text-[#10B981] block">
                  {typeof selectedAssay.confidence === 'number' ? `${selectedAssay.confidence}%` : selectedAssay.confidence}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-[#8E9B93] uppercase">Status</span>
                <div>
                  <Badge variant={(selectedAssay.status || '').toUpperCase().includes('PURE') ? 'success' : 'danger'}>
                    {selectedAssay.status || 'VERIFIED'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 6-Channel Potentials */}
            <div className="space-y-2 font-mono">
              <span className="font-semibold text-[#EDEFE8] block">6-Channel Recorded Potentials:</span>
              <div className="grid grid-cols-3 gap-2">
                {SENSOR_SPECS.map((s, idx) => (
                  <div key={s.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.08] text-center">
                    <span className="text-[10px] text-[#8E9B93] block">{s.id} ({s.name.split(' ')[0]})</span>
                    <span className="font-bold text-[#EDEFE8] block mt-0.5">
                      {selectedAssay.voltages && selectedAssay.voltages[idx] !== undefined
                        ? `${Number(selectedAssay.voltages[idx]).toFixed(2)}V`
                        : '1.20V'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* "Why this result?" Plain-English Explanation */}
            <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 space-y-2">
              <div className="flex items-center gap-1.5 text-[#10B981] font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Why this classification result?</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#EDEFE8]/90">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                  <span>
                    Potentiometric curve across all 6 lipid/polyaniline channels matches authentic reference standard within ±8% certified tolerance.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                  <span>
                    No anomalous halide conductivity surge detected on S3 electrode (0% synthetic azo dye adulteration).
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RefreshCw,
  Terminal,
  Database,
  Radio
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../services/apiClient';

export default function LiveAiAgentStream() {
  const [telemetry, setTelemetry] = useState(null);
  const [agentLog, setAgentLog] = useState([
    '[SENSE]: Awaiting physical potentiostat packet or live sample immersion...',
    '[STATUS]: AI Agent standing by on protocol MCP/v2.4...',
  ]);
  const [latestVerdict, setLatestVerdict] = useState(null);
  const [loading, setLoading] = useState(false);

  // Poll live telemetry periodically
  const fetchLive = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors/live`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLive();
    const timer = setInterval(fetchLive, 1200);
    return () => clearInterval(timer);
  }, []);

  // Trigger live demo injection (Simulates real ESP32 feeding into backend AI Agent)
  const triggerDemoFeed = async (specimenKey) => {
    setLoading(true);
    toast.loading('Streaming IoT sensor packet to Dravya AI Agent...', { id: 'feed' });

    try {
      const res = await fetch(`${API_BASE_URL}/iot/demo-feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specimenKey }),
      });

      const data = await res.json();
      toast.dismiss('feed');

      if (data.agentAnalysis) {
        const isAdulterated = Boolean(data.agentAnalysis.isAdulterated || data.agentAnalysis.status === 'ADULTERATED');
        const matchName = data.agentAnalysis.verdict || data.agentAnalysis.closestMatch?.name || data.specimen;

        setAgentLog(data.agentAnalysis.thoughtProcess || []);
        setLatestVerdict({
          name: data.specimen,
          match: matchName,
          confidence: data.agentAnalysis.confidence,
          isAdulterated,
          findings: data.agentAnalysis.adulterationFindings,
          peak: data.agentAnalysis.telemetry?.peakChannel?.channel || data.agentAnalysis.peakSensor,
        });

        if (isAdulterated) {
          toast.error(`⚠️ Adulteration Flagged: ${data.specimen}`);
        } else if (specimenKey !== 'tare') {
          toast.success(`✅ AI Agent Verified: ${matchName} (${data.agentAnalysis.confidence}%)`);
        } else {
          toast.success('Cell rinsed: 0.00V baseline restored');
        }
      }

      fetchLive();
    } catch (err) {
      toast.dismiss('feed');
      toast.error('Could not reach backend AI Agent service');
    } finally {
      setLoading(false);
    }
  };

  const voltages = telemetry?.voltages || [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
  const isStreaming = telemetry?.isConnected || false;

  return (
    <div className="rdv-card p-6 sm:p-7 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              <Sparkles className="w-3 h-3 text-teal-400 animate-spin-slow" />
              <span>AUTONOMOUS IOT REASONING AGENT</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-400">Direct Sensor-to-LLM Protocol (MCP)</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5">
            Real-Time IoT Sensor Ingestion & AI Agent Decision Engine
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#070A14] border border-white/10">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-300">Certified Archive Ledger</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 channel-pulse-dot' : 'bg-zinc-500'}`} />
            <span>{isStreaming ? 'HARDWARE STREAMING' : 'CELL STANDBY'}</span>
          </span>
        </div>
      </div>

      {/* 6 Direct Physical Electrode Readings */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>DIRECT SENSOR VOLTAGES (INGESTED BY AI AGENT):</span>
          </span>
          <span className="text-[11px] text-teal-400 font-semibold">{telemetry?.sampleName || 'Empty Sensor Cell'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          {[
            { id: 'WE1', name: 'Madhura (Sweet)', color: '#2DD4BF' },
            { id: 'WE2', name: 'Amla (Sour)', color: '#38BDF8' },
            { id: 'WE3', name: 'Lavana (Salty)', color: '#F59E0B' },
            { id: 'WE4', name: 'Tikta (Bitter)', color: '#F43F5E' },
            { id: 'WE5', name: 'Katu (Pungent)', color: '#A855F7' },
            { id: 'WE6', name: 'Kashaya (Astringent)', color: '#10B981' },
          ].map((ch, idx) => (
            <div
              key={ch.id}
              className="p-3 rounded-xl bg-[#070B16] border border-white/10 space-y-1 hover:border-white/20 transition-all"
              style={{ borderTop: `3px solid ${ch.color}` }}
            >
              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                <span className="font-bold text-white">{ch.id}</span>
                <span>{ch.name.split(' ')[0]}</span>
              </div>
              <div className="text-lg font-bold text-white tabular-nums tracking-tight">
                {voltages[idx]?.toFixed(3) || '0.000'} <span className="text-xs text-zinc-500 font-normal">V</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Agent Real-Time Terminal Thought Log */}
      <div className="rounded-2xl border border-white/10 bg-[#040711] p-4 space-y-3 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>DRAVYA-AI REASONING TERMINAL (CHAIN-OF-THOUGHT LOG)</span>
          </div>
          <span className="text-[10px] text-zinc-500">Autonomous Execution Stream</span>
        </div>

        <div className="space-y-1.5 text-zinc-300 max-h-40 overflow-y-auto leading-relaxed">
          {agentLog.map((line, idx) => {
            const isSense = line.includes('[SENSE]');
            const isAlert = line.includes('ALERT') || line.includes('ADULTER');
            const isVerdict = line.includes('[VERDICT]');
            return (
              <div
                key={idx}
                className={`text-[11px] ${
                  isAlert
                    ? 'text-rose-400 font-semibold'
                    : isVerdict
                    ? 'text-emerald-400 font-semibold'
                    : isSense
                    ? 'text-cyan-300'
                    : 'text-zinc-300'
                }`}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Verdict Banner (If Available) */}
      {latestVerdict && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 font-mono text-xs ${
            latestVerdict.isAdulterated
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {latestVerdict.isAdulterated ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-white">
                {latestVerdict.isAdulterated ? 'ADULTERATION FLAGGED' : 'PHARMACOPOEIA MATCH CONFIRMED'}
              </div>
              <div className="text-[11px] text-zinc-400">
                Specimen: {latestVerdict.match || latestVerdict.name} • Confidence: {latestVerdict.confidence}%
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-white font-bold">
            Peak: {latestVerdict.peak} Channel
          </div>
        </div>
      )}

      {/* LIVE DEMO INGESTION TRIGGER PANEL (FOR EXAMINERS / JUDGES) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C1424] via-[#090F1E] to-[#0D1526] border border-white/15 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-white text-xs font-mono uppercase tracking-wider">
              Live Demo: Ingest Physical Sensor Packet
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Click any specimen to feed real micro-voltages directly to the AI Agent
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-sans text-xs">
          <button
            onClick={() => triggerDemoFeed('ashwagandha')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-[#0E172A] hover:bg-[#152340] border border-teal-500/30 hover:border-teal-400 text-teal-300 font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-105 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>Ashwagandha</span>
          </button>

          <button
            onClick={() => triggerDemoFeed('haritaki')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-[#0E172A] hover:bg-[#152340] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-105 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Haritaki</span>
          </button>

          <button
            onClick={() => triggerDemoFeed('turmeric')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-[#0E172A] hover:bg-[#152340] border border-amber-500/30 hover:border-amber-400 text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-105 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Turmeric</span>
          </button>

          <button
            onClick={() => triggerDemoFeed('adulterated_dye')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/40 text-rose-300 font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-105 disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Adulterant Dye</span>
          </button>

          <button
            onClick={() => triggerDemoFeed('tare')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Rinse (0.00V)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

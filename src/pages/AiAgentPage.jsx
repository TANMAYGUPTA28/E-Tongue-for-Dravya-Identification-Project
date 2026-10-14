import { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Cpu,
  Activity,
  Send,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Terminal,
  Database,
  Radio
} from 'lucide-react';
import toast from 'react-hot-toast';
import LiveAiAgentStream from '../components/LiveAiAgentStream';
import ChatPanel from '../components/agent/ChatPanel';
import { API_BASE_URL } from '../services/apiClient';

export default function AiAgentPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [agentAnalysis, setAgentAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'agent',
      text: "Namaste! I am the Dravya Autonomous AI Chemometrics Agent (running on Model Context Protocol & Electrochemical Potentiostat pipelines). I am continuously ingesting live potentiometric feeds from the ESP32-S3 sensor array. Ask me anything about the live voltages, botanical identification, or adulteration markers!",
      time: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Poll live telemetry from backend
  const fetchLiveSensors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors/live`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLiveSensors();
    const timer = setInterval(fetchLiveSensors, 1500);
    return () => clearInterval(timer);
  }, []);

  // Run autonomous analysis on backend
  const runAgentReasoning = async (voltages = telemetry?.voltages || [0.72, 0.38, 0.45, 2.78, 1.15, 2.35], sampleName = telemetry?.sampleName || 'Ashwagandha') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/agent/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voltages, sampleName }),
      });
      const data = await res.json();
      setAgentAnalysis(data);
    } catch (err) {
      toast.error('Unable to connect to analysis engine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAgentReasoning();
  }, []);

  // Send interactive question to AI Agent
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim()) return;

    const userMsg = inputPrompt;
    setInputPrompt('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setChatLoading(true);
    try {
      const activeVoltages = telemetry?.voltages || [0.72, 0.38, 0.45, 2.78, 1.15, 2.35];
      const res = await fetch(`${API_BASE_URL}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          currentVoltages: activeVoltages,
          specimen: telemetry?.sampleName || 'Live Sample',
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'agent', text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'agent', text: 'Unable to communicate with the assistant service. Please check your network connection and try again.', time: 'Now' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* Page Title & Status */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              <Sparkles className="w-3 h-3 text-teal-400 animate-spin-slow" />
              <span>AUTONOMOUS CHEMOMETRICS AGENT</span>
            </span>
            <span className="text-xs font-mono text-zinc-400">Direct IoT Sensor Ingestion & Reasoning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Dravya AI Agent: Real-Time Chemometrics Co-Pilot
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
            Interprets multi-channel potentiometric signals, verifies Ayurvedic Pharmacopoeia (API), and flags botanical adulterants.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090D1A] border border-white/10 text-zinc-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Archive Database Connected</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>Sensor Stream Active</span>
          </span>
        </div>
      </div>

      {/* 1. Live IoT Sensor Ingestion & Reasoning Stream */}
      <LiveAiAgentStream />

      {/* 2. Chat Copilot & Knowledge Synthesis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Agent Explanation & Pharmacopoeia Verification */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rdv-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Autonomous Synthesis & Pharmacopoeia Verification
                </h3>
              </div>
              <button
                onClick={() => runAgentReasoning()}
                disabled={loading}
                className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {agentAnalysis ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Status Box */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    agentAnalysis.status === 'VERIFIED_PURE'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {agentAnalysis.status === 'VERIFIED_PURE' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-sm text-white">
                      Verdict: {agentAnalysis.verdict} ({agentAnalysis.confidence}% Confidence)
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Standard: {agentAnalysis.pharmacopoeiaStandard}
                    </div>
                    <p className="text-xs font-sans mt-2 text-zinc-300 leading-relaxed">
                      {agentAnalysis.aiExplanation}
                    </p>
                  </div>
                </div>

                {/* Dosha & Karma Card */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#090D1A] border border-white/10 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Dosha Karma</span>
                    <span className="font-semibold text-white text-xs">{agentAnalysis.doshaKarma || 'Rasayana / Tridosha'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#090D1A] border border-white/10 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Adulteration Risk</span>
                    <span className={`font-semibold text-xs ${agentAnalysis.adulterationRisk?.includes('NEGLIGIBLE') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {agentAnalysis.adulterationRisk || 'Negligible'}
                    </span>
                  </div>
                </div>

                {/* Adulteration alerts if detected */}
                {agentAnalysis.adulterationFindings?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] space-y-1.5">
                    <span className="font-bold block flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Adulteration Signatures Flagged by AI Agent:</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-zinc-300">
                      {agentAnalysis.adulterationFindings.map((finding, i) => (
                        <li key={i}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                Awaiting agent synthesis...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Dravya AI Copilot Chat (SSE + GenerativeRenderer) */}
        <div className="lg:col-span-6 h-[560px]">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

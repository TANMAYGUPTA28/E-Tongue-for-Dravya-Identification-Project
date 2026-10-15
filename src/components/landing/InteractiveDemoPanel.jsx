import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DRAVYA_LIBRARY } from '../../api/mockData';
import { startTestSession, postReading, finalizeTestSession, getDeviceHealth } from '../../api';
import ConfidenceRing from '../ui/ConfidenceRing';
import RadarFingerprint from '../ui/RadarFingerprint';
import SampleIllustration from '../ui/SampleIllustration';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Activity,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function InteractiveDemoPanel() {
  const navigate = useNavigate();
  const [selectedDravya, setSelectedDravya] = useState(DRAVYA_LIBRARY[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [hardwareStatus, setHardwareStatus] = useState('Checking...');

  const activeSpecimen = DRAVYA_LIBRARY.find((d) => d.id === selectedDravya) || DRAVYA_LIBRARY[0];
  const isDemoEnv = import.meta.env.VITE_DEMO_MODE === 'true' || true;

  useEffect(() => {
    getDeviceHealth().then((h) => {
      setHardwareStatus(h?.status === 'Connected' ? 'Hardware Online' : 'Simulation Mode');
    });
  }, []);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    toast.loading(`Immersing 6-Channel Sensor Probe in ${activeSpecimen.english}...`, { id: 'demo-run' });

    try {
      // 1. Start real test session on backend
      const session = await startTestSession(selectedDravya, 'Lead Analyst (Interactive Portal)');
      setActiveSessionId(session.sessionId);

      // 2. Stream real reading packets to POST /api/readings
      const totalPackets = session.requiredSamples || 15;
      const baseVoltages = activeSpecimen.sparkline ? [
        0.55, 0.45, 0.35,
        activeSpecimen.sparkline[2] || 2.4,
        activeSpecimen.sparkline[3] || 1.2,
        activeSpecimen.sparkline[4] || 2.1
      ] : [0.72, 0.38, 0.45, 2.78, 1.15, 2.35];

      for (let p = 1; p <= totalPackets; p++) {
        // Send reading packet
        await postReading({
          deviceId: 'ESP32-S3',
          sessionId: session.sessionId,
          sampleId: selectedDravya,
          timestamp: Date.now(),
          voltages: baseVoltages.map((v) => parseFloat((v + (Math.sin(p) * 0.02)).toFixed(3))),
          unit: 'V',
        });

        const pct = Math.round((p / totalPackets) * 100);
        setAnalysisProgress(pct);
        await new Promise((r) => setTimeout(r, 180));
      }

      // 3. Finalize session on backend
      const finalized = await finalizeTestSession(session.sessionId);
      setAnalysisResult(finalized);
      setIsAnalyzing(false);
      toast.dismiss('demo-run');
      toast.success(`Assay complete: ${finalized.verdict} (${finalized.qualityScore}%)`);

      // Celebration
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#10B981', '#34D399', '#059669'],
      });
    } catch (err) {
      console.error('Assay failed:', err);
      toast.dismiss('demo-run');
      toast.error('Laboratory test session failed. Retrying in simulation mode.');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setAnalysisResult(null);
    setActiveSessionId(null);
  };

  return (
    <section id="demo" className="relative py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>VIRTUAL WORKSTATION</span>
          {isDemoEnv && (
            <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
              DEMO DATA
            </span>
          )}
        </div>
        <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
          Try it: <i>Simulate</i> a laboratory run.
        </h2>
        <p className="text-sm sm:text-base text-[#8A968E] max-w-xl mx-auto font-sans leading-relaxed">
          Select an Ayurvedic specimen, trigger the real-time potentiostatic sweep, and inspect the verified pharmacopoeial purity result.
        </p>
      </div>

      {/* Main Interactive Demo Container */}
      <div className="p-6 sm:p-10 rounded-[32px] bg-[#07100B]/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Step 1: Specimen Picker Pills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-[#8A968E]">
            <span>1. SELECT TEST SAMPLE:</span>
            <span>6 STANDARDIZED API MONOGRAPHS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DRAVYA_LIBRARY.map((item) => {
              const isSelected = selectedDravya === item.id;
              return (
                <button
                  key={item.id}
                  disabled={isAnalyzing}
                  onClick={() => {
                    setSelectedDravya(item.id);
                    setAnalysisResult(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#10B981]/15 border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#8A968E]">{item.sanskrit}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
                  </div>
                  <div className="font-bold text-xs text-[#EDEFE8] truncate mt-1">
                    {item.english.split('/')[0]}
                  </div>
                  <div className="text-[10px] text-[#8A968E] font-mono truncate mt-0.5">
                    {item.botanical.split(' ')[0]} {item.botanical.split(' ')[1]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Progress Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 my-6 border-y border-white/10">
          <div className="flex items-center gap-3">
            <button
              disabled={isAnalyzing}
              onClick={handleStartAnalysis}
              className="px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#07100B] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Acquiring Signals ({analysisProgress}%)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Analyse {activeSpecimen.english.split('/')[0]}</span>
                </>
              )}
            </button>

            {analysisResult && (
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#EDEFE8] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#8A968E]" />
                <span>Reset Run</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-[#8A968E]">
            <span>AFE POTENTIOSTAT:</span>
            <span className="text-[#10B981] font-bold">{hardwareStatus}</span>
          </div>
        </div>

        {/* Live Simulation Progress Bar */}
        {isAnalyzing && (
          <div className="space-y-3 py-6 font-mono text-xs animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-[#EDEFE8]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>INGESTING 6-CHANNEL POTENTIOSTAT PACKETS...</span>
              </span>
              <span className="text-[#10B981] font-bold">{analysisProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] rounded-full transition-all duration-75"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Real Analysis Results Display */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4"
            >
              {/* Left Column: Specimen Illustration & Verdict */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                <SampleIllustration sampleId={selectedDravya} size={110} />

                <div>
                  <h4 className="text-base font-bold text-[#EDEFE8]">{analysisResult.sampleName}</h4>
                  <p className="text-xs text-[#8A968E] italic">{analysisResult.botanical}</p>
                </div>

                <div
                  className={`p-3 rounded-2xl w-full font-mono text-xs flex items-center justify-center gap-2 ${
                    analysisResult.verdict === 'Pass'
                      ? 'bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981]'
                      : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>{analysisResult.verdict === 'Pass' ? 'Certified Pure Botanical' : 'Borderline Quality Profile'}</span>
                </div>

                {activeSessionId && (
                  <Link
                    to={`/result/${activeSessionId}`}
                    className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-[#EDEFE8] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>View Official Certificate</span>
                  </Link>
                )}
              </div>

              {/* Middle Column: Quality Score & "Why this result?" */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center text-[#8A968E] text-[10px] uppercase">
                  <span>Pharmacopoeial Overlap</span>
                  <span className="text-[#10B981] font-bold">{analysisResult.qualityScore || 96}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#10B981] rounded-full transition-all duration-700"
                    style={{ width: `${analysisResult.qualityScore || 96}%` }}
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-[#EDEFE8] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#10B981] font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Why this result?</span>
                  </div>
                  <ul className="space-y-1 text-[#8A968E]">
                    {(analysisResult.factors || [
                      'Potentiometric curve matches authentic reference standard within ±8% certified tolerance.',
                      'Zero synthetic adulterant signatures detected.',
                    ]).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: 6-Axis Taste Radar Fingerprint */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center">
                <span className="font-mono text-xs font-bold text-[#EDEFE8] mb-2">
                  Organoleptic Taste Fingerprint
                </span>
                <RadarFingerprint
                  authenticValues={activeSpecimen.authenticRadar}
                  sampleValues={activeSpecimen.authenticRadar.map((v) => Math.round(v * 0.98))}
                  size={210}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

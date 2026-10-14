import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DRAVYA_LIBRARY } from '../../api/mockData';
import { runAnalysisSample } from '../../api';
import ConfidenceRing from '../ui/ConfidenceRing';
import RadarFingerprint from '../ui/RadarFingerprint';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function InteractiveDemoPanel() {
  const [selectedDravya, setSelectedDravya] = useState(DRAVYA_LIBRARY[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);

  const activeSpecimen = DRAVYA_LIBRARY.find((d) => d.id === selectedDravya) || DRAVYA_LIBRARY[0];

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    toast.loading(`Immersing 6-Channel Sensor Probe in ${activeSpecimen.english}...`, { id: 'demo-run' });

    // 6-second simulated acquisition progress
    const duration = 5000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(async () => {
      currentStep++;
      const pct = Math.min(Math.round((currentStep / steps) * 100), 100);
      setAnalysisProgress(pct);

      if (currentStep >= steps) {
        clearInterval(timer);
        toast.dismiss('demo-run');
        toast.success(`Classification complete: ${activeSpecimen.english} (${activeSpecimen.purityRating}%)`);

        const res = await runAnalysisSample(selectedDravya);
        setAnalysisResult(res);
        setIsAnalyzing(false);

        // Confetti celebration
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#B6F36A', '#3E7B4C', '#E0A03A'],
        });
      }
    }, intervalTime);
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setAnalysisResult(null);
  };

  return (
    <section id="demo" className="relative py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#B6F36A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />
          <span>VIRTUAL WORKSTATION</span>
        </div>
        <h2 className="font-display-hero text-4xl sm:text-6xl text-[#EDEFE8]">
          Try it: <i>Simulate</i> a laboratory run.
        </h2>
        <p className="text-sm sm:text-base text-[#8A968E] max-w-xl mx-auto font-sans leading-relaxed">
          Select an Ayurvedic specimen, trigger the automated potentiostatic sweep, and watch the Random Forest classifier calculate purity in real time.
        </p>
      </div>

      {/* Main Interactive Demo Container */}
      <div className="p-6 sm:p-10 rounded-[32px] bg-[#07100B]/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Step 1: Specimen Picker Pills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-[#8A968E]">
            <span>1. SELECT TEST SAMPLE:</span>
            <span>42 REPOSITORY MONOGRAPHS</span>
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
                      ? 'bg-[#3E7B4C]/25 border-[#B6F36A] shadow-[0_0_20px_rgba(182,243,106,0.2)] scale-[1.02]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#8A968E]">{item.sanskrit}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A]" />}
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
              className="px-6 py-3 rounded-full bg-[#B6F36A] hover:bg-[#cbfb88] disabled:opacity-50 text-[#07100B] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(182,243,106,0.35)] cursor-pointer transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Sweeping Sensors ({analysisProgress}%)</span>
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
            <span className="text-[#B6F36A] font-bold">READY (COM3 // 115200)</span>
          </div>
        </div>

        {/* Live Simulation Progress Bar */}
        {isAnalyzing && (
          <div className="space-y-3 py-6 font-mono text-xs animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-[#EDEFE8]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B6F36A] animate-ping" />
                <span>ACQUIRING 6-CHANNEL POTENTIOSTAT SIGNALS...</span>
              </span>
              <span className="text-[#B6F36A] font-bold">{analysisProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3E7B4C] via-[#E0A03A] to-[#B6F36A] rounded-full transition-all duration-75"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Analysis Results Display */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4"
            >
              {/* Left Column: Confidence Ring & Status */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                <ConfidenceRing
                  percentage={analysisResult.confidence}
                  size={150}
                  label="Random Forest Confidence"
                />

                <div className="p-3 rounded-2xl bg-[#3E7B4C]/20 border border-[#B6F36A]/30 w-full font-mono text-xs text-[#B6F36A]">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-[#B6F36A]" />
                  <span>Pharmacopoeia Verified</span>
                </div>

                <div className="text-[10px] font-mono text-[#8A968E] space-y-1 w-full text-left pt-2 border-t border-white/5">
                  <div className="flex justify-between">
                    <span>Batch Hash:</span>
                    <span className="text-[#EDEFE8] truncate max-w-[120px]">{analysisResult.sha256}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Markers:</span>
                    <span className="text-[#EDEFE8]">{activeSpecimen.activeMolecules[0]}</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Top-3 Match Probability Bars */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center text-[#8A968E] text-[10px] uppercase">
                  <span>Classification Candidates</span>
                  <span>Match %</span>
                </div>

                <div className="space-y-3">
                  {analysisResult.top3.map((cand, idx) => (
                    <div key={cand.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-[#EDEFE8]">{cand.name}</span>
                        <span className="font-bold text-[#B6F36A]">{cand.confidence}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${cand.confidence}%`,
                            backgroundColor: idx === 0 ? '#B6F36A' : idx === 1 ? '#E0A03A' : '#38BDF8',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-[#8A968E] space-y-1">
                  <span className="font-bold text-[#EDEFE8] block">Ayurvedic Properties:</span>
                  <div>Rasa: {activeSpecimen.primaryRasa}</div>
                  <div>Guna: {activeSpecimen.guna} • Virya: {activeSpecimen.virya}</div>
                </div>
              </div>

              {/* Right Column: 6-Axis Taste Radar Fingerprint */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center">
                <span className="font-mono text-xs font-bold text-[#EDEFE8] mb-2">
                  Organoleptic Fingerprint
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

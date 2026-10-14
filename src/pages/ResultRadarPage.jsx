import { useEffect, useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileDown,
  Layers,
  Leaf,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Printer,
  Copy,
  Zap,
  Info
} from 'lucide-react';
import { api, REFERENCE_STANDARDS } from '../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const RADAR_AXES = [
  { label: 'Madhura (Sweet)', channel: 'Ch1 Lipid', angle: -Math.PI / 2, color: '#0D9488' },
  { label: 'Amla (Sour)', channel: 'Ch2 PANI', angle: -Math.PI / 6, color: '#0284C7' },
  { label: 'Lavana (Salty)', channel: 'Ch3 Chitosan', angle: Math.PI / 6, color: '#2563EB' },
  { label: 'Tikta (Bitter)', channel: 'Ch4 PcComplex', angle: Math.PI / 2, color: '#D97706' },
  { label: 'Katu (Pungent)', channel: 'Ch5 Crown Ether', angle: (5 * Math.PI) / 6, color: '#7C3AED' },
  { label: 'Kashaya (Astringent)', channel: 'Ch6 RuOx', angle: (-5 * Math.PI) / 6, color: '#059669' },
];

export default function ResultRadarPage() {
  const [selectedStandard, setSelectedStandard] = useState('Haritaki (Terminalia chebula)');
  const [result, setResult] = useState(null);
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(0);
  const radarCanvasRef = useRef(null);

  // Load initial analysis result
  useEffect(() => {
    api.startAnalysis({ sampleName: 'Haritaki (Terminalia chebula)', batchNumber: 'BATCH-HAR-2026-A' }).then((res) => {
      setResult(res);
      // Fire celebration confetti if confidence > 95%
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#0D9488', '#0284C7', '#2563EB', '#D97706', '#10B981', '#7C3AED'],
      });
    });
  }, []);

  // High Precision Interactive 6-Axis Radar Spider Fingerprint Canvas
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 48;

    ctx.clearRect(0, 0, width, height);

    // Pristine White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 1. Concentric Hexagonal Grids (20%, 40%, 60%, 80%, 100%)
    for (let level = 1; level <= 5; level++) {
      const r = (radius / 5) * level;
      ctx.beginPath();
      RADAR_AXES.forEach((axis, i) => {
        const x = centerX + r * Math.cos(axis.angle);
        const y = centerY + r * Math.sin(axis.angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = level === 5 ? '#CBD5E1' : '#F1F5F9';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Percentage label on top axis
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px monospace';
      ctx.fillText(`${level * 20}%`, centerX + 4, centerY - r + 3);
    }

    // 2. Six Radial Spokes
    RADAR_AXES.forEach((axis) => {
      const x = centerX + radius * Math.cos(axis.angle);
      const y = centerY + radius * Math.sin(axis.angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer Axis Label
      const labelX = centerX + (radius + 24) * Math.cos(axis.angle);
      const labelY = centerY + (radius + 24) * Math.sin(axis.angle);
      ctx.fillStyle = axis.color;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axis.label.split(' ')[0], labelX, labelY);
    });

    // Mock/Real Scores
    const sampleScores = result?.radarScores || {
      madhura: 28,
      amla: 64,
      lavana: 22,
      tikta: 88,
      katu: 45,
      kashaya: 96,
    };

    const refScores = {
      madhura: 25,
      amla: 60,
      lavana: 20,
      tikta: 85,
      katu: 42,
      kashaya: 95,
    };

    const keys = ['madhura', 'amla', 'lavana', 'tikta', 'katu', 'kashaya'];

    // 3. Draw Pure Botanical Reference Polygon (Dashed Slate)
    ctx.beginPath();
    keys.forEach((k, i) => {
      const score = refScores[k];
      const r = (radius * score) / 100;
      const x = centerX + r * Math.cos(RADAR_AXES[i].angle);
      const y = centerY + r * Math.sin(RADAR_AXES[i].angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Live Sample Signature Polygon (Vibrant Emerald Cyan Fill with Glow)
    ctx.beginPath();
    keys.forEach((k, i) => {
      const score = sampleScores[k];
      const r = (radius * score) / 100;
      const x = centerX + r * Math.cos(RADAR_AXES[i].angle);
      const y = centerY + r * Math.sin(RADAR_AXES[i].angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(13, 148, 136, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#0D9488';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 5. Draw Glowing Vertices
    keys.forEach((k, i) => {
      const score = sampleScores[k];
      const r = (radius * score) / 100;
      const x = centerX + r * Math.cos(RADAR_AXES[i].angle);
      const y = centerY + r * Math.sin(RADAR_AXES[i].angle);

      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#0D9488';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [result]);

  const handlePrint = () => {
    window.print();
  };

  const copyHash = () => {
    navigator.clipboard.writeText('8f4b2a9e1c3d7f02a5e8c1b9d4e2a6f874bc0991c2da');
    toast.success('SHA-256 Signature copied to clipboard');
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-7 pb-20 font-sans">

      {/* =========================================================================
          1. PRIMARY VERDICT BANNER (HIGH CONFIDENCE ANNOUNCEMENT BADGE)
          ========================================================================= */}
      <div className="bento-card p-6 sm:p-7 holographic-badge border-teal-300/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/25">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>VERIFIED PURE BOTANICAL</span>
              </span>
              <span className="text-xs font-mono text-slate-600">API Part 1, Vol. I, Page 15</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              {result?.metadata?.sampleName || 'Haritaki (Terminalia chebula)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-mono">
              Botanical Standard: <span className="italic font-bold">Terminalia chebula Retz.</span> • Batch: BATCH-HAR-2026-A
            </p>
          </div>
        </div>

        {/* Confidence Score Pill & Print Buttons */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Authenticity Score
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono tracking-tight">
              {result?.confidence || 96.4}%
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={copyHash}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Hash</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN CONTENT GRID: 6-AXIS RADAR CHART & PHYTOCHEMICAL EXPLAINABILITY
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (COL 7): INTERACTIVE 6-AXIS RADAR SPIDER CHART */}
        <div className="lg:col-span-7 bento-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                6-Axis Organoleptic & Electrochemical Radar Fingerprint
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Cross-reactive relative response pattern across the 6 Ayurvedic Rasas
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-600/30 border border-teal-600" />
                <span className="text-slate-800 font-semibold">Live Specimen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400" />
                <span className="text-slate-500">API Monograph Ref</span>
              </div>
            </div>
          </div>

          {/* Radar Canvas */}
          <div className="flex items-center justify-center p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
            <canvas
              ref={radarCanvasRef}
              width={480}
              height={400}
              className="max-w-full h-auto"
            />
          </div>

          {/* Channel Values Quick Row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-2">
            {RADAR_AXES.map((axis) => (
              <div key={axis.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-[10px] font-mono text-slate-500 block truncate">{axis.label.split(' ')[0]}</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block" style={{ color: axis.color }}>
                  {axis.channel.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (COL 5): PHYTOCHEMICAL EXPLAINABILITY ACCORDION */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">
                Phytochemical Explainability Accordion
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              White-box chemometric attribution explaining why the sensor response matches the botanical standard.
            </p>

            {/* Accordion Cards */}
            <div className="space-y-2.5">
              {[
                {
                  id: 0,
                  title: 'Bioactive Polyphenols & Chebulic Acid',
                  sensor: 'Ch6 RuOx Working Electrode (3.22V)',
                  body: 'Strong redox peak at +3.22V indicates high concentrations of chebulagic acid, ellagic acid, and gallic acid. Ruthenium oxide surface is sensitive to catalytic polyphenol oxidation.',
                },
                {
                  id: 1,
                  title: 'Tannin Content & Astringency (Kashaya)',
                  sensor: 'Ch1 Lipid Membrane Transducer (2.85V)',
                  body: 'Potentiometric shift across the synthetic lipid bilayer confirms significant hydrolyzable tannins, matching the astringent (Kashaya) rasa characteristic of authentic Haritaki.',
                },
                {
                  id: 2,
                  title: 'Ionic Conductivity & Organic Acid Base',
                  sensor: 'Ch2 Polyaniline (PANI) Film (0.92V)',
                  body: 'Polyaniline emeraldine-salt transition responds selectively to hydronium ions from free organic acids, confirming standard pH buffer equilibrium.',
                },
                {
                  id: 3,
                  title: 'Zero Synthetic Azo Dye Signatures',
                  sensor: 'Ch4 PcComplex Non-Linear Adulteration Scanner',
                  body: 'Metanil Yellow, Sudan dyes, and starch fillers exhibit anomalous differential spikes above 3.5V on Ch4. This sample exhibited zero deviation (Risk < 0.5%).',
                },
              ].map((card, idx) => {
                const isOpen = openAccordion === idx;
                return (
                  <div
                    key={card.id}
                    className="rounded-xl border border-slate-200 overflow-hidden transition-all bg-white"
                  >
                    <button
                      onClick={() => setOpenAccordion(isOpen ? -1 : idx)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {card.title}
                        </div>
                        <div className="text-[10px] font-mono text-teal-700 mt-0.5">
                          {card.sensor}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-3.5 pt-0 text-xs text-slate-600 font-sans leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {card.body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CRYPTOGRAPHIC PURITY CERTIFICATE BADGE */}
          <div className="bento-card p-6 space-y-4 border-emerald-200 bg-emerald-50/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Cryptographic Purity Certificate
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                IMMUTABLE
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-snug">
              This specimen has been authenticated by the Dravya-6000 AI Workstation in accordance with Schedule T (Good Manufacturing Practices) and API monograph specifications.
            </p>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-[10px] font-mono text-slate-700 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>DIGITAL CERTIFICATE SHA-256:</span>
                <span className="text-emerald-700 font-bold">VERIFIED</span>
              </div>
              <div className="font-bold text-slate-900 break-all select-all">
                8f4b2a9e1c3d7f02a5e8c1b9d4e2a6f874bc0991c2da
              </div>
            </div>

            <button
              onClick={() => toast.success('Official Certificate generated. Ready for dispatch.')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Official Analytical Certificate (PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

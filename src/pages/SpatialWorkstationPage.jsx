import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Cpu,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  RotateCcw,
  Sun,
  Moon,
  FileDown,
  Layers,
  ArrowRight,
  ChevronDown,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import ThreeSensorProbeStage from '../components/ThreeSensorProbeStage';
import toast from 'react-hot-toast';

export default function SpatialWorkstationPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [lightingMode, setLightingMode] = useState('dark');
  const [isDipping, setIsDipping] = useState(false);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [fps, setFps] = useState(60);
  const navigate = useNavigate();

  // Measure rough visual FPS
  useEffect(() => {
    let frames = 0;
    let prevTime = performance.now();
    let frameId;

    const loop = () => {
      frames++;
      const time = performance.now();
      if (time >= prevTime + 1000) {
        setFps(Math.round((frames * 1000) / (time - prevTime)));
        frames = 0;
        prevTime = time;
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const triggerAutonomousDipAndRun = async () => {
    setIsDipping(true);
    setActiveSection(1);
    toast.loading('Descending Titanium Probe into Dravya Extract...', { id: 'dip' });

    try {
      await fetch('http://localhost:5000/api/iot/demo-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specimenKey: 'haritaki' }),
      });

      setTimeout(() => {
        toast.dismiss('dip');
        toast.success('Electrode Immersion Complete: Ion flux detected');
        setActiveSection(2);
      }, 2500);

      setTimeout(() => {
        setActiveSection(3);
        toast.success('3D Spatial Radar Spider Fingerprint Materialized');
      }, 5500);
    } catch (e) {
      toast.dismiss('dip');
      toast.error('Could not reach backend');
    }
  };

  const calibrateArray = async () => {
    toast.loading('Trimming zero offsets across 6 micro-electrodes...', { id: 'cal' });
    try {
      await fetch('http://localhost:5000/api/sensors/sample/eject', { method: 'POST' });
      toast.dismiss('cal');
      toast.success('3D Array Calibrated: Baseline ΔV = 0.000V');
      setIsDipping(false);
      setActiveSection(0);
    } catch (e) {
      toast.dismiss('cal');
      toast.success('Calibrated baseline zeroed');
    }
  };

  return (
    <div className={`relative w-full min-h-screen overflow-hidden font-sans transition-colors duration-500 ${
      lightingMode === 'dark' ? 'bg-[#030712] text-zinc-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* 1. Fullscreen WebGL 2.0 3D Centerpiece Canvas */}
      <ThreeSensorProbeStage
        activeSection={activeSection}
        lightingMode={lightingMode}
        isDipping={isDipping}
        onPinHover={setHoveredPin}
      />

      {/* 2. Top Spatial Glassmorphism HUD Bar */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between flex-wrap gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#090E1F]/80 backdrop-blur-xl border border-white/10 shadow-lg text-white group"
          >
            <div className="w-7 h-7 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-tight block">
                E-TONGUE PRO 3D
              </span>
              <span className="text-[9px] font-mono text-zinc-400 block -mt-0.5">
                Spatial Scrollytelling
              </span>
            </div>
          </Link>

          {/* Section Indicator Pills */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl bg-[#090E1F]/70 backdrop-blur-xl border border-white/10 text-xs font-mono">
            {[
              { id: 0, label: 'Hero Probe' },
              { id: 1, label: 'Sensor Dip' },
              { id: 2, label: 'Swarm HUD' },
              { id: 3, label: '3D Radar' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                  activeSection === s.id
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Telemetry Specs */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-2xl bg-[#090E1F]/80 backdrop-blur-xl border border-white/10 flex items-center gap-2 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>COM3 Active</span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-[#090E1F]/80 backdrop-blur-xl border border-white/10 flex items-center gap-1.5 text-teal-300">
            <Cpu className="w-3.5 h-3.5" />
            <span>{fps} FPS (WebGL 2.0)</span>
          </div>

          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold transition-all flex items-center gap-1.5"
          >
            <span>2D Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 3. Floating 3D Spatial Hover Hotspot Card (When Pin is Hovered) */}
      {hoveredPin && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 p-4 rounded-2xl bg-[#070C1A]/90 backdrop-blur-2xl border border-teal-500/40 shadow-[0_0_35px_rgba(45,212,191,0.25)] font-mono text-xs animate-in fade-in zoom-in-95 duration-150 space-y-1.5 min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredPin.colorHex }} />
              <span>{hoveredPin.id}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
              MICRO-ELECTRODE
            </span>
          </div>
          <div className="text-zinc-300 text-xs font-semibold">{hoveredPin.name}</div>
          <div className="flex justify-between items-center text-[11px] pt-1 border-t border-white/10">
            <span className="text-zinc-400">Ayurvedic Rasa:</span>
            <span className="text-teal-400 font-bold">{hoveredPin.rasa}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-400">Nernstian Potential:</span>
            <span className="text-white font-bold">{hoveredPin.targetV}</span>
          </div>
        </div>
      )}

      {/* 4. Section 1 Overlay — Cinematic Hero (Side-Docked HUD Cards) */}
      {activeSection === 0 && (
        <>
          {/* Left Hero Card */}
          <div className="absolute top-24 left-6 z-20 max-w-sm p-6 rounded-3xl bg-[#070B18]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4 font-mono animate-in slide-in-from-left duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />
              <span>ANTIGRAVITY // 01 HERO</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow">
                E-TONGUE PRO
              </h1>
              <p className="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                Biomimetic 6-Channel Potentiostat with Tri-Ring Gyroscope levitation. Hover over electrode pins or engage the autonomous sequence.
              </p>
            </div>
            <div className="space-y-1.5 text-[11px] pt-1 border-t border-white/10">
              <div className="flex justify-between text-zinc-400">
                <span>AFE Potential:</span>
                <span className="text-emerald-400 font-bold">250 S/s • COM3</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Levitation Stability:</span>
                <span className="text-teal-300 font-bold">99.8% Nominal</span>
              </div>
            </div>
            <button
              onClick={() => setActiveSection(1)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(45,212,191,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Engage Quantum Dip</span>
            </button>
          </div>

          {/* Right Live Working Electrode Matrix */}
          <div className="hidden lg:block absolute top-24 right-6 z-20 w-72 p-5 rounded-3xl bg-[#070B18]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-3 font-mono text-xs animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">AFE Working Array</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="space-y-1.5">
              {[
                { id: 'WE1', name: 'Lipid Membrane', v: '0.722V', col: '#14B8A6' },
                { id: 'WE2', name: 'Polyaniline', v: '0.384V', col: '#0EA5E9' },
                { id: 'WE3', name: 'Chitosan Gel', v: '0.450V', col: '#3B82F6' },
                { id: 'WE4', name: 'Phthalocyanine', v: '2.777V', col: '#F59E0B' },
                { id: 'WE5', name: 'Crown Ether', v: '1.151V', col: '#8B5CF6' },
                { id: 'WE6', name: 'Ruthenium Ox', v: '2.352V', col: '#10B981' },
              ].map((pin) => (
                <div key={pin.id} className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pin.col }} />
                    <span className="text-zinc-300 font-semibold">{pin.id}</span>
                    <span className="text-zinc-500 text-[10px]">{pin.name}</span>
                  </div>
                  <span className="text-white font-bold">{pin.v}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 5. Section 2 Overlay — Physical Immersion Sequence */}
      {activeSection === 1 && (
        <div className="absolute top-24 left-6 z-20 max-w-md p-5 rounded-3xl bg-[#070B18]/85 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3 font-mono text-xs animate-in slide-in-from-left duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-white text-sm">SECTION 02 // SENSOR DIP</span>
          </div>
          <p className="text-zinc-300 font-sans text-xs leading-relaxed">
            Titanium probe descended into herbal extract. Surface tension ripples formed, triggering microscopic ion migration and electron exchange across the 6 Working Electrodes.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
              <span className="text-zinc-500 block">Peak Rasa</span>
              <span className="text-teal-400 font-bold">Tikta (2.78V)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
              <span className="text-zinc-500 block">Double-Layer Capacitance</span>
              <span className="text-sky-400 font-bold">14.2 µF/cm²</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Section 3 Overlay — Multi-Agent Swarm Spatial HUD */}
      {activeSection === 2 && (
        <div className="absolute top-24 right-6 z-20 max-w-sm p-5 rounded-3xl bg-[#070B18]/85 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3 font-mono text-xs animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
            <span className="font-bold text-white text-sm">SECTION 03 // 4-AGENT SWARM</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300">
              <span className="font-bold block">SignalGuard</span>
              <span className="text-[10px] text-zinc-400">Sonic radar sweep: baseline 0.00V verified</span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300">
              <span className="font-bold block">SpectrumAgent</span>
              <span className="text-[10px] text-zinc-400">3D laser vectors measuring peak deltas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <span className="font-bold block">DravyaScribe</span>
              <span className="text-[10px] text-zinc-400">3D lattice: Chebulagic Acid identified</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <span className="font-bold block">Veritas Auditor</span>
              <span className="text-[10px] text-zinc-400">SHA-256 Monograph Seal: 96.4% Authenticity</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Section 4 Overlay — 3D Spatial Radar Spider Fingerprint */}
      {activeSection === 3 && (
        <div className="absolute top-24 left-6 z-20 max-w-md p-5 rounded-3xl bg-[#070B18]/85 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3 font-mono text-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">SECTION 04 // 3D RADAR SPIDER</span>
          </div>
          <p className="text-zinc-300 font-sans text-xs leading-relaxed">
            Interactive 3D Hexagonal Radar Fingerprint radiating across 6 Cartesian spatial axes. Click and drag the 3D model to rotate 360 degrees.
          </p>
          <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Dravya Specimen:</span>
              <span className="text-white font-bold">Haritaki (Terminalia chebula)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Authenticity Score:</span>
              <span className="text-emerald-400 font-bold text-sm">96.4%</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-500">SHA-256 Seal:</span>
              <span className="text-zinc-300">8f4b2a...74bc</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. Bottom VisionOS Floating Control Dock */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex items-center justify-center px-4 pointer-events-auto">
        <div className="p-2 rounded-3xl bg-[#070B1A]/85 backdrop-blur-2xl border border-white/15 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex items-center gap-2 flex-wrap">
          {/* Autonomous Dip & Run */}
          <button
            onClick={triggerAutonomousDipAndRun}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Autonomous Dip & Run</span>
          </button>

          {/* Calibrate 3D Array */}
          <button
            onClick={calibrateArray}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
            <span>Calibrate 3D Array</span>
          </button>

          {/* Lighting Mode Switch */}
          <button
            onClick={() => setLightingMode(lightingMode === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
            title="Toggle Studio Lighting Mode"
          >
            {lightingMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Export 3D Dossier */}
          <Link
            to="/results"
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export 3D Dossier</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

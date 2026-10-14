import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Activity, ShieldCheck, User, Sparkles, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROUTE_TITLES = {
  '/': 'Control Center Dashboard',
  '/dashboard': 'Control Center Dashboard',
  '/new-analysis': 'Guided 3-Step Analysis Laboratory Station',
  '/live-sensors': 'Live Oscilloscope & Sensor Array Stream',
  '/results': 'Scientific Dossier & Dravya Fingerprint',
  '/history': 'Sample History & Audit Ledger',
  '/analytics': 'Sensory Chemometrics & PCA Analytics',
  '/model-insights': 'Random Forest Architecture & Feature Weights',
  '/system-status': 'System Diagnostics & Electrode Maintenance',
  '/about': 'About E-Tongue Dravya Project',
  '/agent': 'Dravya Autonomous AI Copilot',
  '/ai-agent': 'Dravya Autonomous AI Copilot',
};

export default function TopNavbar({ onMenuClick, onOpenCommandPalette }) {
  const location = useLocation();
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const title = ROUTE_TITLES[location.pathname] || 'E-Tongue Analytical Instrumentation';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 select-none text-slate-800">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-mono hidden sm:flex items-center gap-2">
            <span className="text-teal-700 font-bold">IIT Delhi Research Co-Lab</span>
            <span>•</span>
            <span className="text-slate-600">SIH 2025 National Finals</span>
          </p>
        </div>
      </div>

      {/* Right Telemetry */}
      <div className="flex items-center gap-3 text-xs font-mono">
        {/* Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono shadow-2xs transition-all cursor-pointer group"
          title="Open Command Palette (Cmd + K)"
        >
          <Command className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline font-medium text-slate-800">Command</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-500 font-bold border border-slate-200 shadow-2xs">⌘K</kbd>
        </button>

        {/* Sensor status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>6/6 Lipid Sensors</span>
        </div>

        {/* Connection Dot */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[11px]">HARDWARE READY</span>
        </div>

        {/* Real-time Clock */}
        <div className="hidden lg:block tabular-nums text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px]">
          {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
          {time.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
            TG
          </div>
          <div className="hidden xl:block text-left text-[11px] leading-tight">
            <span className="font-bold text-slate-900 block">Tanmay Gupta</span>
            <span className="text-slate-500 text-[10px]">Lead AI Fellow</span>
          </div>
        </div>
      </div>
    </header>
  );
}

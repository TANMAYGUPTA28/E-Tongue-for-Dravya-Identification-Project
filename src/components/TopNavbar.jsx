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
    <header className="h-16 bg-[#0B100D]/90 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 select-none text-[#EDEFE8]">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/[0.05] text-[#8E9B93] hover:text-[#EDEFE8] transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-semibold tracking-tight text-[#EDEFE8] flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-[11px] text-[#8E9B93] font-mono hidden sm:flex items-center gap-2">
            <span className="text-[#10B981] font-medium">IIT Delhi Research Co-Lab</span>
            <span className="text-white/20">•</span>
            <span className="text-[#5A675F]">SIH 2025 National Finals</span>
          </p>
        </div>
      </div>

      {/* Right Telemetry */}
      <div className="flex items-center gap-2.5 text-xs font-mono">
        {/* Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#8E9B93] hover:text-[#EDEFE8] text-xs font-mono transition-all cursor-pointer group"
          title="Open Command Palette (Cmd + K)"
        >
          <Command className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline font-medium">Command</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-[#8E9B93] font-bold border border-white/[0.08]">⌘K</kbd>
        </button>

        {/* Sensor status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8E9B93]">
          <Activity className="w-3.5 h-3.5 text-[#10B981]" />
          <span>6/6 Sensors</span>
        </div>

        {/* Connection Dot */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold text-[11px]">HARDWARE READY</span>
        </div>

        {/* Real-time Clock */}
        <div className="hidden lg:block tabular-nums text-[#8E9B93] bg-white/[0.04] px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-[11px]">
          {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
          {time.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] font-bold flex items-center justify-center text-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'QC'}
          </div>
          <div className="hidden xl:block text-left text-[11px] leading-tight">
            <span className="font-semibold text-[#EDEFE8] block">{user?.name || 'Lab Analyst'}</span>
            <span className="text-[#8E9B93] text-[10px]">{user?.role || 'Lead Chemist'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

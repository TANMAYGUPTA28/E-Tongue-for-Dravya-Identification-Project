import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  Activity,
  Award,
  History,
  BarChart3,
  GitBranch,
  Cpu,
  BookOpen,
  X,
  Disc,
  Leaf,
  Sparkles,
  ShieldCheck,
  Command,
  Compass
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Control Center', icon: LayoutDashboard },
  { path: '/agent', label: 'Dravya AI Agent', icon: Sparkles, badge: 'MCP' },
  { path: '/new-analysis', label: '3-Step Analysis Wizard', icon: FlaskConical, badge: 'GUIDED' },
  { path: '/live-sensors', label: 'Live Oscilloscope', icon: Activity },
  { path: '/results', label: 'Scientific Dossier & Radar', icon: Award, badge: 'PRO' },
  { path: '/history', label: 'Sample Audit History', icon: History },
  { path: '/registry', label: 'Specimen Registry', icon: Leaf },
  { path: '/analytics', label: 'Chemometrics & PCA', icon: BarChart3 },
  { path: '/model-insights', label: 'Random Forest Model', icon: GitBranch },
  { path: '/system-status', label: 'Hardware Diagnostics', icon: Cpu },
  { path: '/about', label: 'Ayurvedic Pharmacopoeia', icon: BookOpen },
];

export default function Sidebar({ isOpen, onClose, onOpenCommandPalette }) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0B100D] border-r border-white/[0.08] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0B100D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center font-bold">
              <Disc className="w-4 h-4 text-[#10B981] animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-[#EDEFE8] block leading-tight">
                  DRAVYA 6000
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 font-bold">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-[#8E9B93] font-mono block -mt-0.5">
                Electronic Tongue Lab
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/[0.05] text-[#8E9B93] hover:text-[#EDEFE8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="p-3 text-[10px] font-mono uppercase tracking-wider text-[#5A675F] font-semibold px-4 pt-4">
          Analytical Instruments
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/25'
                      : 'text-[#8E9B93] hover:text-[#EDEFE8] hover:bg-white/[0.04]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-[#8E9B93] font-medium border border-white/[0.08]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Hardware Diagnostics Pill */}
        <div className="p-3 border-t border-white/[0.08] bg-[#090D0B]">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#EDEFE8] font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>AFE Potentiostat</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#10B981]/15 text-[#10B981] font-bold border border-[#10B981]/30">
                COM3
              </span>
            </div>
            <p className="text-[10px] text-[#8E9B93] font-mono">
              6-Ch SAR ADC • 250 S/s
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

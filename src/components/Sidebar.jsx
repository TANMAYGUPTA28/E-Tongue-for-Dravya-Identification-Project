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
  { path: '/3d', label: '3D Spatial Probe', icon: Compass, badge: '3D WEBGL' },
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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding - Apple Pro Laboratory */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold shadow-2xs">
              <Disc className="w-5 h-5 text-teal-600 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                  DRAVYA PRO
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                  IITD
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block -mt-0.5">
                Electronic Tongue Workstation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Item Links */}
        <div className="p-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-4 pt-4">
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
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Hardware Diagnostics Pill */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AFE Potentiostat</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              IIT Delhi Bio-Instrumentation Lab • 250 S/s
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

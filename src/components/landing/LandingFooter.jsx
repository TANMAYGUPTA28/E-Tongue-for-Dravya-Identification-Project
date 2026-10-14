import { Link } from 'react-router-dom';
import { Compass, GitBranch, Shield, Terminal, ArrowUp } from 'lucide-react';

export default function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#07100B] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3E7B4C] to-[#B6F36A] p-[1.5px]">
                <div className="w-full h-full rounded-full bg-[#07100B] flex items-center justify-center">
                  <span className="font-display italic text-sm text-[#B6F36A] font-bold">d</span>
                </div>
              </div>
              <span className="font-bold text-sm tracking-tight text-[#EDEFE8]">
                DRAVYA PRO
              </span>
            </div>
            <p className="text-xs text-[#8A968E] max-w-sm font-sans leading-relaxed">
              Autonomous Biomimetic Electronic Tongue & Chemical Telemetry Workstation. Bridging classical Ayurvedic Pharmacopoeia with edge electrochemical machine learning.
            </p>
            <div className="font-mono text-[11px] text-[#4F5B53]">
              IIT Delhi Bio-Instrumentation • SIH 2025
            </div>
          </div>

          {/* Links 1: Platform */}
          <div className="space-y-3 font-mono text-xs">
            <span className="font-bold text-[#EDEFE8] block uppercase">Platform</span>
            <ul className="space-y-2 text-[#8A968E]">
              <li><Link to="/3d" className="hover:text-[#B6F36A] transition-colors">3D Spatial Lab</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#B6F36A] transition-colors">Control Center</Link></li>
              <li><Link to="/new-analysis" className="hover:text-[#B6F36A] transition-colors">Guided Wizard</Link></li>
              <li><Link to="/live-sensors" className="hover:text-[#B6F36A] transition-colors">Oscilloscope</Link></li>
              <li><Link to="/results" className="hover:text-[#B6F36A] transition-colors">Dossier Radar</Link></li>
            </ul>
          </div>

          {/* Links 2: Science */}
          <div className="space-y-3 font-mono text-xs">
            <span className="font-bold text-[#EDEFE8] block uppercase">Science</span>
            <ul className="space-y-2 text-[#8A968E]">
              <li><a href="#how-it-works" className="hover:text-[#B6F36A] transition-colors">Electrode Physics</a></li>
              <li><a href="#library" className="hover:text-[#B6F36A] transition-colors">Rasa Cartography</a></li>
              <li><Link to="/model-insights" className="hover:text-[#B6F36A] transition-colors">Random Forest ML</Link></li>
              <li><Link to="/analytics" className="hover:text-[#B6F36A] transition-colors">Chemometrics & PCA</Link></li>
              <li><Link to="/agent" className="hover:text-[#B6F36A] transition-colors">MCP Agent Protocol</Link></li>
            </ul>
          </div>

          {/* Links 3: Hardware & OSS */}
          <div className="space-y-3 font-mono text-xs">
            <span className="font-bold text-[#EDEFE8] block uppercase">Hardware</span>
            <ul className="space-y-2 text-[#8A968E]">
              <li><Link to="/system-status" className="hover:text-[#B6F36A] transition-colors">ESP32 Firmware</Link></li>
              <li><Link to="/api-console" className="hover:text-[#B6F36A] transition-colors">API Diagnostics</Link></li>
              <li><Link to="/history" className="hover:text-[#B6F36A] transition-colors">Atlas Audit Ledger</Link></li>
              <li><button onClick={scrollToTop} className="hover:text-[#B6F36A] transition-colors flex items-center gap-1 cursor-pointer">Back to Top <ArrowUp className="w-3 h-3" /></button></li>
            </ul>
          </div>
        </div>

        {/* Oversized Wordmark that parallax-reveals */}
        <div className="pt-8 select-none text-center">
          <div className="font-display font-extrabold text-[12vw] tracking-tighter text-white/[0.04] leading-none pointer-events-none">
            DRAVYA PRO
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#8A968E]">
          <div>
            © 2026 E-Tongue Dravya Project. MIT Licensed.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Laboratory Archive Connected</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

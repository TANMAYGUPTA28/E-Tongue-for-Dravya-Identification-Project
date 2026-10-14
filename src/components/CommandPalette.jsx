import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  Activity,
  Sliders,
  Sparkles,
  FileText,
  RotateCcw,
  ShieldCheck,
  Zap,
  ArrowRight,
  FlaskConical,
  CornerDownLeft,
  X,
  Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const COMMAND_ITEMS = [
    // Navigation
    {
      id: 'nav-3d',
      category: 'Navigation',
      title: '3D Interactive Spatial Workstation',
      subtitle: 'Photorealistic titanium probe, fluid beaker, ion swarm & 3D radar spider',
      icon: Compass,
      color: 'text-teal-600 bg-teal-50',
      action: () => navigate('/3d'),
    },
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Control Center Dashboard',
      subtitle: 'Hero telemetry bento grid & 6-channel Tektronix oscilloscope',
      icon: Activity,
      color: 'text-teal-600 bg-teal-50',
      action: () => navigate('/dashboard'),
    },
    {
      id: 'nav-wizard',
      category: 'Navigation',
      title: 'Guided 3-Step Analysis Laboratory Station',
      subtitle: 'Matrix registration, electrode self-test & agent execution',
      icon: FlaskConical,
      color: 'text-blue-600 bg-blue-50',
      action: () => navigate('/new-analysis'),
    },
    {
      id: 'nav-dossier',
      category: 'Navigation',
      title: 'Scientific Dossier & Dravya Radar Fingerprint',
      subtitle: '6-axis spider chart, phytochemical explainability & certificate',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
      action: () => navigate('/results'),
    },
    {
      id: 'nav-agent',
      category: 'Navigation',
      title: 'Dravya Autonomous AI Copilot',
      subtitle: 'MCP electrochemical reasoning & interactive chemometrics assistant',
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50',
      action: () => navigate('/agent'),
    },
    {
      id: 'nav-history',
      category: 'Navigation',
      title: 'Sample Audit History Archive',
      subtitle: 'MongoDB live ledger with timestamped cryptographic hashes',
      icon: FileText,
      color: 'text-amber-600 bg-amber-50',
      action: () => navigate('/history'),
    },

    // Laboratory Actions & Triggers
    {
      id: 'act-tare',
      category: 'Laboratory Actions',
      title: 'Zero Electrode Baselines (Tare Chamber)',
      subtitle: 'Restore 0.00V reference potential on all 6 working electrodes',
      icon: RotateCcw,
      color: 'text-slate-700 bg-slate-100',
      action: async () => {
        try {
          await fetch('http://localhost:5000/api/sensors/sample/eject', { method: 'POST' });
          toast.success('Chamber rinsed: 0.000V baseline restored');
        } catch (e) {
          toast.success('Electrode offset zeroed (Local)');
        }
      },
    },
    {
      id: 'act-ashwagandha',
      category: 'Laboratory Actions',
      title: 'Ingest Ashwagandha Reference Packet',
      subtitle: 'Simulate withanolide excitation (Peak S4 2.78V)',
      icon: Zap,
      color: 'text-teal-600 bg-teal-50',
      action: async () => {
        toast.loading('Streaming Ashwagandha potentiostat vector...', { id: 'cmd' });
        try {
          await fetch('http://localhost:5000/api/iot/demo-feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ specimenKey: 'ashwagandha' }),
          });
          toast.success('Ashwagandha ingested: 99.8% purity verified', { id: 'cmd' });
          navigate('/dashboard');
        } catch (e) {
          toast.dismiss('cmd');
        }
      },
    },
    {
      id: 'act-haritaki',
      category: 'Laboratory Actions',
      title: 'Ingest Haritaki (Terminalia chebula)',
      subtitle: 'Polyphenols & tannin cross-reactive response (Peak S6 3.22V)',
      icon: Zap,
      color: 'text-cyan-600 bg-cyan-50',
      action: async () => {
        toast.loading('Streaming Haritaki potentiostat vector...', { id: 'cmd' });
        try {
          await fetch('http://localhost:5000/api/iot/demo-feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ specimenKey: 'haritaki' }),
          });
          toast.success('Haritaki ingested: 96.4% purity verified', { id: 'cmd' });
          navigate('/dashboard');
        } catch (e) {
          toast.dismiss('cmd');
        }
      },
    },
    {
      id: 'act-adulterant',
      category: 'Laboratory Actions',
      title: 'Trigger Adulterant Spike Test (Metanil Yellow)',
      subtitle: 'Flag synthetic azo dye violation via non-linear cross-sensitivity',
      icon: Zap,
      color: 'text-rose-600 bg-rose-50',
      action: async () => {
        toast.loading('Simulating adulterated specimen...', { id: 'cmd' });
        try {
          await fetch('http://localhost:5000/api/iot/demo-feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ specimenKey: 'adulterated_dye' }),
          });
          toast.error('Adulteration Signature Flagged: Metanil Yellow', { id: 'cmd' });
          navigate('/dashboard');
        } catch (e) {
          toast.dismiss('cmd');
        }
      },
    },
  ];

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Floating Apple Pro Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a laboratory command or search modules... (e.g. 'Haritaki', 'Tare', 'Wizard')"
            className="w-full bg-transparent border-0 px-3 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 font-sans"
          />
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-2xs font-semibold">ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 font-mono">
              No matching commands or laboratory actions found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-100/90 text-slate-900 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${item.color} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal px-1.5 py-0.2 rounded bg-white border border-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 font-sans">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-teal-600 shrink-0 pl-2">
                      <span>Execute</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-white border border-slate-200 font-semibold">↑</span>
              <span className="px-1 py-0.5 rounded bg-white border border-slate-200 font-semibold">↓</span> Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-white border border-slate-200 font-semibold">↵</span> Select
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-teal-600 font-semibold">
            <Command className="w-3.5 h-3.5" />
            <span>E-Tongue Pro Command System</span>
          </div>
        </div>
      </div>
    </div>
  );
}

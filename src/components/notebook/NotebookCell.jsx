import { useState } from 'react';
import { Play, CheckCircle2, ChevronDown, ChevronRight, Code2 } from 'lucide-react';

export default function NotebookCell({
  cellIndex,
  title,
  subtitle,
  executionTime = '3.8ms',
  codeSnippet,
  onRun,
  children,
  badge = 'ML-OP',
  active = false,
}) {
  const [showCode, setShowCode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    if (onRun) onRun();
    setTimeout(() => setIsRunning(false), 400);
  };

  return (
    <div className={`notebook-cell overflow-hidden mb-6 ${active ? 'notebook-cell-active' : ''}`}>
      {/* Cell Header / Colab Style */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* Cell Number Prompt like Jupyter/Colab */}
          <div className="font-mono text-xs text-emerald-400/80 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <span className="text-slate-500">[</span>
            <span>In [{cellIndex}]</span>
            <span className="text-slate-500">]</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-100 font-display">
                {title}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {badge}
              </span>
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {codeSnippet && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-[11px] font-mono flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Code2 className="w-3 h-3 text-cyan-400" />
              <span>{showCode ? 'Hide Code' : 'View Code'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{executionTime}</span>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Execute Cell (Shift+Enter)"
          >
            <Play className={`w-3 h-3 fill-emerald-400 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'RUNNING' : 'RUN'}</span>
          </button>
        </div>
      </div>

      {/* Code Snippet Collapsible Block */}
      {showCode && codeSnippet && (
        <div className="bg-[#050811] px-4 py-3 border-b border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre className="text-emerald-400/90 leading-relaxed">{codeSnippet}</pre>
        </div>
      )}

      {/* Output / Interactive Visualization Container */}
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
}

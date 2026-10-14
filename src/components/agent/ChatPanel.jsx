import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight,
  Activity,
  Terminal,
} from 'lucide-react';
import GenerativeRenderer from './GenerativeRenderer';
import { useAgentChatStore } from '../../hooks/useAgentChat';

const SUGGESTED_QUERIES = [
  'Identify current potentiostat vector and check purity',
  'Compare Haritaki vs Adulterated sample radar',
  'Explain peak ΔV on WE4 Phthalocyanine sensor',
  'Retrieve latest daily quality assurance summary',
];

export default function ChatPanel() {
  const {
    messages,
    isStreaming,
    activeTools,
    lastFailedQuery,
    sendQuery,
    retryLastQuery,
    clearHistory
  } = useAgentChatStore();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTools]);

  const handleSendQuery = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isStreaming) return;
    setInputQuery('');
    sendQuery(textToSend);
  };


  return (
    <div className="flex flex-col h-full bg-[#07100B]/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#3E7B4C]/25 border border-[#B6F36A]/40 flex items-center justify-center text-[#B6F36A] shadow-[0_0_15px_rgba(182,243,106,0.2)]">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="font-bold text-[#EDEFE8] block text-sm">DRAVYA AI ORCHESTRATOR</span>
            <span className="text-[10px] text-[#8A968E] block -mt-0.5">SSE /api/v1/agent/chat • Zod Protected</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#8A968E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36A] animate-pulse" />
            <span>LLM Tool Loop Active</span>
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'agent' && (
              <div className="w-7 h-7 rounded-xl bg-[#3E7B4C]/30 border border-[#B6F36A]/30 flex items-center justify-center text-[#B6F36A] shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'items-end text-right' : 'text-left'}`}>
              <div
                className={`p-4 rounded-2xl leading-relaxed font-sans text-xs sm:text-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#B6F36A] text-[#07100B] font-medium rounded-tr-xs'
                    : 'bg-white/[0.04] border border-white/10 text-[#EDEFE8] rounded-tl-xs'
                }`}
              >
                {msg.text.split('\n\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Generative Components (Charts, Cards) */}
              {msg.components && msg.components.map((comp, idx) => (
                <GenerativeRenderer key={idx} componentData={comp} />
              ))}

              <span className="text-[10px] font-mono text-[#4F5B53] block px-1">
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#EDEFE8] shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Active Tool Execution Chips (SSE tool_start / tool_end) */}
        {activeTools.length > 0 && (
          <div className="space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs animate-in fade-in">
            <span className="text-[10px] text-[#8A968E] uppercase tracking-wider block">Agent Tool Activity:</span>
            {activeTools.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-[#E0A03A]" />
                  <span className="text-[#EDEFE8] font-bold">{t.tool}</span>
                  {t.status === 'running' ? (
                    <span className="text-[10px] text-[#8A968E] animate-pulse">Running query...</span>
                  ) : (
                    <span className="text-[10px] text-[#B6F36A]">{t.summary}</span>
                  )}
                </div>
                {t.latency && <span className="text-[#8A968E]">{t.latency}ms</span>}
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Queries */}
      <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
        {SUGGESTED_QUERIES.map((q) => (
          <button
            key={q}
            disabled={isStreaming}
            onClick={() => handleSendQuery(q)}
            className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-[11px] font-mono text-[#8A968E] hover:text-[#EDEFE8] shrink-0 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Error & Retry Banner */}
      {lastFailedQuery && (
        <div className="px-4 py-2 bg-rose-950/40 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-300 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Connection dropped: "{lastFailedQuery}"</span>
          </div>
          <button
            onClick={retryLastQuery}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 border-t border-white/10 bg-[#07100B]/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask agent: e.g. 'Identify sample and verify authenticity'..."
            className="flex-1 px-4 py-3 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#EDEFE8] placeholder:text-[#4F5B53] focus:outline-none focus:border-[#B6F36A]"
          />

          <button
            type="submit"
            disabled={isStreaming || !inputQuery.trim()}
            className="p-3 rounded-full bg-[#B6F36A] hover:bg-[#cbfb88] disabled:opacity-40 text-[#07100B] font-bold transition-all shadow-[0_0_20px_rgba(182,243,106,0.3)] cursor-pointer shrink-0"
            title="Send query to agent"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

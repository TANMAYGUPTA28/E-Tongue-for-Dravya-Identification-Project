import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

export default function KpiCard({
  label,
  value,
  delta,
  deltaType = 'positive', // 'positive' | 'negative' | 'neutral'
  takeaway,
  sparklineData = [35, 42, 38, 55, 62, 58, 72, 85],
  tooltip,
  onClick,
  className = '',
}) {
  const isPositive = deltaType === 'positive';
  const isNegative = deltaType === 'negative';

  // Generate lightweight SVG path from sparklineData
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData) || 1;
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div
      onClick={onClick}
      className={`bg-[#0F1511] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 space-y-3 transition-all duration-200 group ${
        onClick ? 'cursor-pointer hover:bg-[#131A15]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#8E9B93]">
          <span>{label}</span>
          {tooltip && (
            <span title={tooltip} className="cursor-help text-[#5A675F] hover:text-[#8E9B93]">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {delta && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isPositive
                ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25'
                : isNegative
                ? 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/25'
                : 'bg-white/[0.05] text-[#8E9B93] border border-white/[0.08]'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            <span>{delta}</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EDEFE8] tabular-nums">
          {value}
        </div>

        {/* Micro Sparkline */}
        <div className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={isPositive ? '#10B981' : isNegative ? '#F43F5E' : '#8E9B93'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {takeaway && (
        <p className="text-xs text-[#8E9B93] leading-relaxed pt-0.5 border-t border-white/[0.04]">
          {takeaway}
        </p>
      )}
    </div>
  );
}

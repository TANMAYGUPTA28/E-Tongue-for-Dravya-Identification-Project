import React from 'react';

const VARIANTS = {
  success: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  danger: 'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30',
  warning: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  info: 'bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/30',
  neutral: 'bg-white/[0.05] text-[#8E9B93] border-white/[0.1]',
};

const DOT_COLORS = {
  success: 'bg-[#10B981]',
  danger: 'bg-[#F43F5E]',
  warning: 'bg-[#F59E0B]',
  info: 'bg-[#0EA5E9]',
  neutral: 'bg-[#8E9B93]',
};

export default function Badge({
  children,
  variant = 'neutral',
  dot = true,
  className = '',
}) {
  const badgeClasses = VARIANTS[variant] || VARIANTS.neutral;
  const dotColor = DOT_COLORS[variant] || DOT_COLORS.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${badgeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
}

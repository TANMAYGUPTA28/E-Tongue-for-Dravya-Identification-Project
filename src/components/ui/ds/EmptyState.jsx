import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active data items matching your current filters.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`py-12 px-6 text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#8E9B93]">
        <Icon className="w-6 h-6 text-[#8E9B93]" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[#EDEFE8]">{title}</h4>
        <p className="text-xs text-[#8E9B93] leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 lab-btn-secondary text-xs flex items-center gap-1.5"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to load data',
  message = 'A temporary network or server error occurred. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`p-6 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#EDEFE8] flex items-center justify-between flex-wrap gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F43F5E]/20 flex items-center justify-center text-[#F43F5E] shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#EDEFE8]">{title}</h4>
          <p className="text-xs text-[#8E9B93] mt-0.5">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-lg bg-[#F43F5E] text-white hover:bg-[#E11D48] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

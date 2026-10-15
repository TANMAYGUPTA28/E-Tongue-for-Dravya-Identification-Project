import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-xl',
}) {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen ${width} bg-[#0F1511] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250`}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-base font-bold text-[#EDEFE8] tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-[#8E9B93] mt-0.5 font-mono">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#8E9B93] hover:text-[#EDEFE8] transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {children}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#0A0E0C] flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="lab-btn-secondary text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

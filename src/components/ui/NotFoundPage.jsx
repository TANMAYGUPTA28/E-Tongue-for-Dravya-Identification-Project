import { Link } from 'react-router-dom';
import { Compass, Home, PlusCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-[#EDEFE8]">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#0B100D] border border-white/[0.08] text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] mx-auto flex items-center justify-center text-[#10B981]">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#8E9B93]">
            STATUS 404 • UNKNOWN ROUTE
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEFE8] pt-2">
            Instrument View Not Found
          </h1>
          <p className="text-sm text-[#8E9B93] leading-relaxed">
            The requested assay or instrument page does not exist in this workstation session.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0B100D] font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Workstation Dashboard</span>
          </Link>
          <Link
            to="/new-analysis"
            className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#EDEFE8] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#8E9B93]" />
            <span>New Assay</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

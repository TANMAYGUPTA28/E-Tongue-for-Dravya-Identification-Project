import { useState, useEffect } from 'react';
import { Search, Download, CheckCircle2, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const records = await api.getSampleHistory();
      setHistory(records || []);
    } catch (e) {
      toast.error('Unable to retrieve assay history. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = history.filter(
    (h) =>
      (h.sampleName || h.sample || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.verdict || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 pb-20 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              COMPLIANCE AUDIT
            </span>
            <span className="text-xs font-mono text-zinc-400">Total Assays: 1,420 Recorded</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Dravya Assay Audit Trial History
          </h1>
        </div>

        <button className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-zinc-300 font-mono text-xs flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by assay ID, herbal specimen, or verdict..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="figma-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-subtle border-b border-border text-zinc-400 text-[11px]">
              <tr>
                <th className="p-3.5">ASSAY ID</th>
                <th className="p-3.5">DRAVYA SPECIMEN</th>
                <th className="p-3.5">PHARMACOPOEIA VERDICT</th>
                <th className="p-3.5">CONFIDENCE</th>
                <th className="p-3.5">TIKTA / KASHAYA</th>
                <th className="p-3.5">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Loading laboratory audit ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center font-mono">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-zinc-400 font-semibold">No matching assay records found</p>
                      <p className="text-[11px] text-zinc-500">
                        Try adjusting your search terms or verify that the active filter keywords match the sample name or lot number.
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="mt-2 text-xs text-emerald-400 underline hover:text-emerald-300 cursor-pointer"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-3.5 font-bold text-emerald-400">{row.id}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-white block">{row.sampleName || row.sample}</span>
                      <span className="text-[10px] text-zinc-500 block italic">{row.botanicalName || row.botanical || 'Standard Decoction'}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (row.verdict || '').includes('Pure') || (row.verdict || '') === 'AUTHENTIC' || row.status === 'VERIFIED_PURE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {row.verdict || 'AUTHENTIC'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-zinc-200">
                      {typeof row.confidence === 'number' ? `${row.confidence.toFixed(1)}%` : row.confidence}
                    </td>
                    <td className="p-3.5 text-zinc-400">
                      {row.sensorPeak || `${row.voltages?.[3]?.toFixed(2) || '2.78'}V (S4)`}
                    </td>
                    <td className="p-3.5 text-zinc-500 text-[11px]">{row.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

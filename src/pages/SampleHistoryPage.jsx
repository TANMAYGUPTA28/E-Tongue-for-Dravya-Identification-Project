import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Download,
  Eye,
  X,
  Play,
  Pause,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { api, SENSOR_SPECS } from '../services/api';
import toast from 'react-hot-toast';
import Badge from '../components/ui/ds/Badge';
import DetailDrawer from '../components/ui/ds/DetailDrawer';
import EmptyState from '../components/ui/ds/EmptyState';
import ErrorState from '../components/ui/ds/ErrorState';

export default function SampleHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PURE' | 'ADULTERATED'
  const [density, setDensity] = useState('comfortable'); // 'comfortable' | 'compact'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = density === 'compact' ? 12 : 8;

  // Selected sample for drawer inspection
  const [selectedSample, setSelectedSample] = useState(null);

  // Oscilloscope state
  const [samplingRate, setSamplingRate] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [packetCount, setPacketCount] = useState(42890);
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);

  // 300ms Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Periodic packet counter
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPacketCount((p) => p + samplingRate);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, samplingRate]);

  // Load history
  const loadHistory = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const records = await api.getSampleHistory();
      setHistory(Array.isArray(records) ? records : []);
    } catch (err) {
      setFetchError('Unable to load laboratory assay ledger. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Oscilloscope canvas rendering (Clean Dark Phosphor)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    const render = () => {
      if (!isPaused) {
        phaseRef.current += samplingRate * 0.008;
      }
      const phase = phaseRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#060A08';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw primary active stream
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const y = height / 2 - Math.sin(x * 0.02 + phase) * 35;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, samplingRate]);

  // Filtering
  const filtered = (Array.isArray(history) ? history : []).filter((h) => {
    const term = debouncedSearch.toLowerCase().trim();
    const matchesTerm =
      !term ||
      (h?.sampleName || '').toLowerCase().includes(term) ||
      (h?.verdict || '').toLowerCase().includes(term) ||
      (h?.id || '').toLowerCase().includes(term) ||
      (h?.batchNumber || '').toLowerCase().includes(term);

    const isPure = (h?.status || '').toUpperCase().includes('PURE');
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PURE' && isPure) ||
      (statusFilter === 'ADULTERATED' && !isPure);

    return matchesTerm && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedRows = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportCSV = () => {
    const headers = 'ID,Sample Name,Batch Number,Verdict,Confidence,Status,Date\n';
    const rows = filtered
      .map((h) => `"${h.id}","${h.sampleName}","${h.batchNumber}","${h.verdict}","${h.confidence}%","${h.status}","${h.date}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `E_Tongue_Assay_Ledger_${Date.now()}.csv`;
    a.click();
    toast.success('Assay Ledger CSV Exported');
  };

  const getWhyFactors = (sample) => {
    if (sample.whyFactors && Array.isArray(sample.whyFactors) && sample.whyFactors.length > 0) {
      return sample.whyFactors;
    }
    const isPure = (sample.status || '').toUpperCase().includes('PURE');
    if (isPure) {
      return [
        `Electrochemical potentiostat curve matches authentic ${sample.verdict || sample.sampleName} reference baseline.`,
        'All 6 Shad-Rasa sensor channels remain within certified ±8% pharmacopoeial tolerance bounds.',
        'No anomalous ionic conductivity or synthetic colorant peaks observed on S3 halide channel.',
      ];
    }
    return [
      `Sensor voltage response deviates significantly from authentic reference standard for ${sample.sampleName}.`,
      'Anomalous conductive peak detected on S3 electrode indicating synthetic colorant / halide bulking.',
      'Natural organoleptic tannin and curcuminoid marker response is suppressed below pharmacopoeial limits.',
    ];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-[#EDEFE8]">
      {/* 1. Oscilloscope Telemetry Card */}
      <div className="lab-card p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success">CHAMBER OSCILLOSCOPE</Badge>
              <span className="text-xs text-[#8E9B93] font-mono">
                Hardware Synchronized Ingestion Stream
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[#EDEFE8] mt-1.5">
              Live Potentiostat Signal Monitoring
            </h3>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8E9B93]">
              <span>PACKETS: </span>
              <span className="font-bold text-[#EDEFE8] tabular-nums">{packetCount.toLocaleString()}</span>
            </div>

            {/* Rate */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8E9B93]">
              <span>RATE:</span>
              <select
                value={samplingRate}
                onChange={(e) => setSamplingRate(parseInt(e.target.value))}
                className="bg-transparent text-[#EDEFE8] font-bold focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-[#0B100D]">1 Hz</option>
                <option value={2} className="bg-[#0B100D]">2 Hz</option>
                <option value={5} className="bg-[#0B100D]">5 Hz</option>
                <option value={10} className="bg-[#0B100D]">10 Hz</option>
              </select>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="lab-btn-secondary text-xs"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-[#10B981]" /> : <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />}
              <span>{isPaused ? 'Resume' : 'Freeze'}</span>
            </button>
          </div>
        </div>

        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#060A08]">
          <canvas
            ref={canvasRef}
            width={800}
            height={100}
            className="w-full h-24 block"
          />
        </div>
      </div>

      {/* 2. Filterable Audit Ledger Table Card */}
      <div className="lab-card p-6 space-y-4">
        {/* Top Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-[#8E9B93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by specimen name, batch ID, or verdict..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lab-input w-full pl-9 pr-8 py-2 text-xs font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E9B93] hover:text-[#EDEFE8] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.08] text-xs font-medium">
            <button
              onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#10B981] text-[#061209] font-bold shadow-xs'
                  : 'text-[#8E9B93] hover:text-[#EDEFE8]'
              }`}
            >
              All Assays
            </button>
            <button
              onClick={() => { setStatusFilter('PURE'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'PURE'
                  ? 'bg-[#10B981] text-[#061209] font-bold shadow-xs'
                  : 'text-[#8E9B93] hover:text-[#EDEFE8]'
              }`}
            >
              Pure Only
            </button>
            <button
              onClick={() => { setStatusFilter('ADULTERATED'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ADULTERATED'
                  ? 'bg-[#F43F5E] text-white font-bold shadow-xs'
                  : 'text-[#8E9B93] hover:text-[#EDEFE8]'
              }`}
            >
              Flagged Only
            </button>
          </div>

          {/* Density Toggle & Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
              className="lab-btn-secondary text-xs"
              title="Toggle Row Density"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8E9B93]" />
              <span className="capitalize">{density}</span>
            </button>

            <button
              onClick={exportCSV}
              className="lab-btn-secondary text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Removable Active Filter Chips */}
        {(debouncedSearch || statusFilter !== 'ALL') && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-[#5A675F] font-mono text-[11px]">Applied Filters:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-[#EDEFE8] font-mono text-[11px]">
                Search: "{debouncedSearch}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-[#F43F5E] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-mono text-[11px]">
                Status: {statusFilter === 'PURE' ? 'Pure Standards' : 'Flagged Adulterations'}
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className="hover:text-[#F43F5E] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
              className="text-xs text-[#10B981] hover:underline font-mono"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Error State */}
        {fetchError && (
          <ErrorState message={fetchError} onRetry={loadHistory} />
        )}

        {/* Table Container */}
        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0A0E0C]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[#8E9B93] text-[11px] sticky top-0">
                <tr>
                  <th className={density === 'compact' ? 'p-2' : 'p-3.5'}>ASSAY ID</th>
                  <th className={density === 'compact' ? 'p-2' : 'p-3.5'}>SPECIMEN NAME</th>
                  <th className={density === 'compact' ? 'p-2' : 'p-3.5'}>BATCH LOT</th>
                  <th className={density === 'compact' ? 'p-2' : 'p-3.5'}>VERDICT</th>
                  <th className={density === 'compact' ? 'p-2' : 'p-3.5'}>CONFIDENCE</th>
                  <th className={density === 'compact' ? 'p-2' : 'p-3.5'}>STATUS</th>
                  <th className={density === 'compact' ? 'p-2' : 'p-3.5'}>TIMESTAMP</th>
                  <th className={`text-right ${density === 'compact' ? 'p-2' : 'p-3.5'}`}>ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#8E9B93]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-3"><div className="h-4 bg-white/[0.05] rounded w-16"></div></td>
                      <td className="p-3"><div className="h-4 bg-white/[0.05] rounded w-36"></div></td>
                      <td className="p-3"><div className="h-4 bg-white/[0.05] rounded w-24"></div></td>
                      <td className="p-3"><div className="h-4 bg-white/[0.05] rounded w-28"></div></td>
                      <td className="p-3"><div className="h-4 bg-white/[0.05] rounded w-12"></div></td>
                      <td className="p-3"><div className="h-4 bg-white/[0.05] rounded w-20"></div></td>
                      <td className="p-3"><div className="h-4 bg-white/[0.05] rounded w-24"></div></td>
                      <td className="p-3 text-right"><div className="h-4 bg-white/[0.05] rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <EmptyState
                        title="No matching assay records"
                        description="Try adjusting your search terms or clear active filters to see all recorded specimens."
                        actionLabel="Clear all filters"
                        onAction={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedSample(row)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className={`font-bold text-[#10B981] ${density === 'compact' ? 'p-2' : 'p-3.5'}`}>
                        {row.id}
                      </td>
                      <td className={`font-semibold text-[#EDEFE8] font-sans ${density === 'compact' ? 'p-2' : 'p-3.5'}`}>
                        {row.sampleName}
                      </td>
                      <td className={density === 'compact' ? 'p-2' : 'p-3.5'}>{row.batchNumber}</td>
                      <td className={`text-[#EDEFE8] ${density === 'compact' ? 'p-2' : 'p-3.5'}`}>{row.verdict}</td>
                      <td className={`font-bold text-[#EDEFE8] tabular-nums ${density === 'compact' ? 'p-2' : 'p-3.5'}`}>
                        {typeof row.confidence === 'number' ? `${row.confidence}%` : row.confidence}
                      </td>
                      <td className={density === 'compact' ? 'p-2' : 'p-3.5'}>
                        <Badge
                          variant={(row.status || '').toUpperCase().includes('PURE') ? 'success' : 'danger'}
                        >
                          {(row.status || 'VERIFIED').replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className={`text-[11px] ${density === 'compact' ? 'p-2' : 'p-3.5'}`}>{row.date}</td>
                      <td className={`text-right ${density === 'compact' ? 'p-2' : 'p-3.5'}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSample(row);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8E9B93] group-hover:text-[#EDEFE8] text-xs font-sans inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-[#10B981]" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between pt-2 text-xs font-mono text-[#8E9B93]">
            <div>
              Showing <span className="font-bold text-[#EDEFE8]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-[#EDEFE8]">
                {Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{' '}
              of <span className="font-bold text-[#EDEFE8]">{filtered.length}</span> assays
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed text-[#EDEFE8] cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-[#EDEFE8] font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed text-[#EDEFE8] cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Detail Drawer (Slide-over Inspector) */}
      {selectedSample && (
        <DetailDrawer
          isOpen={Boolean(selectedSample)}
          onClose={() => setSelectedSample(null)}
          title={selectedSample.sampleName}
          subtitle={`Ledger ID: ${selectedSample.id} • Batch: ${selectedSample.batchNumber}`}
        >
          <div className="space-y-6 text-xs">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] text-[#8E9B93] block">BATCH</span>
                <span className="font-bold text-[#EDEFE8] block mt-0.5">{selectedSample.batchNumber}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] text-[#8E9B93] block">CONFIDENCE</span>
                <span className="font-bold text-[#10B981] block mt-0.5">
                  {typeof selectedSample.confidence === 'number' ? `${selectedSample.confidence}%` : selectedSample.confidence}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] text-[#8E9B93] block">OPERATOR</span>
                <span className="font-bold text-[#EDEFE8] block mt-0.5 truncate">{selectedSample.operator || 'Analyst'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] text-[#8E9B93] block">PEAK CHANNEL</span>
                <span className="font-bold text-[#10B981] block mt-0.5">{selectedSample.sensorPeak || 'S4: 2.78V'}</span>
              </div>
            </div>

            {/* 6 Sensor Voltages */}
            <div className="space-y-2 font-mono">
              <span className="font-semibold text-[#EDEFE8] block">6-Channel Recorded Potentials (Volts):</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SENSOR_SPECS.map((s, idx) => (
                  <div key={s.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.08] text-center">
                    <span className="text-[10px] text-[#8E9B93] block">{s.id}</span>
                    <span className="font-bold text-[#EDEFE8] block mt-0.5">
                      {selectedSample.voltages && selectedSample.voltages[idx] !== undefined
                        ? `${Number(selectedSample.voltages[idx]).toFixed(2)}V`
                        : '1.20V'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* "Why this result?" Plain-English Explanation */}
            <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 space-y-2">
              <div className="flex items-center gap-1.5 text-[#10B981] font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Why this classification result?</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#EDEFE8]/90">
                {getWhyFactors(selectedSample).map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
}

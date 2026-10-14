import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Download,
  Filter,
  Eye,
  X,
  Play,
  Pause,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText
} from 'lucide-react';
import { api, SENSOR_SPECS } from '../services/api';
import toast from 'react-hot-toast';

export default function SampleHistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSample, setSelectedSample] = useState(null);

  // Real-time oscilloscope feed parameters
  const [samplingRate, setSamplingRate] = useState(5); // 1Hz to 10Hz
  const [isPaused, setIsPaused] = useState(false);
  const [packetCount, setPacketCount] = useState(42890);
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);

  // Periodic packet counter simulation
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPacketCount((p) => p + samplingRate);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, samplingRate]);

  useEffect(() => {
    api.getSampleHistory().then(setHistory);
  }, []);

  // Oscilloscope canvas rendering (pure visual 60fps)
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

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#F1F5F9';
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
      ctx.strokeStyle = '#0D9488';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const y = height / 2 - Math.sin((x * 0.02) + phase) * 35 - (Math.random() - 0.5) * 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, samplingRate]);

  const filtered = (Array.isArray(history) ? history : []).filter(
    (h) =>
      (h?.sampleName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h?.verdict || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h?.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h?.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = 'ID,Sample Name,Batch Number,Verdict,Confidence,Status,Date\n';
    const rows = history
      .map((h) => `"${h.id}","${h.sampleName}","${h.batchNumber}","${h.verdict}","${h.confidence}%","${h.status}","${h.date}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `E_Tongue_Sample_History_${Date.now()}.csv`;
    a.click();
    toast.success('Sample History CSV Exported');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* 1. Real-Time Oscilloscope Feed & Packet Counter */}
      <div className="lab-card p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 font-sans">
              Real-Time Oscilloscope Telemetry Feed & Monitoring
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Live continuous acquisition buffer with hardware packet synchronization
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">PACKETS:</span>
              <span className="font-bold text-slate-800 tabular-nums">{packetCount.toLocaleString()}</span>
            </div>

            {/* Sampling Rate Selector (1Hz - 10Hz) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">RATE:</span>
              <select
                value={samplingRate}
                onChange={(e) => setSamplingRate(parseInt(e.target.value))}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value={1}>1 Hz</option>
                <option value={2}>2 Hz</option>
                <option value={5}>5 Hz</option>
                <option value={10}>10 Hz</option>
              </select>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1"
            >
              {isPaused ? <Play className="w-3 h-3 text-emerald" /> : <Pause className="w-3 h-3 text-amber" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={800}
            height={110}
            className="w-full h-24 block"
          />
        </div>
      </div>

      {/* 2. Filterable, Searchable Data Table */}
      <div className="lab-card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sample name, batch ID, or verdict..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal"
            />
          </div>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-mono text-xs flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                <tr>
                  <th className="p-3">SAMPLE ID</th>
                  <th className="p-3">SPECIMEN NAME</th>
                  <th className="p-3">BATCH NUMBER</th>
                  <th className="p-3">VERDICT</th>
                  <th className="p-3">CONFIDENCE</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-teal">{row.id}</td>
                    <td className="p-3 font-semibold text-slate-900 font-sans">{row.sampleName}</td>
                    <td className="p-3 text-slate-500">{row.batchNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{row.verdict}</td>
                    <td className="p-3 font-bold text-slate-900">{row.confidence}%</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status.includes('PURE')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{row.date}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedSample(row)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Individual Sample Inspection Modal */}
      {selectedSample && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 shadow-xl animate-view-fade max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-dark border border-teal-200 font-bold">
                    SPECIMEN INSPECTION
                  </span>
                  <span className="text-xs font-mono text-slate-500">ID: {selectedSample.id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedSample.sampleName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSample(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block">BATCH</span>
                <span className="font-bold text-slate-800">{selectedSample.batchNumber}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block">CONFIDENCE</span>
                <span className="font-bold text-emerald">{selectedSample.confidence}%</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block">OPERATOR</span>
                <span className="font-bold text-slate-800">{selectedSample.operator}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block">PEAK CHANNEL</span>
                <span className="font-bold text-teal">{selectedSample.sensorPeak}</span>
              </div>
            </div>

            {/* 6 Sensor Voltages */}
            <div className="space-y-2 font-mono text-xs">
              <span className="font-semibold text-slate-700 block">6-Channel Recorded Potentials:</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SENSOR_SPECS.map((s, idx) => (
                  <div key={s.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">{s.id} ({s.name.split(' ')[0]})</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {selectedSample.voltages ? selectedSample.voltages[idx] : 1.2}V
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSample(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

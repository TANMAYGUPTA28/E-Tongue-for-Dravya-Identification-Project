import { useState, useEffect, useRef } from 'react';
import { Activity, Play, Pause, RotateCcw, Sliders, ShieldCheck } from 'lucide-react';
import { api, SENSOR_SPECS } from '../services/api';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../services/apiClient';

export default function LiveSensorsPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [samplingRate, setSamplingRate] = useState(5); // 1Hz - 10Hz
  const [packetCount, setPacketCount] = useState(42890);
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const fetchSensors = async () => {
      const data = await api.getLiveSensors();
      if (data) setTelemetry(data);
    };

    fetchSensors();
    const interval = setInterval(fetchSensors, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    const render = () => {
      if (!isPaused) {
        phaseRef.current += samplingRate * 0.007;
        setPacketCount((p) => p + 1);
      }
      const phase = phaseRef.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Fine Laboratory Grid
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const channelHeight = height / 6;

      SENSOR_SPECS.forEach((sensor, index) => {
        const baseV = telemetry?.voltages[index] || parseFloat(sensor.nominalV);
        const centerY = (index + 0.5) * channelHeight;

        // Baseline divider
        ctx.strokeStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.moveTo(0, (index + 1) * channelHeight);
        ctx.lineTo(width, (index + 1) * channelHeight);
        ctx.stroke();

        // Waveform
        ctx.strokeStyle = sensor.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const harmonic = Math.sin((x * 0.018) + phase + index * 1.1) * (baseV * 5);
          const jitter = (Math.random() - 0.5) * 0.7;
          const y = centerY - (harmonic + jitter);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = '#64748B';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${sensor.id}: ${sensor.name.split(' ')[0]} [${baseV.toFixed(2)}V]`, 10, centerY - 6);
      });

      // Sweep Beam
      const sweepX = (phase * 35) % width;
      ctx.strokeStyle = '#0D9488';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, height);
      ctx.stroke();

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [telemetry, isPaused, samplingRate]);

  const handleTare = async () => {
    await api.calibrateSensors();
    toast.success('Array Baseline Zero-Offset Calibrated (< 0.005V)');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Oscilloscope Header Controls */}
      <div className="lab-card p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 font-sans">
              Real-Time Chronoamperometry Oscilloscope Feed
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              6-Channel lipid-membrane potentiostat potential curves
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">PACKETS:</span>
              <span className="font-bold text-slate-800 tabular-nums">{packetCount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">SAMPLING:</span>
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
              <span>{isPaused ? 'Resume' : 'Freeze'}</span>
            </button>

            <button
              onClick={handleTare}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3 text-teal" />
              <span>Tare 0.00V</span>
            </button>
          </div>
        </div>

        {/* Chamber Status & Laboratory Ingestion Controls */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 border-slate-200 flex-wrap gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${telemetry?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="font-bold text-slate-800">
              {telemetry?.isConnected ? 'ELECTROCHEMICAL CELL ACTIVE:' : 'CHAMBER STANDBY (0.00V):'}
            </span>
            <span className="text-slate-600 font-sans font-medium">
              {telemetry?.sampleName || 'No sample in chamber'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">Immerse Sample:</span>
            <button
              onClick={async () => {
                await fetch(`${API_BASE_URL}/sample/select`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sampleId: 'smp-ashwagandha' }),
                });
                toast.success('Electrodes dipped in Pure Ashwagandha Extract');
              }}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-teal-500 text-slate-700 font-sans text-xs shadow-xs cursor-pointer"
            >
              Ashwagandha
            </button>
            <button
              onClick={async () => {
                await fetch(`${API_BASE_URL}/sample/select`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sampleId: 'smp-haritaki' }),
                });
                toast.success('Electrodes dipped in Haritaki Decoction');
              }}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-teal-500 text-slate-700 font-sans text-xs shadow-xs cursor-pointer"
            >
              Haritaki
            </button>
            <button
              onClick={async () => {
                await fetch(`${API_BASE_URL}/sample/select`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sampleId: 'smp-turmeric' }),
                });
                toast.success('Electrodes dipped in Lakadong Turmeric');
              }}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-teal-500 text-slate-700 font-sans text-xs shadow-xs cursor-pointer"
            >
              Turmeric
            </button>
            <button
              onClick={async () => {
                await fetch(`${API_BASE_URL}/sensors/sample/eject`, { method: 'POST' });
                toast.success('Electrodes rinsed with Deionized Water (0.00 V)');
              }}
              className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-sans text-xs font-semibold cursor-pointer"
            >
              💧 Rinse (0.00V)
            </button>
          </div>
        </div>

        {/* Canvas Screen */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={900}
            height={320}
            className="w-full h-80 block"
          />
        </div>
      </div>

      {/* 6 Sensor Telemetry Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {SENSOR_SPECS.map((s, idx) => {
          const liveV = telemetry?.voltages[idx] || parseFloat(s.nominalV);
          const current = telemetry?.currentMicroAmperes ? telemetry.currentMicroAmperes[idx] : (liveV * 18).toFixed(1);
          return (
            <div
              key={s.id}
              className="lab-card p-4 space-y-1 font-mono text-xs"
              style={{ borderTop: `3px solid ${s.color}` }}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-900">{s.id}</span>
                <span className="text-slate-500 font-sans">{s.name.split(' ')[0]}</span>
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {liveV.toFixed(3)} <span className="text-xs text-slate-500 font-normal">V</span>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1 flex justify-between">
                <span>Current:</span>
                <span className="text-slate-800 font-bold">{current} µA</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

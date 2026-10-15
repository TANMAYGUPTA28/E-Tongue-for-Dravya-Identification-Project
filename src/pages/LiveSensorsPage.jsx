import { useState, useEffect, useRef } from 'react';
import { Activity, Play, Pause, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api, SENSOR_SPECS } from '../services/api';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../services/apiClient';
import Badge from '../components/ui/ds/Badge';

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

      // Dark Precision Phosphor Canvas
      ctx.fillStyle = '#060A08';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.06)';
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        ctx.moveTo(0, (index + 1) * channelHeight);
        ctx.lineTo(width, (index + 1) * channelHeight);
        ctx.stroke();

        // Waveform
        ctx.strokeStyle = sensor.color;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = sensor.color;
        ctx.shadowBlur = baseV > 0.05 ? 6 : 0;
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const harmonic = Math.sin(x * 0.018 + phase + index * 1.1) * (baseV * 5);
          const y = centerY - harmonic;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Channel Label
        ctx.fillStyle = sensor.color;
        ctx.font = '10px monospace';
        ctx.fillText(`${sensor.id}: ${sensor.name.split(' ')[0]} [${baseV.toFixed(2)}V]`, 10, centerY - 6);
      });

      // Sweep Line
      const sweepX = (phase * 35) % width;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-[#EDEFE8]">
      {/* Header & Controls */}
      <div className="lab-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success">AFE OSCILLOSCOPE</Badge>
              <span className="text-xs text-[#8E9B93] font-mono">
                6-Channel Lipid-Membrane Potentiostat Transient Curves
              </span>
            </div>
            <h2 className="text-base font-bold text-[#EDEFE8] mt-1.5">
              Live Sensor Array Chronoamperometry Stream
            </h2>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8E9B93]">
              <span>PACKETS: </span>
              <span className="font-bold text-[#EDEFE8] tabular-nums">{packetCount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8E9B93]">
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

            <button
              onClick={handleTare}
              className="lab-btn-secondary text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Tare (0.00V)</span>
            </button>
          </div>
        </div>

        {/* Chamber Status Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex-wrap gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${telemetry?.isConnected ? 'bg-[#10B981] animate-pulse' : 'bg-[#5A675F]'}`} />
            <span className="font-bold text-[#EDEFE8]">
              {telemetry?.isConnected ? 'CELL ACTIVE:' : 'CHAMBER STANDBY (0.00V):'}
            </span>
            <span className="text-[#8E9B93] font-sans font-medium">
              {telemetry?.sampleName || 'No sample in chamber'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#5A675F] mr-1">Immerse Sample:</span>
            {[
              { id: 'smp-ashwagandha', name: 'Ashwagandha' },
              { id: 'smp-haritaki', name: 'Haritaki' },
              { id: 'smp-turmeric', name: 'Turmeric' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={async () => {
                  await fetch(`${API_BASE_URL}/sample/select`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sampleId: s.id }),
                  });
                  toast.success(`Electrodes dipped in ${s.name}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#EDEFE8] font-sans text-xs transition-colors cursor-pointer"
              >
                {s.name}
              </button>
            ))}
            <button
              onClick={async () => {
                await fetch(`${API_BASE_URL}/sensors/sample/eject`, { method: 'POST' });
                toast.success('Chamber rinsed with Deionized Water (0.00V)');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-[#EDEFE8] font-sans text-xs font-semibold cursor-pointer"
            >
              💧 Rinse (0.00V)
            </button>
          </div>
        </div>

        {/* Oscilloscope Canvas */}
        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#060A08]">
          <canvas
            ref={canvasRef}
            width={900}
            height={260}
            className="w-full h-64 sm:h-72 block"
          />
        </div>
      </div>

      {/* 6 Sensor Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SENSOR_SPECS.map((s, idx) => {
          const liveV = telemetry?.voltages[idx] || 0.0;
          return (
            <div
              key={s.id}
              className="lab-card p-5 space-y-3"
              style={{ borderTop: `2px solid ${s.color}` }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#EDEFE8] font-mono">{s.id}: {s.name}</span>
                <Badge variant="neutral">{s.rasa}</Badge>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold font-mono text-[#EDEFE8] tabular-nums">
                  {liveV.toFixed(3)}V
                </div>
                <span className="text-xs font-mono text-[#8E9B93]">
                  Nominal: {s.nominalV}
                </span>
              </div>

              <p className="text-xs text-[#8E9B93] leading-relaxed pt-1 border-t border-white/[0.04]">
                Target: {s.target}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

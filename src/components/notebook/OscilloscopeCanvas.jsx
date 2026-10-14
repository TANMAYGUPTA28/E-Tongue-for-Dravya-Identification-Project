import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Sliders, Crosshair } from 'lucide-react';
import { SHAD_RASA_SENSORS } from '../../services/randomForestEngine';

export default function OscilloscopeCanvas({ activeFeatures, onSensorUpdate }) {
  const canvasRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [liveReadings, setLiveReadings] = useState([0.8, 0.4, 0.6, 3.8, 1.2, 3.2]);
  const [noiseLevel, setNoiseLevel] = useState(0.08);
  const [hoverCursor, setHoverCursor] = useState(null);
  const animationFrameId = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (activeFeatures && activeFeatures.length === 6) {
      setLiveReadings([...activeFeatures]);
    }
  }, [activeFeatures]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!isPaused) {
        phaseRef.current += 0.035;
      }
      const phase = phaseRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Dark Matte Lab Background
      ctx.fillStyle = '#080a10';
      ctx.fillRect(0, 0, width, height);

      // Fine Laboratory Grid lines (50px divisions)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Vertical divisions with tick marks
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // Sub-ticks
        for (let y = 0; y < height; y += 25) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.beginPath();
          ctx.moveTo(x - 2, y);
          ctx.lineTo(x + 2, y);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        }
      }

      // Horizontal channel baseline guides
      const channelHeight = height / 6;

      for (let i = 0; i <= 6; i++) {
        const y = i * channelHeight;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render 6 Sensor Channels
      SHAD_RASA_SENSORS.forEach((sensor, index) => {
        const baseVal = liveReadings[index] || 1.0;
        const centerY = (index + 0.5) * channelHeight;

        ctx.strokeStyle = sensor.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();

        for (let x = 0; x < width; x += 2) {
          // Chronoamperometric decay curve + ionic noise
          const harmonic1 = Math.sin((x * 0.018) + phase + index * 1.2) * (baseVal * 4.2);
          const jitter = (Math.random() - 0.5) * (noiseLevel * 4.5);
          const y = centerY - (harmonic1 + jitter);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Channel Tag on Left (Scientific Notation)
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`CH${index + 1} [${sensor.rasa.slice(0, 3).toUpperCase()}]: ${baseVal.toFixed(2)}V`, 8, centerY - 6);
      });

      // Sweep Beam Cursor (Vertical sweep line)
      const sweepX = (phase * 35) % width;
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, height);
      ctx.stroke();

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPaused, noiseLevel, liveReadings]);

  const tareBaseline = () => {
    const tared = [0.05, 0.05, 0.05, 0.05, 0.05, 0.05];
    setLiveReadings(tared);
    if (onSensorUpdate) onSensorUpdate(tared);
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Oscilloscope Hardware Ribbon */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-zinc-400 bg-[#0e111a] px-3 py-2 rounded border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs transition-colors"
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            <span>{isPaused ? 'RESUME RUN' : 'FREEZE FRAME'}</span>
          </button>

          <button
            onClick={tareBaseline}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs transition-colors"
            title="Calibrate ground zero"
          >
            <RotateCcw className="w-3 h-3 text-zinc-400" />
            <span>TARE (0.00 V)</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <span>TIMEBASE: <strong className="text-zinc-200">500 ms/div</strong></span>
          <span>RANGE: <strong className="text-zinc-200">0.0V - 5.0V</strong></span>
          <span>FILTER: <strong className="text-emerald-400">BUTTERWORTH 20 Hz</strong></span>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="relative rounded border border-white/[0.08] overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={800}
          height={280}
          className="w-full h-64 sm:h-72 block cursor-crosshair"
        />
      </div>

      {/* 6 Electrode Value Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SHAD_RASA_SENSORS.map((s, idx) => (
          <div
            key={s.id}
            className="p-2 rounded bg-[#0e111a] border border-white/[0.06]"
            style={{ borderTop: `2px solid ${s.color}` }}
          >
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>{s.id}: {s.rasa}</span>
              <span className="text-zinc-500">{s.english.slice(0, 3)}</span>
            </div>
            <div className="text-sm font-bold text-zinc-100 mt-0.5 tabular-nums">
              {(liveReadings[idx] || 0).toFixed(3)} <span className="text-[10px] text-zinc-500">V</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

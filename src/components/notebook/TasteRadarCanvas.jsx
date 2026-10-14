import { useEffect, useRef } from 'react';

const SHAD_RASA_AXES = [
  { label: 'Madhura', sub: 'Sweet', key: 'madhura', angle: -Math.PI / 2, color: '#10b981' },
  { label: 'Amla', sub: 'Sour', key: 'amla', angle: -Math.PI / 6, color: '#f59e0b' },
  { label: 'Lavana', sub: 'Salty', key: 'lavana', angle: Math.PI / 6, color: '#06b6d4' },
  { label: 'Tikta', sub: 'Bitter', key: 'tikta', angle: Math.PI / 2, color: '#ef4444' },
  { label: 'Katu', sub: 'Pungent', key: 'katu', angle: (5 * Math.PI) / 6, color: '#f97316' },
  { label: 'Kashaya', sub: 'Astringent', key: 'kashaya', angle: (-5 * Math.PI) / 6, color: '#a855f7' },
];

export default function TasteRadarCanvas({ tasteScores }) {
  const canvasRef = useRef(null);

  const scores = tasteScores || {
    madhura: 25,
    amla: 15,
    lavana: 20,
    tikta: 85,
    katu: 35,
    kashaya: 75,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 36;

    ctx.clearRect(0, 0, width, height);

    // Subtle dark background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Grid Concentric Hexagons (20%, 40%, 60%, 80%, 100%)
    for (let level = 1; level <= 5; level++) {
      const r = (radius / 5) * level;
      ctx.beginPath();
      SHAD_RASA_AXES.forEach((axis, i) => {
        const x = centerX + r * Math.cos(axis.angle);
        const y = centerY + r * Math.sin(axis.angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = level === 5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Numeric scale label along top axis
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`${level * 20}`, centerX + 4, centerY - r + 3);
    }

    // Radial Spokes & Axis Labels
    SHAD_RASA_AXES.forEach((axis) => {
      const x = centerX + radius * Math.cos(axis.angle);
      const y = centerY + radius * Math.sin(axis.angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Axis Title
      const labelDist = radius + 20;
      const lx = centerX + labelDist * Math.cos(axis.angle);
      const ly = centerY + labelDist * Math.sin(axis.angle);

      ctx.fillStyle = '#f4f4f5';
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axis.label, lx, ly - 5);

      ctx.fillStyle = '#71717a';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`(${axis.sub})`, lx, ly + 6);
    });

    // Taste Polygon
    const dataValues = [
      scores.madhura || 10,
      scores.amla || 10,
      scores.lavana || 10,
      scores.tikta || 10,
      scores.katu || 10,
      scores.kashaya || 10,
    ];

    ctx.beginPath();
    dataValues.forEach((val, i) => {
      const r = (radius * Math.min(100, Math.max(0, val))) / 100;
      const x = centerX + r * Math.cos(SHAD_RASA_AXES[i].angle);
      const y = centerY + r * Math.sin(SHAD_RASA_AXES[i].angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Subtle emerald fill with clean stroke
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Vertex Markers
    dataValues.forEach((val, i) => {
      const r = (radius * Math.min(100, Math.max(0, val))) / 100;
      const x = centerX + r * Math.cos(SHAD_RASA_AXES[i].angle);
      const y = centerY + r * Math.sin(SHAD_RASA_AXES[i].angle);

      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [scores]);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-[#0a0d14] rounded border border-white/[0.08]">
      <canvas
        ref={canvasRef}
        width={320}
        height={300}
        className="max-w-full block"
      />
      <div className="grid grid-cols-3 gap-2 w-full mt-2 font-mono text-[10px] text-center">
        {SHAD_RASA_AXES.map((axis) => {
          const val = scores[axis.key] || 0;
          return (
            <div key={axis.key} className="bg-[#12151f] p-1.5 rounded border border-white/[0.06]">
              <span className="text-zinc-400 block text-[9px]">{axis.label}</span>
              <span className="font-bold text-zinc-100">{val}/100</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

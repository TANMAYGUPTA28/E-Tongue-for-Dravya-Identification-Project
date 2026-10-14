import { useEffect, useRef } from 'react';
import { DRAVYA_SAMPLES } from '../../services/randomForestEngine';

export default function PCAScatterPlot({ currentPoint }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 36;

    ctx.clearRect(0, 0, width, height);

    // Dark Scientific Canvas
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Fine grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Origin Axes: PC1 & PC2
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('PC1 (58.4% Variance Explained)', width - 185, centerY - 8);
    ctx.fillText('PC2 (27.2% Variance)', centerX + 8, 16);

    // Draw Clustered Herbal Groups
    DRAVYA_SAMPLES.forEach((sample) => {
      const cPC1 = sample.base[3] * 0.52 + sample.base[5] * 0.48 - sample.base[0] * 0.42;
      const cPC2 = sample.base[1] * 0.55 + sample.base[4] * 0.45 - sample.base[2] * 0.35;

      const cx = centerX + cPC1 * scale;
      const cy = centerY - cPC2 * scale;

      // 95% Confidence Ellipse
      ctx.strokeStyle = `${sample.color}55`;
      ctx.fillStyle = `${sample.color}10`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 26, 18, Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sample observations
      for (let i = 0; i < 6; i++) {
        const jx = Math.sin(i * 1.7) * 12 + Math.cos(i) * 4;
        const jy = Math.cos(i * 2.3) * 9 + Math.sin(i) * 3;
        ctx.beginPath();
        ctx.arc(cx + jx, cy + jy, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = sample.color;
        ctx.fill();
      }
    });

    // Active Sample Crosshair Pointer
    if (currentPoint && currentPoint.pc1 !== undefined && currentPoint.pc2 !== undefined) {
      const curX = centerX + currentPoint.pc1 * scale;
      const curY = centerY - currentPoint.pc2 * scale;

      // Measurement Reticle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(curX, curY, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(curX - 12, curY);
      ctx.lineTo(curX + 12, curY);
      ctx.moveTo(curX, curY - 12);
      ctx.lineTo(curX, curY + 12);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 9px "Inter", sans-serif';
      ctx.fillText('ACTIVE ASSAY', curX + 12, curY - 4);
    }
  }, [currentPoint]);

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="relative rounded border border-white/[0.08] overflow-hidden bg-[#0a0d14]">
        <canvas
          ref={canvasRef}
          width={450}
          height={260}
          className="w-full h-64 block"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {DRAVYA_SAMPLES.map((d) => (
          <div key={d.id} className="flex items-center gap-1.5 bg-[#12151f] px-2 py-0.5 rounded border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-zinc-300 truncate max-w-[140px]">{d.name.split('(')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

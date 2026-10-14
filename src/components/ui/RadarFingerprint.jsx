import { useMemo } from 'react';
import { motion } from 'framer-motion';

const AXES = [
  { label: 'Madhura (Sweet)', angle: 0 },
  { label: 'Amla (Sour)', angle: 60 },
  { label: 'Lavana (Salty)', angle: 120 },
  { label: 'Tikta (Bitter)', angle: 180 },
  { label: 'Katu (Pungent)', angle: 240 },
  { label: 'Kashaya (Astringent)', angle: 300 },
];

export default function RadarFingerprint({
  authenticValues = [25, 88, 15, 78, 35, 94],
  sampleValues = [25, 85, 18, 75, 34, 90],
  showComparison = true,
  size = 280,
  className = '',
}) {
  const center = size / 2;
  const maxRadius = size * 0.36;

  const getCoordinates = (value, angleDeg) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y };
  };

  const authenticPoints = useMemo(() => {
    return authenticValues
      .map((val, i) => {
        const { x, y } = getCoordinates(val, AXES[i].angle);
        return `${x},${y}`;
      })
      .join(' ');
  }, [authenticValues, size]);

  const samplePoints = useMemo(() => {
    return sampleValues
      .map((val, i) => {
        const { x, y } = getCoordinates(val, AXES[i].angle);
        return `${x},${y}`;
      })
      .join(' ');
  }, [sampleValues, size]);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric Hexagonal Grid Lines (25%, 50%, 75%, 100%) */}
        {[0.25, 0.5, 0.75, 1].map((scale) => {
          const gridPoints = AXES.map((axis) => {
            const angleRad = (axis.angle - 90) * (Math.PI / 180);
            const r = maxRadius * scale;
            return `${center + r * Math.cos(angleRad)},${center + r * Math.sin(angleRad)}`;
          }).join(' ');

          return (
            <polygon
              key={scale}
              points={gridPoints}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray={scale === 1 ? 'none' : '3,3'}
            />
          );
        })}

        {/* 6 Radiating Axes */}
        {AXES.map((axis, i) => {
          const { x, y } = getCoordinates(100, axis.angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Authentic Reference Polygon (Green / Primary) */}
        <motion.polygon
          points={authenticPoints}
          fill="rgba(62, 123, 76, 0.35)"
          stroke="#B6F36A"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            filter: 'drop-shadow(0 0 12px rgba(182, 243, 106, 0.35))',
          }}
        />

        {/* Sample / Comparison Polygon (Amber / Orange) */}
        {showComparison && (
          <motion.polygon
            points={samplePoints}
            fill="rgba(224, 160, 58, 0.25)"
            stroke="#E0A03A"
            strokeWidth="1.8"
            strokeDasharray="4,3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          />
        )}

        {/* Axis Labels */}
        {AXES.map((axis, i) => {
          const { x, y } = getCoordinates(118, axis.angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] font-mono fill-[#8A968E] font-medium"
            >
              {axis.label.split(' ')[0]}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-[#8A968E]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#B6F36A]/80 border border-[#B6F36A]" />
          <span>Authentic Botanical</span>
        </div>
        {showComparison && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E0A03A]/60 border border-[#E0A03A] border-dashed" />
            <span>Tested Sample</span>
          </div>
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';

export default function ConfidenceRing({
  percentage = 88.4,
  size = 140,
  strokeWidth = 10,
  label = 'Authenticity Match',
  color = '#B6F36A',
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Animated Glow Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 10px ${color}80)`,
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-bold tracking-tight text-[#EDEFE8]">
            {percentage}%
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A968E]">
            CONFIDENCE
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-xs font-mono text-[#8A968E] text-center">
          {label}
        </span>
      )}
    </div>
  );
}

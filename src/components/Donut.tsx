import { motion } from 'framer-motion';

interface DonutSegment {
  name: string;
  pct: number;
  color: string;
}

interface DonutProps {
  segs: DonutSegment[];
  centerLabel: string;
  centerValue: string;
  size?: number;
  stroke?: number;
}

export function Donut({ segs, centerLabel, centerValue, size = 140, stroke = 18 }: DonutProps) {
  const R = (size - stroke) / 2;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={R}
        fill="none"
        stroke="currentColor"
        className="text-gray-100 dark:text-gray-800"
        strokeWidth={stroke}
      />
      {segs.map((s) => {
        const len = (s.pct / 100) * C;
        const el = (
          <motion.circle
            key={s.name}
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            initial={{ strokeDasharray: `0 ${C}`, strokeDashoffset: -acc }}
            animate={{ strokeDasharray: `${len} ${C - len}`, strokeDashoffset: -acc }}
            transition={{ duration: 1, ease: "easeOut" }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        acc += len;
        return el;
      })}
      <text
        x={size / 2}
        y={size / 2 - 4}
        textAnchor="middle"
        fontSize="10"
        className="fill-gray-400 font-mono tracking-widest uppercase"
      >
        {centerLabel}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 16}
        textAnchor="middle"
        fontSize="18"
        fontWeight="600"
        className="fill-gray-900 dark:fill-white font-sans tracking-tight"
      >
        {centerValue}
      </text>
    </svg>
  );
}

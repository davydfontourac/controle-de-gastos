interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
}

export function Sparkline({ data, color = 'var(--accent)', className }: SparklineProps) {
  if (!data || data.length === 0) return null;
  
  const mx = Math.max(...data);
  const mn = Math.min(...data);
  const range = mx - mn || 1;
  
  const points = data.map((v, j) => {
    const x = (j / (data.length - 1)) * 100;
    const y = 24 - ((v - mn) / range) * 20 - 2; // Keep it within 24px height with some padding
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={className} viewBox="0 0 100 24" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

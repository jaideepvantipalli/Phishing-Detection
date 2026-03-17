import { useEffect, useState } from 'react';
import { getRiskColor } from '../utils/analyzer';

export default function ProgressCircle({ score, size = 160, strokeWidth = 10, animate = true }) {
  const [currentScore, setCurrentScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const riskColor = getRiskColor(score);

  useEffect(() => {
    if (!animate) {
      setCurrentScore(score);
      return;
    }
    setCurrentScore(0);
    const duration = 1500;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrentScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [score, animate]);

  const offset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(30, 41, 59, 0.5)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={riskColor.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: animate ? 'none' : 'stroke-dashoffset 0.5s ease-out',
            filter: `drop-shadow(0 0 8px ${riskColor.primary}40)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-4xl font-bold font-mono"
          style={{ color: riskColor.primary }}
        >
          {currentScore}
        </span>
        <span className="text-xs text-cyber-muted mt-1">Risk Score</span>
      </div>
    </div>
  );
}

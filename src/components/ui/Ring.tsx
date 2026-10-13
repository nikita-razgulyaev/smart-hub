import type { ReactNode } from 'react';

interface RingProps {
  /** Заполнение кольца, 0–100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
  className?: string;
}

/** Тонкое кольцевое значение (SVG). Цвета — из токенов темы. */
export function Ring({ value, size = 120, strokeWidth = 8, children, className = '' }: RingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={`dial${className ? ` ${className}` : ''}`} style={{ width: size, height: size }}>
      <svg className="dial__svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="dial__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className="dial__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="dial__content">{children}</div>
    </div>
  );
}

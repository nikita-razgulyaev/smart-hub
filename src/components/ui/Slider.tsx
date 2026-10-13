import type { CSSProperties } from 'react';

interface SliderProps {
  value: number;
  max: number;
  min?: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  className?: string;
}

/**
 * Слайдер без нативной отрисовки: трек и заполнение берут цвета из токенов темы,
 * поэтому одинаково выглядят в светлой и тёмной теме.
 */
export function Slider({
  value,
  max,
  min = 0,
  step = 1,
  label,
  onChange,
  onPointerDown,
  onPointerUp,
  className = '',
}: SliderProps) {
  const span = max - min;
  const fill = span > 0 ? Math.min(100, Math.max(0, ((value - min) / span) * 100)) : 0;

  return (
    <input
      type="range"
      className={`slider${className ? ` ${className}` : ''}`}
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      style={{ ['--slider-fill' as string]: `${fill}%` } as CSSProperties}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    />
  );
}

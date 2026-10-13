import { useState } from 'react';
import type { PointerEvent } from 'react';
import { ENERGY_READINGS } from '../data/seedData';
import { useElementWidth } from '../hooks/useElementWidth';
import { formatNumber } from '../utils/format';

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const CHART_H = 168;
const PAD_LEFT = 30;
const PAD_RIGHT = 12;
const PAD_TOP = 30; // место под tooltip
const PAD_BOTTOM = 26;
const GRADIENT_ID = 'energy-area-gradient';

interface Point {
  x: number;
  y: number;
  kwh: number;
  day: string;
}

/** Плавная кривая по монотонному кубическому сплайну (без «перелётов» между точками). */
function smoothPath(points: Point[]): string {
  if (points.length < 2) return '';
  const n = points.length;
  const dx: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x);
    slopes.push((points[i + 1].y - points[i].y) / dx[i]);
  }

  const tangents: number[] = [slopes[0]];
  for (let i = 1; i < n - 1; i++) {
    tangents.push(slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2);
  }
  tangents.push(slopes[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      const t = 3 / h;
      tangents[i] = t * a * slopes[i];
      tangents[i + 1] = t * b * slopes[i];
    }
  }

  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = points[i].x + dx[i] / 3;
    const c1y = points[i].y + (tangents[i] * dx[i]) / 3;
    const c2x = points[i + 1].x - dx[i] / 3;
    const c2y = points[i + 1].y - (tangents[i + 1] * dx[i]) / 3;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${points[i + 1].x.toFixed(1)},${points[i + 1].y.toFixed(1)}`;
  }
  return d;
}

export function EnergyChartCard() {
  const readings = ENERGY_READINGS;
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const totalKwh = Math.round(readings.reduce((sum, r) => sum + r.kwh, 0) * 10) / 10;
  const maxVal = Math.max(10, ...readings.map((r) => r.kwh));
  const scaleMax = Math.ceil(maxVal / 10) * 10;

  const plotW = Math.max(1, width - PAD_LEFT - PAD_RIGHT);
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;
  const baseY = PAD_TOP + plotH;
  const stepX = plotW / (readings.length - 1 || 1);

  const points: Point[] = readings.map((r, i) => ({
    x: PAD_LEFT + i * stepX,
    y: PAD_TOP + plotH - (r.kwh / scaleMax) * plotH,
    kwh: r.kwh,
    day: WEEKDAYS[new Date(r.day).getDay()],
  }));

  const peakIndex = points.reduce((best, p, i) => (p.kwh > points[best].kwh ? i : best), 0);
  const activeIndex = hoverIndex ?? peakIndex;
  const active = points[activeIndex];

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${baseY} L${points[0].x.toFixed(1)},${baseY} Z`;

  const ticks = Array.from({ length: scaleMax / 10 + 1 }, (_, i) => {
    const value = i * 10;
    return { value, y: baseY - (value / scaleMax) * plotH };
  });

  const tooltipLabel = `${formatNumber(active.kwh)} кВт·ч`;
  const tooltipW = tooltipLabel.length * 7 + 16;
  const tooltipX = Math.min(Math.max(active.x - tooltipW / 2, PAD_LEFT), width - PAD_RIGHT - tooltipW);

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.round((x - PAD_LEFT) / stepX);
    setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
  };

  return (
    <div className="card">
      <div className="energy__head">
        <span className="text-title">Потребление электричества</span>
        <span className="text-label">Неделя · {formatNumber(totalKwh)} кВт·ч</span>
      </div>

      <div className="energy__chart" ref={ref}>
        <svg
          className="energy__svg"
          width={width}
          height={CHART_H}
          viewBox={`0 0 ${width} ${CHART_H}`}
          role="img"
          aria-label={`График потребления за неделю, всего ${formatNumber(totalKwh)} кВт·ч`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop className="energy__stop" offset="0%" stopOpacity="0.32" />
              <stop className="energy__stop" offset="100%" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t.value}>
              <line className="energy__grid" x1={PAD_LEFT} x2={width - PAD_RIGHT} y1={t.y} y2={t.y} />
              <text className="energy__axis" x={PAD_LEFT - 8} y={t.y + 4} textAnchor="end">
                {t.value}
              </text>
            </g>
          ))}

          <path d={areaPath} fill={`url(#${GRADIENT_ID})`} />
          <path className="energy__line" d={linePath} />

          <line className="energy__guide" x1={active.x} x2={active.x} y1={PAD_TOP} y2={baseY} />

          {points.map((p, i) => (
            <circle
              key={p.day + i}
              className={`energy__dot${i === activeIndex ? ' energy__dot--active' : ''}`}
              cx={p.x}
              cy={p.y}
              r={i === activeIndex ? 5.5 : 3.5}
            />
          ))}

          {points.map((p, i) => (
            <text
              key={`label-${p.day}${i}`}
              className="energy__axis"
              x={p.x}
              y={CHART_H - 6}
              textAnchor="middle"
              style={i === activeIndex ? { fill: 'var(--ink)', fontWeight: 600 } : undefined}
            >
              {p.day}
            </text>
          ))}

          <rect className="energy__tooltip-bg" x={tooltipX} y={2} width={tooltipW} height={22} rx={8} />
          <text
            className="energy__tooltip-text"
            x={tooltipX + tooltipW / 2}
            y={17}
            textAnchor="middle"
          >
            {tooltipLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}

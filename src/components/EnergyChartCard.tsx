import { ENERGY_READINGS } from '../data/seedData';

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const CHART_W = 600;
const CHART_H = 130;
const PAD_LEFT = 34;
const PAD_TOP = 10;
const PAD_BOTTOM = 20;

export function EnergyChartCard() {
  const readings = ENERGY_READINGS;
  const totalKwh = Math.round(readings.reduce((sum, r) => sum + r.kwh, 0) * 10) / 10;

  const maxVal = Math.max(5, ...readings.map((r) => r.kwh));
  const scaleMax = Math.ceil(maxVal / 5) * 5;
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;
  const stepX = (CHART_W - PAD_LEFT) / (readings.length - 1 || 1);

  const points = readings.map((r, i) => ({
    x: PAD_LEFT + i * stepX,
    y: PAD_TOP + plotH - (r.kwh / scaleMax) * plotH,
    kwh: r.kwh,
    day: WEEKDAYS[new Date(r.day).getDay()],
  }));

  const peakIndex = points.reduce((best, p, i) => (p.kwh > points[best].kwh ? i : best), 0);
  const polylinePoints = points.map((p) => `${p.x},${p.y.toFixed(1)}`).join(' ');
  const polygonPoints = `${polylinePoints} ${points[points.length - 1].x},${CHART_H - PAD_BOTTOM} ${points[0].x},${CHART_H - PAD_BOTTOM}`;

  const gridLines = Array.from({ length: 6 }, (_, i) => {
    const y = PAD_TOP + plotH - (i / 5) * plotH;
    return { y, label: Math.round((i / 5) * scaleMax) };
  });

  const peak = points[peakIndex];

  return (
    <div className="card energy-card">
      <div className="energy-top">
        <span className="title-sm">График потребления электричества</span>
        <span className="label" style={{ margin: 0 }}>
          Неделя · {totalKwh} кВт·ч
        </span>
      </div>

      <svg className="energy-chart" viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="egrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4b8bf0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4b8bf0" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g stroke="var(--border)" strokeWidth="1">
          {gridLines.map((g) => (
            <line key={g.label} x1={PAD_LEFT} y1={g.y} x2={CHART_W} y2={g.y} />
          ))}
        </g>
        <g fontSize="9" fill="var(--ink-soft)">
          {gridLines.map((g) => (
            <text key={g.label} x="0" y={g.y + 3}>
              {g.label}
            </text>
          ))}
        </g>

        <polyline points={polylinePoints} fill="none" stroke="#4b8bf0" strokeWidth="2.2" />
        <polygon points={polygonPoints} fill="url(#egrad)" />

        <g fill="#4b8bf0">
          {points.map((p, i) =>
            i === peakIndex ? (
              <circle key={i} cx={p.x} cy={p.y} r="4.5" stroke="#fff" strokeWidth="1.5" />
            ) : (
              <circle key={i} cx={p.x} cy={p.y} r="3" />
            ),
          )}
        </g>

        <g>
          <rect x={peak.x - 32} y="0" width="64" height="15" rx="7" fill="#4b8bf0" />
          <text x={peak.x} y="10.5" fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle">
            {peak.kwh} кВт·ч
          </text>
        </g>
      </svg>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '9.5px',
          color: 'var(--ink-soft)',
          marginTop: 4,
          paddingLeft: '5.6%',
        }}
      >
        {points.map((p, i) => (
          <span key={i}>
            {p.day}
            <br />
            {p.kwh}
          </span>
        ))}
      </div>
    </div>
  );
}

import { Stock } from '../types';

export function StockCard({ stock }: { stock: Stock }) {
  const up = stock.changePct >= 0;
  const color = up ? '#3fae94' : '#c9614f';
  const gradId = `grad-${stock.ticker}`;
  const suffix = stock.currency === 'RUB' ? '₽' : '$';

  const points = stock.prices.length > 1 ? stock.prices : [stock.latest, stock.latest, stock.latest];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * 76,
    y: 28 - ((p - min) / range) * 24 + 2,
  }));

  const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const polygonPoints = `${polylinePoints} 76,32 0,32`;
  const last = coords[coords.length - 1];

  return (
    <div className="card stock-card">
      <div>
        <div className="name">{stock.ticker}</div>
        <div className="label" style={{ margin: 0 }}>
          {suffix}
          {stock.latest?.toFixed(2)} <span className={up ? 'up' : 'down'}>
            {up ? '+' : ''}
            {stock.changePct}%
          </span>
        </div>
      </div>
      <svg width="76" height="32" viewBox="0 0 76 32">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={polylinePoints} fill="none" stroke={color} strokeWidth="1.8" />
        <polygon points={polygonPoints} fill={`url(#${gradId})`} />
        <circle cx={last.x} cy={last.y} r="2.4" fill={color} />
      </svg>
    </div>
  );
}

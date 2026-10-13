import { Stock } from '../types';
import { formatCurrency, formatPercent } from '../utils/format';

const CHART_W = 76;
const CHART_H = 32;

export function StockCard({ stock }: { stock: Stock }) {
  const trend = stock.changePct >= 0 ? 'up' : 'down';
  const gradId = `grad-${stock.ticker}`;

  const points = stock.prices.length > 1 ? stock.prices : [stock.latest, stock.latest, stock.latest];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * CHART_W,
    y: CHART_H - 4 - ((p - min) / range) * (CHART_H - 8),
  }));

  const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const polygonPoints = `${polylinePoints} ${CHART_W},${CHART_H} 0,${CHART_H}`;
  const last = coords[coords.length - 1];

  return (
    <div className="card stock">
      <div>
        <div className="stock__ticker">{stock.ticker}</div>
        <div className="stock__price">
          <span>{formatCurrency(stock.latest, stock.currency)}</span>
          <span className={`delta--${trend}`}>{formatPercent(stock.changePct)}</span>
        </div>
      </div>
      <svg className="stock__chart" width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop className={`stock__stop--${trend}`} offset="0%" stopOpacity="0.3" />
            <stop className={`stock__stop--${trend}`} offset="100%" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={polygonPoints} fill={`url(#${gradId})`} />
        <polyline className={`stock__line stock__line--${trend}`} points={polylinePoints} />
        <circle className={`stock__dot--${trend}`} cx={last.x} cy={last.y} r="2.4" />
      </svg>
    </div>
  );
}

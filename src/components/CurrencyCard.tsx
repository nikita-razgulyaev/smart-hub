import { useEffect, useState } from 'react';
import { getCurrencyRates } from '../api/external';
import { CurrencyRates } from '../types';
import { formatCurrency, formatDelta } from '../utils/format';

export function CurrencyCard() {
  const [rates, setRates] = useState<CurrencyRates | null>(null);

  useEffect(() => {
    getCurrencyRates()
      .then(setRates)
      .catch(() => setRates(null));
  }, []);

  const items: { label: string; value?: number; delta?: number }[] = [
    { label: 'USD', value: rates?.usd, delta: rates?.usdDelta },
    { label: 'EUR', value: rates?.eur, delta: rates?.eurDelta },
    { label: 'CNY', value: rates?.cny, delta: rates?.cnyDelta },
  ];

  return (
    <div className="rates">
      {items.map((item) => {
        const up = (item.delta ?? 0) >= 0;
        return (
          <div key={item.label} className="card rate">
            <div className="text-label">{item.label}</div>
            <div className="rate__value">{item.value !== undefined ? formatCurrency(item.value, 'RUB') : '—'}</div>
            {item.delta !== undefined && (
              <div className={`rate__delta ${up ? 'delta--up' : 'delta--down'}`}>{formatDelta(item.delta)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

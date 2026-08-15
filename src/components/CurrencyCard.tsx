import { useEffect, useState } from 'react';
import { getCurrencyRates } from '../api/external';
import { CurrencyRates } from '../types';

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
    <div className="cur-row3">
      {items.map((item) => {
        const up = (item.delta ?? 0) >= 0;
        return (
          <div key={item.label} className="card cur-mini">
            <div className="label">{item.label}</div>
            <div className="val">{item.value !== undefined ? `${item.value}₽` : '--₽'}</div>
            {item.delta !== undefined && (
              <div className={`delta ${up ? 'up' : 'down'}`}>
                {up ? '+' : ''}
                {item.delta.toFixed(2)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

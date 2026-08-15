import { create } from 'zustand';
import { Stock } from '../types';
import { STOCKS_SEED } from '../data/seedData';

interface StocksState {
  byId: Record<string, Stock>;
  tick: () => void;
}

function seedById(): Record<string, Stock> {
  const byId: Record<string, Stock> = {};
  for (const s of STOCKS_SEED) byId[s.id] = s;
  return byId;
}

export const useStocksStore = create<StocksState>((set, get) => ({
  byId: seedById(),

  // Раз в 10 секунд — случайное блуждание цены вокруг последнего значения,
  // как раньше делал StocksGateway на бэкенде.
  tick: () => {
    const byId = { ...get().byId };
    for (const id of Object.keys(byId)) {
      const stock = byId[id];
      const prev = stock.latest;
      const next = Math.max(1, prev * (1 + (Math.random() - 0.5) * 0.01));
      const rounded = Math.round(next * 100) / 100;
      const changePct = Math.round(((rounded - prev) / prev) * 1000) / 10;
      byId[id] = {
        ...stock,
        prices: [...stock.prices, rounded].slice(-10),
        latest: rounded,
        changePct,
      };
    }
    set({ byId });
  },
}));

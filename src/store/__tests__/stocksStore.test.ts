import { useStocksStore } from '../stocksStore';

describe('stocksStore', () => {
  it('tick обновляет цену и историю каждой акции', () => {
    const before = useStocksStore.getState().byId['stock-aapl'];
    const beforeHistoryLength = before.prices.length;

    useStocksStore.getState().tick();

    const after = useStocksStore.getState().byId['stock-aapl'];
    expect(after.prices.length).toBe(beforeHistoryLength + 1);
    expect(after.latest).toBe(after.prices[after.prices.length - 1]);
  });
});

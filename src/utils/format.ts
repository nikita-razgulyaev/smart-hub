const numberFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

const currencyFormatters: Record<string, Intl.NumberFormat> = {};

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  if (!currencyFormatters[currency]) {
    currencyFormatters[currency] = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return currencyFormatters[currency];
}

const deltaFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

const percentFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

export const formatNumber = (value: number): string => numberFormatter.format(value);
export const formatCurrency = (value: number, currency: string): string => getCurrencyFormatter(currency).format(value);
export const formatDelta = (value: number): string => deltaFormatter.format(value);
export const formatPercent = (value: number): string => `${percentFormatter.format(value)}%`;

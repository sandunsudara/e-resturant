const DEFAULT_CURRENCY = 'LKR';

export function formatCurrency(value, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
}

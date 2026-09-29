// Formatters are created once, not on every call from every card.
const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatPriceCOP(price: number): string {
  return `${priceFormatter.format(price)} COP`;
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

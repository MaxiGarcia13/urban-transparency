const PERCENT_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export function formatPercent(value: number): string {
  return PERCENT_FORMATTER.format(value);
}

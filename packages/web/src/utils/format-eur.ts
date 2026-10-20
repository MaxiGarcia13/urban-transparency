const EUR_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export function formatEur(amount: number): string {
  return EUR_FORMATTER.format(amount);
}

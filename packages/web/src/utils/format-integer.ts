const INTEGER_FORMATTER = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
});

export function formatInteger(value: number): string {
  return INTEGER_FORMATTER.format(value);
}

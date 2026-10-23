export function compareNullableNumberDesc(
  valueA: number | null | undefined,
  valueB: number | null | undefined,
): number {
  if (valueA == null && valueB == null) {
    return 0;
  }
  if (valueA == null) {
    return 1;
  }
  if (valueB == null) {
    return -1;
  }
  return valueB - valueA;
}

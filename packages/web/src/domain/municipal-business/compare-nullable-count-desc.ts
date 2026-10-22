export function compareNullableCountDesc(
  countA: number | null | undefined,
  countB: number | null | undefined,
): number {
  if (countA == null && countB == null) {
    return 0;
  }
  if (countA == null) {
    return 1;
  }
  if (countB == null) {
    return -1;
  }
  return countB - countA;
}

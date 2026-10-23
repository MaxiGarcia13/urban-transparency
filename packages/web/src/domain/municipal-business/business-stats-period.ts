import type { MunicipalBusinessStats } from '@urban-transparency/shared';

export function availableBusinessStatsYears(
  rows: readonly MunicipalBusinessStats[],
): number[] {
  const years = new Set<number>();
  for (const row of rows) {
    years.add(row.periodYear);
  }
  return [...years].sort((a, b) => b - a);
}

export function resolveBusinessStatsPeriodYear(
  rows: readonly MunicipalBusinessStats[],
  periodYear: number | null,
): number | null {
  if (rows.length === 0) {
    return null;
  }
  if (periodYear != null) {
    return periodYear;
  }
  return availableBusinessStatsYears(rows)[0] ?? null;
}

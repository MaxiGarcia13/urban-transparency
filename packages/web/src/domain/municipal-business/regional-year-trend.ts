import type { DirceSectorCode, MunicipalBusinessStats } from '@urban-transparency/shared';

export interface BusinessYearTrendPoint {
  periodYear: number;
  activeBusinessCount: number;
}

export function buildRegionalYearTrend(
  rows: readonly MunicipalBusinessStats[],
  sectorCode: DirceSectorCode,
): BusinessYearTrendPoint[] {
  const byYear = new Map<number, number>();
  for (const row of rows) {
    if (row.sectorCode !== sectorCode || row.activeBusinessCount == null) {
      continue;
    }
    byYear.set(
      row.periodYear,
      (byYear.get(row.periodYear) ?? 0) + row.activeBusinessCount,
    );
  }

  return [...byYear.entries()]
    .map(([periodYear, activeBusinessCount]) => ({
      periodYear,
      activeBusinessCount,
    }))
    .sort((a, b) => a.periodYear - b.periodYear);
}

export function yearOverYearChange(
  trend: readonly BusinessYearTrendPoint[],
  periodYear: number | null,
): number | null {
  if (periodYear == null || trend.length < 2) {
    return null;
  }
  const currentIndex = trend.findIndex((point) => point.periodYear === periodYear);
  if (currentIndex <= 0) {
    return null;
  }
  const current = trend[currentIndex];
  const previous = trend[currentIndex - 1];
  if (!current || !previous || previous.activeBusinessCount <= 0) {
    return null;
  }
  return (current.activeBusinessCount - previous.activeBusinessCount)
    / previous.activeBusinessCount;
}

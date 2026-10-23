import type { MunicipalIncomeStats } from '@urban-transparency/shared';

import { isMunicipalityIncomeCode } from './income-geo';

export function availableIncomeStatsYears(
  rows: readonly MunicipalIncomeStats[],
): number[] {
  const years = new Set<number>();
  for (const row of rows) {
    if (!isMunicipalityIncomeCode(row.municipalityCode)) {
      continue;
    }
    years.add(row.periodYear);
  }
  return [...years].sort((a, b) => b - a);
}

export function resolveIncomeStatsPeriodYear(
  rows: readonly MunicipalIncomeStats[],
  periodYear: number | null,
): number | null {
  if (rows.length === 0) {
    return null;
  }
  if (periodYear != null) {
    return periodYear;
  }
  return availableIncomeStatsYears(rows)[0] ?? null;
}

import type { MunicipalBusinessStats } from '@urban-transparency/shared';
import type { BusinessPowerFilters } from './business-power-filters';
import { getMunicipalityByCode } from '@urban-transparency/shared';

export type MunicipalBusinessRankingRow = Pick<
  MunicipalBusinessStats,
  'municipalityCode' | 'periodYear' | 'sectorCode' | 'activeBusinessCount'
> & {
  municipalityName: string;
};

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
  let latest = rows[0]?.periodYear ?? null;
  for (const row of rows) {
    if (latest == null || row.periodYear > latest) {
      latest = row.periodYear;
    }
  }
  return latest;
}

export function buildMunicipalBusinessRanking(
  rows: readonly MunicipalBusinessStats[],
  filters: BusinessPowerFilters,
): MunicipalBusinessRankingRow[] {
  const periodYear = resolveBusinessStatsPeriodYear(rows, filters.periodYear);
  if (periodYear == null) {
    return [];
  }

  const ranking: MunicipalBusinessRankingRow[] = [];
  for (const row of rows) {
    if (row.periodYear !== periodYear || row.sectorCode !== filters.sectorCode) {
      continue;
    }
    const municipality = getMunicipalityByCode(row.municipalityCode);
    ranking.push({
      municipalityCode: row.municipalityCode,
      municipalityName: municipality?.name ?? row.municipalityCode,
      periodYear: row.periodYear,
      sectorCode: row.sectorCode,
      activeBusinessCount: row.activeBusinessCount,
    });
  }

  return ranking.sort((a, b) => {
    const countA = a.activeBusinessCount;
    const countB = b.activeBusinessCount;
    if (countA == null && countB == null) {
      return a.municipalityName.localeCompare(b.municipalityName, 'es');
    }
    if (countA == null) {
      return 1;
    }
    if (countB == null) {
      return -1;
    }
    if (countB !== countA) {
      return countB - countA;
    }
    return a.municipalityName.localeCompare(b.municipalityName, 'es');
  });
}

export function sumActiveBusinessCount(
  ranking: readonly MunicipalBusinessRankingRow[],
): number | null {
  let total = 0;
  let hasValue = false;
  for (const row of ranking) {
    if (row.activeBusinessCount == null) {
      continue;
    }
    hasValue = true;
    total += row.activeBusinessCount;
  }
  return hasValue ? total : null;
}

export function sectorBreakdownForMunicipality(
  rows: readonly MunicipalBusinessStats[],
  municipalityCode: string,
  periodYear: number,
): MunicipalBusinessStats[] {
  return rows
    .filter(
      (row) =>
        row.municipalityCode === municipalityCode
        && row.periodYear === periodYear
        && row.sectorCode !== 'TOTAL',
    )
    .sort((a, b) => {
      const countA = a.activeBusinessCount;
      const countB = b.activeBusinessCount;
      if (countA == null && countB == null) {
        return a.sectorCode.localeCompare(b.sectorCode);
      }
      if (countA == null) {
        return 1;
      }
      if (countB == null) {
        return -1;
      }
      return countB - countA;
    });
}

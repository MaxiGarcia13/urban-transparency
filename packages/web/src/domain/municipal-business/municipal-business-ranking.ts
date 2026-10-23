import type { MunicipalBusinessStats } from '@urban-transparency/shared';
import type { BusinessPowerFilters } from '../business-power-filters';
import { getMunicipalityByCode } from '@urban-transparency/shared';
import { resolveBusinessStatsPeriodYear } from './business-stats-period';
import { compareNullableCountDesc } from './compare-nullable-count-desc';

export const BUSINESS_POWER_TOP_RANKING_LIMIT = 15;

export type MunicipalBusinessRankingRow = Pick<
  MunicipalBusinessStats,
  'municipalityCode' | 'periodYear' | 'sectorCode' | 'activeBusinessCount'
> & {
  municipalityName: string;
  shareOfRegion: number | null;
};

export function sumActiveBusinessCount(
  ranking: readonly Pick<MunicipalBusinessRankingRow, 'activeBusinessCount'>[],
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

export function topMunicipalitiesShare(
  ranking: readonly MunicipalBusinessRankingRow[],
  topCount = 3,
): number | null {
  const regionTotal = sumActiveBusinessCount(ranking);
  if (regionTotal == null || regionTotal <= 0) {
    return null;
  }
  let topTotal = 0;
  for (const row of ranking.slice(0, topCount)) {
    if (row.activeBusinessCount != null) {
      topTotal += row.activeBusinessCount;
    }
  }
  return topTotal / regionTotal;
}

export function buildMunicipalBusinessRanking(
  rows: readonly MunicipalBusinessStats[],
  filters: BusinessPowerFilters,
): MunicipalBusinessRankingRow[] {
  const periodYear = resolveBusinessStatsPeriodYear(rows, filters.periodYear);
  if (periodYear == null) {
    return [];
  }

  const ranking: Omit<MunicipalBusinessRankingRow, 'shareOfRegion'>[] = [];
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

  ranking.sort((a, b) => {
    const byCount = compareNullableCountDesc(
      a.activeBusinessCount,
      b.activeBusinessCount,
    );
    return byCount !== 0
      ? byCount
      : a.municipalityName.localeCompare(b.municipalityName, 'es');
  });

  const regionTotal = sumActiveBusinessCount(ranking);
  return ranking.map((row) => ({
    ...row,
    shareOfRegion:
      regionTotal != null
      && regionTotal > 0
      && row.activeBusinessCount != null
        ? row.activeBusinessCount / regionTotal
        : null,
  }));
}

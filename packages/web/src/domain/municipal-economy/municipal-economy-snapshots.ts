import type {
  DirceSectorCode,
  MunicipalBusinessStats,
  MunicipalIncomeStats,
} from '@urban-transparency/shared';
import type { LocalEconomyFilters } from '../local-economy-filters';
import { getMunicipalityByCode } from '@urban-transparency/shared';
import { compareNullableNumberDesc } from '@/utils/compare-nullable-number-desc';
import { isMunicipalityIncomeCode } from '../municipal-income';
import { resolveEconomyJoinYear } from './economy-join-year';

export interface MunicipalEconomySnapshot {
  municipalityCode: string;
  municipalityName: string;
  periodYear: number;
  sectorCode: DirceSectorCode;
  activeBusinessCount: number | null;
  shareOfRegion: number | null;
  businessPercentile: number | null;
  meanIncome: number | null;
  incomeDeltaVsProvincialMean: number | null;
}

function measureValue(
  row: MunicipalIncomeStats,
  measure: LocalEconomyFilters['measure'],
): number | null {
  return measure === 'person'
    ? row.meanNetIncomePerPerson
    : row.meanNetIncomePerHousehold;
}

function percentileRanks(
  values: readonly (number | null)[],
): (number | null)[] {
  const indexed = values
    .map((value, index) => ({ value, index }))
    .filter(
      (entry): entry is { value: number; index: number } => entry.value != null,
    )
    .sort((a, b) => a.value - b.value);

  const ranks = values.map(() => null as number | null);
  const n = indexed.length;
  if (n === 0) {
    return ranks;
  }
  if (n === 1) {
    ranks[indexed[0].index] = 0.5;
    return ranks;
  }

  for (let i = 0; i < n; i += 1) {
    ranks[indexed[i].index] = i / (n - 1);
  }
  return ranks;
}

export function buildMunicipalEconomySnapshots(
  businessRows: readonly MunicipalBusinessStats[],
  incomeRows: readonly MunicipalIncomeStats[],
  filters: LocalEconomyFilters,
  provincialMeanIncome: number | null,
): MunicipalEconomySnapshot[] {
  const periodYear = resolveEconomyJoinYear(
    businessRows,
    incomeRows,
    filters.periodYear,
  );
  if (periodYear == null) {
    return [];
  }

  const incomeByMunicipality = new Map<string, MunicipalIncomeStats>();
  for (const row of incomeRows) {
    if (
      row.periodYear !== periodYear
      || !isMunicipalityIncomeCode(row.municipalityCode)
    ) {
      continue;
    }
    incomeByMunicipality.set(row.municipalityCode, row);
  }

  const snapshots: Omit<
    MunicipalEconomySnapshot,
    'shareOfRegion' | 'businessPercentile'
  >[] = [];

  for (const row of businessRows) {
    if (
      row.periodYear !== periodYear
      || row.sectorCode !== filters.sectorCode
    ) {
      continue;
    }
    const income = incomeByMunicipality.get(row.municipalityCode);
    if (income == null) {
      continue;
    }
    const meanIncome = measureValue(income, filters.measure);
    const municipality = getMunicipalityByCode(row.municipalityCode);
    snapshots.push({
      municipalityCode: row.municipalityCode,
      municipalityName: municipality?.name ?? row.municipalityCode,
      periodYear,
      sectorCode: row.sectorCode,
      activeBusinessCount: row.activeBusinessCount,
      meanIncome,
      incomeDeltaVsProvincialMean:
        provincialMeanIncome != null
        && provincialMeanIncome > 0
        && meanIncome != null
          ? (meanIncome - provincialMeanIncome) / provincialMeanIncome
          : null,
    });
  }

  snapshots.sort((a, b) => {
    const byCount = compareNullableNumberDesc(
      a.activeBusinessCount,
      b.activeBusinessCount,
    );
    return byCount !== 0
      ? byCount
      : a.municipalityName.localeCompare(b.municipalityName, 'es');
  });

  let regionTotal = 0;
  let hasRegionTotal = false;
  for (const row of snapshots) {
    if (row.activeBusinessCount == null) {
      continue;
    }
    hasRegionTotal = true;
    regionTotal += row.activeBusinessCount;
  }

  const percentiles = percentileRanks(
    snapshots.map((row) => row.activeBusinessCount),
  );

  return snapshots.map((row, index) => ({
    ...row,
    shareOfRegion:
      hasRegionTotal
      && regionTotal > 0
      && row.activeBusinessCount != null
        ? row.activeBusinessCount / regionTotal
        : null,
    businessPercentile: percentiles[index] ?? null,
  }));
}

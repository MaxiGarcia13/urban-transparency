import type { MunicipalIncomeStats } from '@urban-transparency/shared';
import type { MetricRankingRow } from '../metric-ranking';
import type { SalaryIncomeFilters } from '../salary-income-filters';
import { getMunicipalityByCode } from '@urban-transparency/shared';
import { compareNullableNumberDesc } from '@/utils/compare-nullable-number-desc';
import { isMunicipalityIncomeCode } from './income-geo';
import { resolveIncomeStatsPeriodYear } from './income-stats-period';

function measureValue(
  row: MunicipalIncomeStats,
  measure: SalaryIncomeFilters['measure'],
): number | null {
  return measure === 'person'
    ? row.meanNetIncomePerPerson
    : row.meanNetIncomePerHousehold;
}

export function buildMunicipalIncomeRanking(
  rows: readonly MunicipalIncomeStats[],
  filters: SalaryIncomeFilters,
  provincialBaseline: number | null = null,
): MetricRankingRow[] {
  const periodYear = resolveIncomeStatsPeriodYear(rows, filters.periodYear);
  if (periodYear == null) {
    return [];
  }

  const ranking: MetricRankingRow[] = [];
  for (const row of rows) {
    if (
      row.periodYear !== periodYear
      || !isMunicipalityIncomeCode(row.municipalityCode)
    ) {
      continue;
    }
    const municipality = getMunicipalityByCode(row.municipalityCode);
    const value = measureValue(row, filters.measure);
    ranking.push({
      id: row.municipalityCode,
      label: municipality?.name ?? row.municipalityCode,
      value,
      share: null,
      deltaVsBaseline:
        provincialBaseline != null
        && provincialBaseline > 0
        && value != null
          ? (value - provincialBaseline) / provincialBaseline
          : null,
    });
  }

  ranking.sort((a, b) => {
    const byValue = compareNullableNumberDesc(a.value, b.value);
    return byValue !== 0
      ? byValue
      : a.label.localeCompare(b.label, 'es');
  });

  const maxValue = ranking.reduce<number | null>((max, row) => {
    if (row.value == null) {
      return max;
    }
    if (max == null || row.value > max) {
      return row.value;
    }
    return max;
  }, null);

  return ranking.map((row) => ({
    ...row,
    share:
      maxValue != null && maxValue > 0 && row.value != null
        ? row.value / maxValue
        : null,
  }));
}

export function meanRankingValue(
  ranking: readonly MetricRankingRow[],
): number | null {
  let sum = 0;
  let count = 0;
  for (const row of ranking) {
    if (row.value == null) {
      continue;
    }
    sum += row.value;
    count += 1;
  }
  return count > 0 ? sum / count : null;
}

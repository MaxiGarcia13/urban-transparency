import type { MunicipalIncomeStats } from '@urban-transparency/shared';
import type { MetricTrendPoint } from '../metric-ranking';
import type { SalaryIncomeMeasure } from '../salary-income-filters';
import {
  isMunicipalityIncomeCode,
  isProvinceIncomeAggregateCode,
} from './income-geo';

function measureValue(
  row: MunicipalIncomeStats,
  measure: SalaryIncomeMeasure,
): number | null {
  return measure === 'person'
    ? row.meanNetIncomePerPerson
    : row.meanNetIncomePerHousehold;
}

function buildTrendFromRows(
  rows: readonly MunicipalIncomeStats[],
  measure: SalaryIncomeMeasure,
): MetricTrendPoint[] {
  const byYear = new Map<number, { sum: number; count: number }>();
  for (const row of rows) {
    const value = measureValue(row, measure);
    if (value == null) {
      continue;
    }
    const bucket = byYear.get(row.periodYear) ?? { sum: 0, count: 0 };
    bucket.sum += value;
    bucket.count += 1;
    byYear.set(row.periodYear, bucket);
  }

  return [...byYear.entries()]
    .map(([year, bucket]) => ({
      year,
      value: bucket.sum / bucket.count,
    }))
    .sort((a, b) => a.year - b.year);
}

export function buildRegionalIncomeYearTrend(
  rows: readonly MunicipalIncomeStats[],
  measure: SalaryIncomeMeasure,
): MetricTrendPoint[] {
  const provinceRows = rows.filter((row) =>
    isProvinceIncomeAggregateCode(row.municipalityCode),
  );
  if (provinceRows.length > 0) {
    return buildTrendFromRows(provinceRows, measure);
  }

  const municipalityRows = rows.filter((row) =>
    isMunicipalityIncomeCode(row.municipalityCode),
  );
  return buildTrendFromRows(municipalityRows, measure);
}

export function incomeYearOverYearChange(
  trend: readonly MetricTrendPoint[],
  periodYear: number | null,
): number | null {
  if (periodYear == null || trend.length < 2) {
    return null;
  }
  const currentIndex = trend.findIndex((point) => point.year === periodYear);
  if (currentIndex <= 0) {
    return null;
  }
  const current = trend[currentIndex];
  const previous = trend[currentIndex - 1];
  if (!current || !previous || previous.value <= 0) {
    return null;
  }
  return (current.value - previous.value) / previous.value;
}

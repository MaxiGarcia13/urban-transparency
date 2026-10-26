import type {
  MunicipalBusinessStats,
  MunicipalIncomeStats,
} from '@urban-transparency/shared';
import { availableBusinessStatsYears } from '../municipal-business';
import { availableIncomeStatsYears } from '../municipal-income';

export function availableEconomyJoinYears(
  businessRows: readonly MunicipalBusinessStats[],
  incomeRows: readonly MunicipalIncomeStats[],
): number[] {
  const incomeYears = new Set(availableIncomeStatsYears(incomeRows));
  return availableBusinessStatsYears(businessRows).filter((year) =>
    incomeYears.has(year),
  );
}

export function resolveEconomyJoinYear(
  businessRows: readonly MunicipalBusinessStats[],
  incomeRows: readonly MunicipalIncomeStats[],
  periodYear: number | null,
): number | null {
  const joinYears = availableEconomyJoinYears(businessRows, incomeRows);
  if (joinYears.length === 0) {
    return null;
  }
  if (periodYear != null && joinYears.includes(periodYear)) {
    return periodYear;
  }
  return joinYears[0] ?? null;
}

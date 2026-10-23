import type { SalaryIncomeFilters } from './salary-income-filters';
import {
  DEFAULT_SALARY_INCOME_FILTERS,
  isSalaryIncomeMeasure,
} from './salary-income-filters';

export const SALARY_INCOME_YEAR_QUERY_KEY = 'year' as const;
export const SALARY_INCOME_MEASURE_QUERY_KEY = 'measure' as const;

export function parseSalaryIncomeFiltersFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): SalaryIncomeFilters {
  const yearRaw = searchParams.get(SALARY_INCOME_YEAR_QUERY_KEY)?.trim() ?? '';
  let periodYear: number | null = null;
  if (yearRaw) {
    const year = Number(yearRaw);
    if (Number.isInteger(year) && year >= 1900 && year <= 2100) {
      periodYear = year;
    }
  }

  const measureRaw
    = searchParams.get(SALARY_INCOME_MEASURE_QUERY_KEY)?.trim() ?? '';
  const measure = isSalaryIncomeMeasure(measureRaw)
    ? measureRaw
    : DEFAULT_SALARY_INCOME_FILTERS.measure;

  return { periodYear, measure };
}

export function serializeSalaryIncomeFiltersQuery(
  filters: SalaryIncomeFilters,
): { year?: string; measure?: string } {
  const query: { year?: string; measure?: string } = {};
  if (filters.periodYear != null) {
    query.year = String(filters.periodYear);
  }
  if (filters.measure !== DEFAULT_SALARY_INCOME_FILTERS.measure) {
    query.measure = filters.measure;
  }
  return query;
}

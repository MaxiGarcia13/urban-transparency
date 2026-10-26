import type { LocalEconomyFilters } from './local-economy-filters';
import {
  DEFAULT_LOCAL_ECONOMY_FILTERS,
  isDirceSectorCode,
  isSalaryIncomeMeasure,
} from './local-economy-filters';

export const LOCAL_ECONOMY_YEAR_QUERY_KEY = 'year' as const;
export const LOCAL_ECONOMY_SECTOR_QUERY_KEY = 'sector' as const;
export const LOCAL_ECONOMY_MEASURE_QUERY_KEY = 'measure' as const;

export function parseLocalEconomyFiltersFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): LocalEconomyFilters {
  const yearRaw
    = searchParams.get(LOCAL_ECONOMY_YEAR_QUERY_KEY)?.trim() ?? '';
  let periodYear: number | null = null;
  if (yearRaw) {
    const year = Number(yearRaw);
    if (Number.isInteger(year) && year >= 1900 && year <= 2100) {
      periodYear = year;
    }
  }

  const sectorRaw
    = searchParams.get(LOCAL_ECONOMY_SECTOR_QUERY_KEY)?.trim() ?? '';
  const sectorCode = isDirceSectorCode(sectorRaw)
    ? sectorRaw
    : DEFAULT_LOCAL_ECONOMY_FILTERS.sectorCode;

  const measureRaw
    = searchParams.get(LOCAL_ECONOMY_MEASURE_QUERY_KEY)?.trim() ?? '';
  const measure = isSalaryIncomeMeasure(measureRaw)
    ? measureRaw
    : DEFAULT_LOCAL_ECONOMY_FILTERS.measure;

  return { periodYear, sectorCode, measure };
}

export function serializeLocalEconomyFiltersQuery(
  filters: LocalEconomyFilters,
): { year?: string; sector?: string; measure?: string } {
  const query: { year?: string; sector?: string; measure?: string } = {};
  if (filters.periodYear != null) {
    query.year = String(filters.periodYear);
  }
  if (filters.sectorCode !== DEFAULT_LOCAL_ECONOMY_FILTERS.sectorCode) {
    query.sector = filters.sectorCode;
  }
  if (filters.measure !== DEFAULT_LOCAL_ECONOMY_FILTERS.measure) {
    query.measure = filters.measure;
  }
  return query;
}

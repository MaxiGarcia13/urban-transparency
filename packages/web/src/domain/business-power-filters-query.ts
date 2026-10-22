import type { BusinessPowerFilters } from './business-power-filters';
import {
  DEFAULT_BUSINESS_POWER_FILTERS,
  isDirceSectorCode,
} from './business-power-filters';

export const BUSINESS_POWER_YEAR_QUERY_KEY = 'year' as const;
export const BUSINESS_POWER_SECTOR_QUERY_KEY = 'sector' as const;

export function parseBusinessPowerFiltersFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): BusinessPowerFilters {
  const yearRaw = searchParams.get(BUSINESS_POWER_YEAR_QUERY_KEY)?.trim() ?? '';
  let periodYear: number | null = null;
  if (yearRaw) {
    const year = Number(yearRaw);
    if (Number.isInteger(year) && year >= 1900 && year <= 2100) {
      periodYear = year;
    }
  }

  const sectorRaw
    = searchParams.get(BUSINESS_POWER_SECTOR_QUERY_KEY)?.trim() ?? '';
  const sectorCode = isDirceSectorCode(sectorRaw)
    ? sectorRaw
    : DEFAULT_BUSINESS_POWER_FILTERS.sectorCode;

  return { periodYear, sectorCode };
}

export function serializeBusinessPowerFiltersQuery(
  filters: BusinessPowerFilters,
): { year?: string; sector?: string } {
  const query: { year?: string; sector?: string } = {};
  if (filters.periodYear != null) {
    query.year = String(filters.periodYear);
  }
  if (filters.sectorCode !== DEFAULT_BUSINESS_POWER_FILTERS.sectorCode) {
    query.sector = filters.sectorCode;
  }
  return query;
}

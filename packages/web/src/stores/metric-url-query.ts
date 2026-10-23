import { CANTABRIA_REGION_ID, MAP_REGIONS } from '@/config/regions';
import {
  BUSINESS_POWER_SECTOR_QUERY_KEY,
  BUSINESS_POWER_YEAR_QUERY_KEY,
  parseBusinessPowerFiltersFromSearchParams,
  serializeBusinessPowerFiltersQuery,
} from '@/domain/business-power-filters-query';
import {
  MAP_REGION_QUERY_KEY,
  parseMapRegionIdFromSearchParams,
  serializeMapRegionQuery,
} from '@/domain/map-region-query';
import {
  METRIC_VIEW_QUERY_KEY,
  parseMetricViewFromSearchParams,
  serializeMetricViewQuery,
} from '@/domain/metric-view-query';
import {
  parsePublicContractFiltersFromSearchParams,
  serializePublicContractFiltersQuery,
} from '@/domain/public-contract-filters-query';
import {
  parseSalaryIncomeFiltersFromSearchParams,
  SALARY_INCOME_MEASURE_QUERY_KEY,
  SALARY_INCOME_YEAR_QUERY_KEY,
  serializeSalaryIncomeFiltersQuery,
} from '@/domain/salary-income-filters-query';
import { $businessPowerFilters } from './business-power-filters';
import { $metricView } from './metric-view';
import { $publicContractFilters } from './public-contract-filters';
import { $regionId } from './region';
import { $salaryIncomeFilters } from './salary-income-filters';

const KNOWN_REGION_IDS = MAP_REGIONS.map((region) => region.id);
const DEFAULT_VIEW = 'map' as const;

export const METRIC_URL_QUERY_KEYS = [
  MAP_REGION_QUERY_KEY,
  METRIC_VIEW_QUERY_KEY,
  'q',
  'status',
  'yearFrom',
  'yearTo',
  BUSINESS_POWER_YEAR_QUERY_KEY,
  BUSINESS_POWER_SECTOR_QUERY_KEY,
  SALARY_INCOME_YEAR_QUERY_KEY,
  SALARY_INCOME_MEASURE_QUERY_KEY,
] as const;

export function hydrateMetricStoresFromUrl(
  searchParams?: Pick<URLSearchParams, 'get'>,
): void {
  const params
    = searchParams
      ?? (typeof window !== 'undefined'
        ? new URL(window.location.href).searchParams
        : null);
  if (params == null) {
    return;
  }

  $regionId.set(
    parseMapRegionIdFromSearchParams(
      params,
      KNOWN_REGION_IDS,
      CANTABRIA_REGION_ID,
    ),
  );
  $metricView.set(
    parseMetricViewFromSearchParams(params, DEFAULT_VIEW, true),
  );
  $publicContractFilters.set(
    parsePublicContractFiltersFromSearchParams(params),
  );
  $businessPowerFilters.set(
    parseBusinessPowerFiltersFromSearchParams(params),
  );
  $salaryIncomeFilters.set(
    parseSalaryIncomeFiltersFromSearchParams(params),
  );
}

export function buildMetricQueryString(): string {
  const params = new URLSearchParams();

  const region = serializeMapRegionQuery(
    $regionId.get(),
    KNOWN_REGION_IDS,
    CANTABRIA_REGION_ID,
  );
  if (region.region) {
    params.set(MAP_REGION_QUERY_KEY, region.region);
  }

  const view = serializeMetricViewQuery($metricView.get(), DEFAULT_VIEW);
  if (view.view) {
    params.set(METRIC_VIEW_QUERY_KEY, view.view);
  }

  const contractFilters = serializePublicContractFiltersQuery(
    $publicContractFilters.get(),
  );
  if (contractFilters.q) {
    params.set('q', contractFilters.q);
  }
  if (contractFilters.status) {
    params.set('status', contractFilters.status);
  }
  if (contractFilters.yearFrom) {
    params.set('yearFrom', contractFilters.yearFrom);
  }
  if (contractFilters.yearTo) {
    params.set('yearTo', contractFilters.yearTo);
  }

  const businessFilters = serializeBusinessPowerFiltersQuery(
    $businessPowerFilters.get(),
  );
  if (businessFilters.year) {
    params.set(BUSINESS_POWER_YEAR_QUERY_KEY, businessFilters.year);
  }
  if (businessFilters.sector) {
    params.set(BUSINESS_POWER_SECTOR_QUERY_KEY, businessFilters.sector);
  }

  const salaryFilters = serializeSalaryIncomeFiltersQuery(
    $salaryIncomeFilters.get(),
  );
  if (salaryFilters.year) {
    params.set(SALARY_INCOME_YEAR_QUERY_KEY, salaryFilters.year);
  }
  if (salaryFilters.measure) {
    params.set(SALARY_INCOME_MEASURE_QUERY_KEY, salaryFilters.measure);
  }

  return params.toString();
}

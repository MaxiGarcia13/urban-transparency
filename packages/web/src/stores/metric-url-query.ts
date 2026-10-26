import { CANTABRIA_REGION_ID, MAP_REGIONS } from '@/config/regions';
import {
  LOCAL_ECONOMY_MEASURE_QUERY_KEY,
  LOCAL_ECONOMY_SECTOR_QUERY_KEY,
  LOCAL_ECONOMY_YEAR_QUERY_KEY,
  parseLocalEconomyFiltersFromSearchParams,
  serializeLocalEconomyFiltersQuery,
} from '@/domain/local-economy-filters-query';
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
import { $localEconomyFilters } from './local-economy-filters';
import { $metricView } from './metric-view';
import { $publicContractFilters } from './public-contract-filters';
import { $regionId } from './region';

const KNOWN_REGION_IDS = MAP_REGIONS.map((region) => region.id);
const DEFAULT_VIEW = 'map' as const;

export const METRIC_URL_QUERY_KEYS = [
  MAP_REGION_QUERY_KEY,
  METRIC_VIEW_QUERY_KEY,
  'q',
  'status',
  'yearFrom',
  'yearTo',
  LOCAL_ECONOMY_YEAR_QUERY_KEY,
  LOCAL_ECONOMY_SECTOR_QUERY_KEY,
  LOCAL_ECONOMY_MEASURE_QUERY_KEY,
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
  $localEconomyFilters.set(
    parseLocalEconomyFiltersFromSearchParams(params),
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

  const economyFilters = serializeLocalEconomyFiltersQuery(
    $localEconomyFilters.get(),
  );
  if (economyFilters.year) {
    params.set(LOCAL_ECONOMY_YEAR_QUERY_KEY, economyFilters.year);
  }
  if (economyFilters.sector) {
    params.set(LOCAL_ECONOMY_SECTOR_QUERY_KEY, economyFilters.sector);
  }
  if (economyFilters.measure) {
    params.set(LOCAL_ECONOMY_MEASURE_QUERY_KEY, economyFilters.measure);
  }

  return params.toString();
}

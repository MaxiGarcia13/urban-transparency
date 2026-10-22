import { CANTABRIA_REGION_ID, MAP_REGIONS } from '@/config/regions';
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
] as const;

export function hydrateMetricStoresFromUrl(
  searchParams: Pick<URLSearchParams, 'get'> = new URL(
    window.location.href,
  ).searchParams,
): void {
  $regionId.set(
    parseMapRegionIdFromSearchParams(
      searchParams,
      KNOWN_REGION_IDS,
      CANTABRIA_REGION_ID,
    ),
  );
  $metricView.set(
    parseMetricViewFromSearchParams(searchParams, DEFAULT_VIEW, true),
  );
  $publicContractFilters.set(
    parsePublicContractFiltersFromSearchParams(searchParams),
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

  const filters = serializePublicContractFiltersQuery(
    $publicContractFilters.get(),
  );
  if (filters.q) {
    params.set('q', filters.q);
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.yearFrom) {
    params.set('yearFrom', filters.yearFrom);
  }
  if (filters.yearTo) {
    params.set('yearTo', filters.yearTo);
  }

  return params.toString();
}

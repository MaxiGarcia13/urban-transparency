import { listenKeys } from 'nanostores';
import { $businessPowerFilters } from './business-power-filters';
import {
  buildMetricQueryString,
  hydrateMetricStoresFromUrl,
  METRIC_URL_QUERY_KEYS,
} from './metric-url-query';
import { $metricView } from './metric-view';
import { $publicContractFilters } from './public-contract-filters';
import { $regionId } from './region';

const SEARCH_QUERY_DEBOUNCE_MS = 300;

let syncStarted = false;
let searchWriteTimer: ReturnType<typeof setTimeout> | null = null;

function writeStoresToUrl(): void {
  const url = new URL(window.location.href);
  for (const key of METRIC_URL_QUERY_KEYS) {
    url.searchParams.delete(key);
  }
  for (const [key, value] of new URLSearchParams(buildMetricQueryString())) {
    url.searchParams.set(key, value);
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) {
    return;
  }
  window.history.replaceState(window.history.state, '', next);
}

function writeStoresToUrlDebounced(): void {
  if (searchWriteTimer != null) {
    clearTimeout(searchWriteTimer);
  }
  searchWriteTimer = setTimeout(() => {
    searchWriteTimer = null;
    writeStoresToUrl();
  }, SEARCH_QUERY_DEBOUNCE_MS);
}

export function ensureMetricUrlStateSync(): void {
  if (syncStarted || typeof window === 'undefined') {
    return;
  }
  syncStarted = true;

  hydrateMetricStoresFromUrl();

  $regionId.listen(writeStoresToUrl);
  $metricView.listen(writeStoresToUrl);
  listenKeys(
    $publicContractFilters,
    ['statuses', 'yearFrom', 'yearTo'],
    writeStoresToUrl,
  );
  listenKeys(
    $publicContractFilters,
    ['searchQuery'],
    writeStoresToUrlDebounced,
  );
  listenKeys(
    $businessPowerFilters,
    ['periodYear', 'sectorCode'],
    writeStoresToUrl,
  );

  // Store wins across soft nav — put params back on the new path.
  document.addEventListener('astro:after-swap', writeStoresToUrl);
}

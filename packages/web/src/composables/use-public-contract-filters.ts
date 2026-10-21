import type { PublicContractStatus } from '@urban-transparency/shared';
import type { PublicContractFilters } from '@/domain/filter-public-contracts';
import type { PublicContractFiltersUrlParams } from '@/domain/public-contract-filters-query';
import { useUrlSearchParams, watchDebounced } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import {
  parsePublicContractFiltersQuery,

  serializePublicContractFiltersQuery,
} from '@/domain/public-contract-filters-query';

const SEARCH_QUERY_DEBOUNCE_MS = 300;

function writeFiltersToParams(
  params: PublicContractFiltersUrlParams,
  filters: PublicContractFilters,
): void {
  const serialized = serializePublicContractFiltersQuery(filters);
  params.q = serialized.q ?? null;
  params.status = serialized.status ?? null;
  params.yearFrom = serialized.yearFrom ?? null;
  params.yearTo = serialized.yearTo ?? null;
}

export function usePublicContractFilters() {
  const params = useUrlSearchParams<PublicContractFiltersUrlParams>('history', {
    removeNullishValues: true,
    removeFalsyValues: true,
    writeMode: 'replace',
  });

  const initial = parsePublicContractFiltersQuery(params);

  const searchQuery = ref(initial.searchQuery);
  const selectedStatuses = ref<PublicContractStatus[]>([...initial.statuses]);
  const yearFrom = ref<number | null>(initial.yearFrom);
  const yearTo = ref<number | null>(initial.yearTo);

  const filters = computed<PublicContractFilters>(() => ({
    searchQuery: searchQuery.value,
    statuses: selectedStatuses.value,
    yearFrom: yearFrom.value,
    yearTo: yearTo.value,
  }));

  watchDebounced(
    searchQuery,
    () => {
      writeFiltersToParams(params, filters.value);
    },
    { debounce: SEARCH_QUERY_DEBOUNCE_MS },
  );

  watch(
    [selectedStatuses, yearFrom, yearTo],
    () => {
      writeFiltersToParams(params, filters.value);
    },
    { deep: true },
  );

  return {
    searchQuery,
    selectedStatuses,
    yearFrom,
    yearTo,
    filters,
  };
}

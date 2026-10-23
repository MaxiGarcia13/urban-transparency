import type { PublicContractStatus } from '@urban-transparency/shared';
import type { PublicContractFilters } from '@/domain/filter-public-contracts';
import { useStore } from '@nanostores/vue';
import { computed } from 'vue';
import { $publicContractFilters } from '@/stores/public-contract-filters';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';

export function usePublicContractFilters() {
  ensureMetricUrlStateSync();

  const store = useStore($publicContractFilters);

  const filters = computed((): PublicContractFilters => store.value);

  const searchQuery = computed({
    get: () => filters.value.searchQuery,
    set: (value: string) => {
      $publicContractFilters.setKey('searchQuery', value);
    },
  });

  const selectedStatuses = computed({
    get: (): PublicContractStatus[] => [...filters.value.statuses],
    set: (value: PublicContractStatus[]) => {
      $publicContractFilters.setKey('statuses', value);
    },
  });

  const yearFrom = computed({
    get: () => filters.value.yearFrom,
    set: (value: number | null) => {
      $publicContractFilters.setKey('yearFrom', value);
    },
  });

  const yearTo = computed({
    get: () => filters.value.yearTo,
    set: (value: number | null) => {
      $publicContractFilters.setKey('yearTo', value);
    },
  });

  return {
    searchQuery,
    selectedStatuses,
    yearFrom,
    yearTo,
    filters,
  };
}

import type { DirceSectorCode } from '@urban-transparency/shared';
import type { LocalEconomyFilters } from '@/domain/local-economy-filters';
import type { SalaryIncomeMeasure } from '@/domain/salary-income-filters';
import { useStore } from '@nanostores/vue';
import { computed } from 'vue';
import { $localEconomyFilters } from '@/stores/local-economy-filters';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';

export function useLocalEconomyFilters() {
  ensureMetricUrlStateSync();

  const store = useStore($localEconomyFilters);

  const filters = computed((): LocalEconomyFilters => store.value);

  const periodYear = computed({
    get: () => filters.value.periodYear,
    set: (value: number | null) => {
      $localEconomyFilters.setKey('periodYear', value);
    },
  });

  const sectorCode = computed({
    get: () => filters.value.sectorCode,
    set: (value: DirceSectorCode) => {
      $localEconomyFilters.setKey('sectorCode', value);
    },
  });

  const measure = computed({
    get: () => filters.value.measure,
    set: (value: SalaryIncomeMeasure) => {
      $localEconomyFilters.setKey('measure', value);
    },
  });

  return {
    filters,
    periodYear,
    sectorCode,
    measure,
  };
}

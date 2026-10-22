import type { DirceSectorCode } from '@urban-transparency/shared';
import type { BusinessPowerFilters } from '@/domain/business-power-filters';
import { useStore } from '@nanostores/vue';
import { computed } from 'vue';
import { $businessPowerFilters } from '@/stores/business-power-filters';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';
import { useClientHydrated } from './use-client-hydrated';

export function useBusinessPowerFilters(
  ssrFilters?: BusinessPowerFilters,
) {
  ensureMetricUrlStateSync();

  const hydrated = useClientHydrated();
  const store = useStore($businessPowerFilters);

  const filters = computed((): BusinessPowerFilters =>
    hydrated.value
      ? store.value
      : (ssrFilters ?? store.value),
  );

  const periodYear = computed({
    get: () => filters.value.periodYear,
    set: (value: number | null) => {
      $businessPowerFilters.setKey('periodYear', value);
    },
  });

  const sectorCode = computed({
    get: () => filters.value.sectorCode,
    set: (value: DirceSectorCode) => {
      $businessPowerFilters.setKey('sectorCode', value);
    },
  });

  return {
    filters,
    periodYear,
    sectorCode,
  };
}

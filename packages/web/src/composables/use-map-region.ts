import { useStore } from '@nanostores/vue';
import { computed } from 'vue';
import { $regionId } from '@/stores/region';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';
import { useClientHydrated } from './use-client-hydrated';

export function useMapRegion(ssrRegionId?: string) {
  ensureMetricUrlStateSync();

  const hydrated = useClientHydrated();
  const state = useStore($regionId);
  const regionId = computed({
    get: () =>
      hydrated.value
        ? state.value
        : (ssrRegionId ?? state.value),
    set: (value: string) => {
      $regionId.set(value);
    },
  });

  return { regionId };
}

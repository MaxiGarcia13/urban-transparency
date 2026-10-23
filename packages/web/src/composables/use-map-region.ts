import { useStore } from '@nanostores/vue';
import { computed } from 'vue';
import { $regionId } from '@/stores/region';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';

export function useMapRegion() {
  ensureMetricUrlStateSync();

  const state = useStore($regionId);
  const regionId = computed({
    get: () => state.value,
    set: (value: string) => {
      $regionId.set(value);
    },
  });

  return { regionId };
}

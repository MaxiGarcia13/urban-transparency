import type { MetricView } from '@/config/metrics';
import { useStore } from '@nanostores/vue';
import { computed } from 'vue';
import { $metricView } from '@/stores/metric-view';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';

export function useMetricView(supportsMap = true) {
  ensureMetricUrlStateSync();

  const state = useStore($metricView);
  const view = computed({
    get: () => state.value,
    set: (value: MetricView) => {
      if (value === 'map' && !supportsMap) {
        $metricView.set('list');
        return;
      }
      $metricView.set(value);
    },
  });

  return { view };
}

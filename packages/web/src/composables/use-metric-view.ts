import type { MetricView } from '@/config/metrics';
import { useStore } from '@nanostores/vue';
import { computed } from 'vue';
import { $metricView } from '@/stores/metric-view';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';
import { useClientHydrated } from './use-client-hydrated';

export function useMetricView(
  supportsMap = true,
  ssrView?: MetricView,
) {
  ensureMetricUrlStateSync();

  const hydrated = useClientHydrated();
  const state = useStore($metricView);
  const view = computed({
    get: () =>
      hydrated.value
        ? state.value
        : (ssrView ?? state.value),
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

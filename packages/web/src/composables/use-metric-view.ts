import type { MetricView } from '@/config/metrics';
import { ref, watch } from 'vue';
import {
  METRIC_VIEW_QUERY_KEY,
  parseMetricViewQuery,
  serializeMetricViewQuery,
} from '@/domain/metric-view-query';
import { useAppUrlSearchParams } from './use-app-url-search-params';

export function useMetricView(
  defaultView: MetricView,
  supportsMap: boolean,
) {
  const params = useAppUrlSearchParams();
  const view = ref<MetricView>(
    parseMetricViewQuery(params, defaultView, supportsMap),
  );

  watch(view, (nextView) => {
    if (nextView === 'map' && !supportsMap) {
      view.value = 'list';
      return;
    }
    const serialized = serializeMetricViewQuery(nextView, defaultView);
    params[METRIC_VIEW_QUERY_KEY] = serialized.view ?? null;
  });

  return { view };
}

import type { MetricId } from '@/config/metrics';
import { onMounted, onUnmounted, ref } from 'vue';
import { getMetricById } from '@/config/metrics';
import { PRODUCT_NAME } from '@/config/product';
import { CANTABRIA_REGION_ID } from '@/config/regions';

const DOCUMENT_TITLE_BY_METRIC: Record<MetricId, string> = {
  'public-spending': `${PRODUCT_NAME} - Spain`,
  'business-power': `${PRODUCT_NAME} - Poder empresarial`,
};

function metricIdFromPath(pathname: string): MetricId {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/business-power') {
    return 'business-power';
  }
  return 'public-spending';
}

function buildMetricUrl(metricId: MetricId): string {
  const metric = getMetricById(metricId);
  const url = new URL(metric.path, window.location.origin);
  const current = new URLSearchParams(window.location.search);
  const region = current.get('region');
  if (region && region !== CANTABRIA_REGION_ID) {
    url.searchParams.set('region', region);
  }
  if (metricId === 'public-spending') {
    const view = current.get('view');
    if (view === 'list' || view === 'map') {
      url.searchParams.set('view', view);
    }
  }
  const search = url.searchParams.toString();
  return search ? `${url.pathname}?${search}` : url.pathname;
}

function applyDocumentTitle(metricId: MetricId): void {
  document.title = DOCUMENT_TITLE_BY_METRIC[metricId];
}

export function useMetricRoute() {
  const metricId = ref<MetricId>(
    typeof window === 'undefined'
      ? 'public-spending'
      : metricIdFromPath(window.location.pathname),
  );

  function syncFromLocation(): void {
    metricId.value = metricIdFromPath(window.location.pathname);
    applyDocumentTitle(metricId.value);
  }

  function navigateToMetric(nextMetricId: MetricId): void {
    if (nextMetricId === metricId.value) {
      return;
    }
    window.history.pushState({}, '', buildMetricUrl(nextMetricId));
    metricId.value = nextMetricId;
    applyDocumentTitle(nextMetricId);
  }

  onMounted(() => {
    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
  });

  onUnmounted(() => {
    window.removeEventListener('popstate', syncFromLocation);
  });

  return { metricId, navigateToMetric };
}

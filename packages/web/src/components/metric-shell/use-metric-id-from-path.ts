import type { MetricId } from '@/config/metrics';
import { onMounted, onUnmounted, ref } from 'vue';
import { metricIdFromPath } from '@/config/metrics';

export function useMetricIdFromPath(initialMetricId: MetricId) {
  const metricId = ref<MetricId>(initialMetricId);

  function syncFromLocation(): void {
    metricId.value = metricIdFromPath(window.location.pathname);
  }

  onMounted(() => {
    syncFromLocation();
    document.addEventListener('astro:after-swap', syncFromLocation);
    document.addEventListener('astro:page-load', syncFromLocation);
  });

  onUnmounted(() => {
    document.removeEventListener('astro:after-swap', syncFromLocation);
    document.removeEventListener('astro:page-load', syncFromLocation);
  });

  return { metricId, syncFromLocation };
}

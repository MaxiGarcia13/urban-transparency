import type { Ref } from 'vue';
import { useStore } from '@nanostores/vue';
import { useMediaQuery, useResizeObserver } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';
import { $metricAsideCollapsed } from '@/stores/metric-aside-ui';

const ASIDE_OFFSET_CSS_VAR = '--metric-aside-offset';
const PANEL_SELECTOR = '[data-metric-aside-panel]';

export function useMobilePanelCollapse(
  asideRoot: Ref<HTMLElement | null | undefined>,
) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isPanelCollapsed = useStore($metricAsideCollapsed);
  const panelElement = ref<HTMLElement | null>(null);
  const mobilePanelHeight = ref(0);

  onMounted(() => {
    panelElement.value
      = asideRoot.value?.closest<HTMLElement>(PANEL_SELECTOR) ?? null;
  });

  const observedPanel = computed(() => panelElement.value);

  useResizeObserver(observedPanel, (entries) => {
    const entry = entries[0];
    if (!entry) {
      return;
    }
    mobilePanelHeight.value = entry.borderBoxSize?.[0]?.blockSize
      ?? entry.contentRect.height;
  });

  watch(
    [mobilePanelHeight, isDesktop, isPanelCollapsed],
    ([height, desktop]) => {
      if (typeof document === 'undefined') {
        return;
      }
      if (desktop) {
        document.documentElement.style.removeProperty(ASIDE_OFFSET_CSS_VAR);
        return;
      }
      // Overlay wrapper uses p-4 (16px) above the panel.
      document.documentElement.style.setProperty(
        ASIDE_OFFSET_CSS_VAR,
        `${height + 16}px`,
      );
    },
    { immediate: true },
  );

  function togglePanelCollapsed(): void {
    $metricAsideCollapsed.set(!$metricAsideCollapsed.get());
  }

  return {
    isPanelCollapsed,
    togglePanelCollapsed,
  };
}

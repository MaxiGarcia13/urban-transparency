import type { ComponentPublicInstance } from 'vue';
import { useMediaQuery, useResizeObserver } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';

function resolvePanelElement(
  instance: ComponentPublicInstance | HTMLElement | null,
): HTMLElement | null {
  if (instance instanceof HTMLElement) {
    return instance;
  }
  const el = instance?.$el;
  return el instanceof HTMLElement ? el : null;
}

export function useMobilePanelCollapse() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isPanelCollapsed = ref(false);
  const mobilePanel = useTemplateRef<ComponentPublicInstance | HTMLElement>('mobilePanel');
  const mobilePanelHeight = ref(0);

  useResizeObserver(
    () => resolvePanelElement(mobilePanel.value),
    (entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      mobilePanelHeight.value = entry.borderBoxSize?.[0]?.blockSize
        ?? entry.contentRect.height;
    },
  );

  // Keep the panel floating over the map; only inset the list so cards clear it.
  const mobileListOffsetStyle = computed(() => {
    if (isDesktop.value) {
      return undefined;
    }
    // Overlay wrapper uses p-4 (16px) above the panel.
    const offsetPx = mobilePanelHeight.value + 16;
    if (offsetPx <= 16) {
      return undefined;
    }
    return { paddingTop: `${offsetPx}px` };
  });

  function togglePanelCollapsed(): void {
    isPanelCollapsed.value = !isPanelCollapsed.value;
  }

  return {
    isPanelCollapsed,
    mobilePanel,
    mobileListOffsetStyle,
    togglePanelCollapsed,
  };
}

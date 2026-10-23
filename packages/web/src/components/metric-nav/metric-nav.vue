<script setup lang="ts">
import type { Component } from 'vue';
import type { MetricId } from '@/config/metrics';
import { useStore } from '@nanostores/vue';
import { PhBuildings, PhCaretDown, PhCaretUp, PhCoins } from '@phosphor-icons/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { metricIdFromPath, METRICS } from '@/config/metrics';
import { PRODUCT_NAME } from '@/config/product';
import { cn } from '@/lib/utils';
import { $metricAsideCollapsed } from '@/stores/metric-aside-ui';
import { buildMetricQueryString } from '@/stores/metric-url-query';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';

const props = defineProps<{
  activeMetricId: MetricId;
}>();

ensureMetricUrlStateSync();

const METRIC_ICONS: Record<MetricId, Component> = {
  'public-spending': PhCoins,
  'business-power': PhBuildings,
};

const isPanelCollapsed = useStore($metricAsideCollapsed);

const activeMetricId = ref(props.activeMetricId);

function syncActiveMetricFromPath(): void {
  activeMetricId.value = metricIdFromPath(window.location.pathname);
}

onMounted(() => {
  syncActiveMetricFromPath();
  document.addEventListener('astro:page-load', syncActiveMetricFromPath);
});

onUnmounted(() => {
  document.removeEventListener('astro:page-load', syncActiveMetricFromPath);
});

const navItems = computed(() =>
  METRICS.map((metric) => ({
    id: metric.id,
    path: metric.path,
    label: metric.navLabel,
    icon: METRIC_ICONS[metric.id],
    isActive: metric.id === activeMetricId.value,
  })),
);

function togglePanelCollapsed(): void {
  $metricAsideCollapsed.set(!$metricAsideCollapsed.get());
}

function stampMetricQuery(event: MouseEvent, path: string): void {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  if (event.button !== 0) {
    return;
  }
  const target = event.currentTarget;
  if (!(target instanceof HTMLAnchorElement)) {
    return;
  }
  const query = buildMetricQueryString();
  target.href = query ? `${path}?${query}` : path;
}
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-4 md:gap-4 md:px-8"
    :class="isPanelCollapsed ? 'border-b-0' : ''"
  >
    <div class="flex min-w-0 items-center gap-2">
      <img
        src="/android-chrome-192x192.png"
        alt=""
        width="40"
        height="40"
        class="size-10 shrink-0"
        decoding="async"
      >
      <p class="truncate text-xs font-medium tracking-wide text-orange-300 uppercase md:text-sm">
        {{ PRODUCT_NAME }}
      </p>
    </div>

    <nav
      class="ml-auto flex shrink-0 items-center gap-2"
      aria-label="Métricas"
    >
      <a
        v-for="item in navItems"
        :key="item.id"
        :href="item.path"
        data-astro-prefetch
        :aria-label="item.label"
        :aria-current="item.isActive ? 'page' : undefined"
        :title="item.label"
        :class="cn(
          'inline-flex items-center justify-center rounded-xl px-2 py-2 transition-colors md:px-4',
          item.isActive
            ? 'bg-white/10 text-foreground'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
        )"
        @click="stampMetricQuery($event, item.path)"
      >
        <component
          :is="item.icon"
          class="size-5 shrink-0"
          aria-hidden="true"
        />
      </a>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground lg:hidden"
        :aria-expanded="!isPanelCollapsed"
        :aria-label="isPanelCollapsed ? 'Expandir panel' : 'Contraer panel'"
        @click="togglePanelCollapsed"
      >
        <PhCaretDown
          v-if="isPanelCollapsed"
          class="size-5"
        />
        <PhCaretUp
          v-else
          class="size-5"
        />
      </Button>
    </nav>
  </div>
</template>

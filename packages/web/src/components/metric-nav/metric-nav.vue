<script setup lang="ts">
import type { Component } from 'vue';
import type { MetricId } from '@/config/metrics';
import { PhBuildings, PhCoins } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { METRICS } from '@/config/metrics';
import { PRODUCT_NAME } from '@/config/product';
import { CANTABRIA_REGION_ID } from '@/config/regions';
import { cn } from '@/lib/utils';

const props = defineProps<{
  activeMetricId: MetricId;
  regionId: string;
}>();

const emit = defineEmits<{
  navigate: [metricId: MetricId];
}>();

const METRIC_ICONS: Record<MetricId, Component> = {
  'public-spending': PhCoins,
  'business-power': PhBuildings,
};

const navItems = computed(() =>
  METRICS.map((metric) => {
    const params = new URLSearchParams();
    if (props.regionId !== CANTABRIA_REGION_ID) {
      params.set('region', props.regionId);
    }
    const query = params.toString();
    return {
      id: metric.id,
      label: metric.navLabel,
      icon: METRIC_ICONS[metric.id],
      href: query ? `${metric.path}?${query}` : metric.path,
      isActive: metric.id === props.activeMetricId,
    };
  }),
);

function onNavClick(event: MouseEvent, metricId: MetricId): void {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
  ) {
    return;
  }
  event.preventDefault();
  emit('navigate', metricId);
}
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-4 md:gap-4 md:px-8"
  >
    <div class="flex min-w-0 items-center gap-2">
      <img
        src="/android-chrome-192x192.png"
        alt=""
        width="32"
        height="32"
        class="size-6 shrink-0 md:size-8"
        decoding="async"
      >
      <p class="hidden truncate text-xs font-medium tracking-wide text-orange-300 uppercase md:block md:text-sm">
        {{ PRODUCT_NAME }}
      </p>
    </div>

    <nav
      class="ml-auto flex shrink-0 gap-2"
      aria-label="Métricas"
    >
      <a
        v-for="item in navItems"
        :key="item.id"
        :href="item.href"
        :aria-label="item.label"
        :aria-current="item.isActive ? 'page' : undefined"
        :title="item.label"
        :class="cn(
          'inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors md:px-4',
          item.isActive
            ? 'bg-white/10 text-foreground'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
        )"
        @click="onNavClick($event, item.id)"
      >
        <component
          :is="item.icon"
          class="size-5 shrink-0"
          aria-hidden="true"
        />
        <span class="hidden md:inline">{{ item.label }}</span>
      </a>
    </nav>
  </div>
</template>

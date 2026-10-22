<script setup lang="ts">
import type { Component } from 'vue';
import type { MetricId } from '@/config/metrics';
import { PhBuildings, PhCaretDown, PhCaretUp, PhCoins } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { METRICS } from '@/config/metrics';
import { PRODUCT_NAME } from '@/config/product';
import { CANTABRIA_REGION_ID } from '@/config/regions';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    activeMetricId: MetricId;
    regionId: string;
    collapsible?: boolean;
    collapsed?: boolean;
  }>(),
  {
    collapsible: false,
    collapsed: false,
  },
);

const emit = defineEmits<{
  navigate: [metricId: MetricId];
  toggleCollapsed: [];
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
    :class="collapsed ? 'border-b-0' : ''"
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
        :href="item.href"
        :aria-label="item.label"
        :aria-current="item.isActive ? 'page' : undefined"
        :title="item.label"
        :class="cn(
          'inline-flex items-center justify-center rounded-xl px-2 py-2 transition-colors md:px-4',
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
      </a>

      <Button
        v-if="collapsible"
        type="button"
        variant="ghost"
        size="icon"
        class="size-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground lg:hidden"
        :aria-expanded="!collapsed"
        :aria-label="collapsed ? 'Expandir panel' : 'Contraer panel'"
        @click="emit('toggleCollapsed')"
      >
        <PhCaretDown
          v-if="collapsed"
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

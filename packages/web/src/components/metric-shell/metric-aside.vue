<script setup lang="ts">
import type { MetricId } from '@/config/metrics';
import { computed, useTemplateRef } from 'vue';
import LandingHeroRegionSelect from '@/components/landing-hero/landing-hero-region-select.vue';
import { useMapRegion } from '@/composables/use-map-region';
import { getMetricById } from '@/config/metrics';
import { useMobilePanelCollapse } from './use-mobile-panel-collapse';

const props = defineProps<{
  metricId: MetricId;
  regionId: string;
}>();

const asideRoot = useTemplateRef<HTMLElement>('asideRoot');
const { isPanelCollapsed } = useMobilePanelCollapse(asideRoot);

const metric = computed(() => getMetricById(props.metricId));
const { regionId } = useMapRegion(props.regionId);
</script>

<template>
  <div
    ref="asideRoot"
    class="flex shrink-0 flex-col"
  >
    <div
      v-show="!isPanelCollapsed"
      class="flex shrink-0 flex-col gap-2 p-4 text-zinc-100 sm:gap-4 md:gap-6 md:p-8"
    >
      <div class="flex flex-col gap-2 md:gap-4">
        <h1 class="max-w-md text-2xl leading-tight font-semibold text-balance md:text-5xl">
          {{ metric.titleLead }}
          <span :class="metric.titleHighlightClass">{{ metric.titleHighlight }}</span>
          en
          <LandingHeroRegionSelect v-model:region-id="regionId" />
          ?
        </h1>
        <p class="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
          <slot name="description" />
        </p>
      </div>

      <slot />
    </div>
  </div>
</template>

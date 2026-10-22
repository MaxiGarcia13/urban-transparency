<script setup lang="ts">
import type { PublicContractStatus } from '@urban-transparency/shared';
import type { MetricId } from '@/config/metrics';
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { LandingHero } from '@/components/landing-hero';
import { MetricNav } from '@/components/metric-nav';
import { getMetricById } from '@/config/metrics';

defineProps<{
  isPanelCollapsed: boolean;
  spending: MunicipalSpending | null;
  isLoading: boolean;
  availableYears: number[];
}>();

const emit = defineEmits<{
  navigateMetric: [metricId: MetricId];
  toggleCollapsed: [];
}>();

const searchQuery = defineModel<string>('searchQuery', { required: true });
const selectedStatuses = defineModel<PublicContractStatus[]>('selectedStatuses', {
  required: true,
});
const yearFrom = defineModel<number | null>('yearFrom', { required: true });
const yearTo = defineModel<number | null>('yearTo', { required: true });
const regionId = defineModel<string>('regionId', { required: true });

const metric = getMetricById('public-spending');
</script>

<template>
  <div
    class="pointer-events-auto flex max-h-[min(70dvh,100%)] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-lg backdrop-blur-md lg:h-full lg:max-h-none lg:rounded-none lg:border-0 lg:bg-zinc-950 lg:shadow-none lg:backdrop-blur-none"
  >
    <MetricNav
      active-metric-id="public-spending"
      :region-id="regionId"
      collapsible
      :collapsed="isPanelCollapsed"
      @navigate="emit('navigateMetric', $event)"
      @toggle-collapsed="emit('toggleCollapsed')"
    />
    <LandingHero
      v-show="!isPanelCollapsed"
      v-model:search-query="searchQuery"
      v-model:selected-statuses="selectedStatuses"
      v-model:year-from="yearFrom"
      v-model:year-to="yearTo"
      v-model:region-id="regionId"
      :spending="spending"
      :is-loading="isLoading"
      :available-years="availableYears"
      :title-highlight="metric.titleHighlight"
      :title-highlight-class="metric.titleHighlightClass"
    />
  </div>
</template>

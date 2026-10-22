<script setup lang="ts">
import type { MetricId } from '@/config/metrics';
import { computed, ref } from 'vue';
import LandingHeroRegionSelect from '@/components/landing-hero/landing-hero-region-select.vue';
import { MetricNav } from '@/components/metric-nav';
import { useMapRegion } from '@/composables/use-map-region';
import { getMetricById } from '@/config/metrics';
import { getMapRegionById } from '@/config/regions';

const emit = defineEmits<{
  navigateMetric: [metricId: MetricId];
}>();

const metric = getMetricById('business-power');
const { regionId } = useMapRegion();
const regionName = computed(() => getMapRegionById(regionId.value).name);
const isPanelCollapsed = ref(false);

function togglePanelCollapsed(): void {
  isPanelCollapsed.value = !isPanelCollapsed.value;
}
</script>

<template>
  <div class="relative h-dvh overflow-hidden bg-zinc-950 lg:flex lg:flex-row">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 lg:pointer-events-auto lg:static lg:inset-auto lg:flex lg:h-full lg:w-md lg:shrink-0 lg:border-r lg:border-white/10 lg:p-0"
    >
      <div
        class="pointer-events-auto flex max-h-[min(70dvh,100%)] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-lg backdrop-blur-md lg:h-full lg:max-h-none lg:rounded-none lg:border-0 lg:bg-zinc-950 lg:shadow-none lg:backdrop-blur-none"
      >
        <MetricNav
          active-metric-id="business-power"
          :region-id="regionId"
          collapsible
          :collapsed="isPanelCollapsed"
          @navigate="emit('navigateMetric', $event)"
          @toggle-collapsed="togglePanelCollapsed"
        />

        <div
          v-show="!isPanelCollapsed"
          class="flex shrink-0 flex-col gap-2 p-4 sm:gap-4 md:gap-6 md:p-8"
        >
          <div class="flex flex-col gap-2 md:gap-4">
            <h1 class="max-w-md text-2xl leading-tight font-semibold text-balance md:text-5xl">
              ¿Dónde se concentra la
              <span :class="metric.titleHighlightClass">{{ metric.titleHighlight }}</span>
              en
              <LandingHeroRegionSelect v-model:region-id="regionId" />
              ?
            </h1>
            <p class="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              Empresas activas por municipio en
              {{ regionName }}
              (DIRCE).
            </p>
          </div>

          <p class="text-sm text-muted-foreground md:text-base">
            Próximamente
          </p>
        </div>
      </div>
    </div>

    <div class="relative h-full min-h-0 w-full bg-zinc-950 lg:flex-1" />
  </div>
</template>

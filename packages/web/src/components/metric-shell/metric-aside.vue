<script setup lang="ts">
import type { MetricId } from '@/config/metrics';
import type { PublicContractFilters } from '@/domain/filter-public-contracts';
import { computed, useTemplateRef } from 'vue';
import LandingHeroRegionSelect from '@/components/landing-hero/landing-hero-region-select.vue';
import LandingHeroSpendingSummary from '@/components/landing-hero/landing-hero-spending-summary.vue';
import { useMapRegion } from '@/composables/use-map-region';
import { usePublicContractFilters } from '@/composables/use-public-contract-filters';
import { usePublicContracts } from '@/composables/use-public-contracts';
import { getMetricById } from '@/config/metrics';
import { getMapRegionById } from '@/config/regions';
import { aggregateMunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { filterPublicContracts } from '@/domain/filter-public-contracts';
import { useMetricIdFromPath } from './use-metric-id-from-path';
import { useMobilePanelCollapse } from './use-mobile-panel-collapse';

const props = defineProps<{
  metricId: MetricId;
  regionId: string;
  filters: PublicContractFilters;
}>();

const asideRoot = useTemplateRef<HTMLElement>('asideRoot');
const { isPanelCollapsed } = useMobilePanelCollapse(asideRoot);

const { metricId } = useMetricIdFromPath(props.metricId);
const metric = computed(() => getMetricById(metricId.value));
const isPublicSpending = computed(() => metricId.value === 'public-spending');

const { regionId } = useMapRegion(props.regionId);
const regionName = computed(() => getMapRegionById(regionId.value).name);

const { filters } = usePublicContractFilters(props.filters);
const selectedRegion = computed(() => getMapRegionById(regionId.value));
const { contracts, isLoading } = usePublicContracts(
  () => selectedRegion.value.provinceCodes,
);

const filteredContracts = computed(() =>
  filterPublicContracts(contracts.value, filters.value),
);
const spending = computed(() =>
  !isPublicSpending.value || contracts.value.length === 0
    ? null
    : aggregateMunicipalSpending(filteredContracts.value),
);
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
          <template v-if="isPublicSpending">
            Adjudicaciones municipales de
            {{ regionName }}
            publicadas en PLACSP.
          </template>
          <template v-else>
            Empresas activas por municipio en
            {{ regionName }}
            (DIRCE).
          </template>
        </p>
      </div>

      <LandingHeroSpendingSummary
        v-if="isPublicSpending"
        :spending="spending"
        :is-loading="isLoading"
      />

      <p
        v-else
        class="text-sm text-muted-foreground md:text-base"
      >
        Próximamente
      </p>
    </div>
  </div>
</template>

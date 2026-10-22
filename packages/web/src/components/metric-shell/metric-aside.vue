<script setup lang="ts">
import type { MetricId } from '@/config/metrics';
import type { BusinessPowerFilters } from '@/domain/business-power-filters';
import type { PublicContractFilters } from '@/domain/filter-public-contracts';
import { computed, useTemplateRef } from 'vue';
import LandingHeroBusinessSummary from '@/components/landing-hero/landing-hero-business-summary.vue';
import LandingHeroRegionSelect from '@/components/landing-hero/landing-hero-region-select.vue';
import LandingHeroSpendingSummary from '@/components/landing-hero/landing-hero-spending-summary.vue';
import { useBusinessPowerFilters } from '@/composables/use-business-power-filters';
import { useMapRegion } from '@/composables/use-map-region';
import { useMunicipalBusinessStats } from '@/composables/use-municipal-business-stats';
import { usePublicContractFilters } from '@/composables/use-public-contract-filters';
import { usePublicContracts } from '@/composables/use-public-contracts';
import { getMetricById } from '@/config/metrics';
import { getMapRegionById } from '@/config/regions';
import {
  buildMunicipalBusinessRanking,
  resolveBusinessStatsPeriodYear,
  sumActiveBusinessCount,
} from '@/domain/aggregate-municipal-business-ranking';
import { aggregateMunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { filterPublicContracts } from '@/domain/filter-public-contracts';
import { useMetricIdFromPath } from './use-metric-id-from-path';
import { useMobilePanelCollapse } from './use-mobile-panel-collapse';

const props = defineProps<{
  metricId: MetricId;
  regionId: string;
  filters: PublicContractFilters;
  businessPowerFilters: BusinessPowerFilters;
}>();

const asideRoot = useTemplateRef<HTMLElement>('asideRoot');
const { isPanelCollapsed } = useMobilePanelCollapse(asideRoot);

const { metricId } = useMetricIdFromPath(props.metricId);
const metric = computed(() => getMetricById(metricId.value));
const isPublicSpending = computed(() => metricId.value === 'public-spending');
const isBusinessPower = computed(() => metricId.value === 'business-power');

const { regionId } = useMapRegion(props.regionId);
const regionName = computed(() => getMapRegionById(regionId.value).name);
const selectedRegion = computed(() => getMapRegionById(regionId.value));

const { filters } = usePublicContractFilters(props.filters);
const { contracts, isLoading: isContractsLoading } = usePublicContracts(
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

const { filters: businessFilters } = useBusinessPowerFilters(
  props.businessPowerFilters,
);
const {
  rows: businessRows,
  isLoading: isBusinessLoading,
} = useMunicipalBusinessStats(() => selectedRegion.value.provinceCodes);

const businessRanking = computed(() =>
  buildMunicipalBusinessRanking(businessRows.value, businessFilters.value),
);
const businessTotal = computed(() =>
  sumActiveBusinessCount(businessRanking.value),
);
const businessPeriodYear = computed(() =>
  resolveBusinessStatsPeriodYear(
    businessRows.value,
    businessFilters.value.periodYear,
  ),
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
        :is-loading="isContractsLoading"
      />

      <LandingHeroBusinessSummary
        v-else-if="isBusinessPower"
        :total-active-businesses="businessTotal"
        :period-year="businessPeriodYear"
        :is-loading="isBusinessLoading"
      />
    </div>
  </div>
</template>

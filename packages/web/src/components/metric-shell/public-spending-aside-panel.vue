<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { onKeyStroke } from '@vueuse/core';
import { ChevronDown } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import LandingHeroSpendingSummary from '@/components/landing-hero/landing-hero-spending-summary.vue';
import { PublicContractFiltersForm } from '@/components/public-contract-filters';
import { Button } from '@/components/ui/button';
import { useMapRegion } from '@/composables/use-map-region';
import { usePublicContractFilters } from '@/composables/use-public-contract-filters';
import { usePublicContracts } from '@/composables/use-public-contracts';
import { getMapRegionById } from '@/config/regions';
import { aggregateMunicipalSpending } from '@/domain/aggregate-municipal-spending';
import {
  availableContractYears,
  filterPublicContracts,
} from '@/domain/filter-public-contracts';
import { cn } from '@/lib/utils';
import { $metricAsideCollapsed } from '@/stores/metric-aside-ui';
import MetricAside from './metric-aside.vue';

const isAsideCollapsed = useStore($metricAsideCollapsed);
const { regionId } = useMapRegion();
const {
  filters,
  searchQuery,
  selectedStatuses,
  yearFrom,
  yearTo,
} = usePublicContractFilters();

const selectedRegion = computed(() => getMapRegionById(regionId.value));
const regionName = computed(() => selectedRegion.value.name);
const { contracts, isLoading } = usePublicContracts(
  () => selectedRegion.value.provinceCodes,
);
const availableYears = computed(() => availableContractYears(contracts.value));
const filteredContracts = computed(() =>
  filterPublicContracts(contracts.value, filters.value),
);
const spending = computed(() =>
  contracts.value.length === 0
    ? null
    : aggregateMunicipalSpending(filteredContracts.value),
);

const isPanelExpanded = ref(false);

function togglePanelExpanded(): void {
  isPanelExpanded.value = !isPanelExpanded.value;
}

onKeyStroke('Escape', () => {
  if (isPanelExpanded.value) {
    isPanelExpanded.value = false;
  }
});
</script>

<template>
  <MetricAside metric-id="public-spending">
    <template #description>
      Adjudicaciones municipales de
      {{ regionName }}
      publicadas en PLACSP.
    </template>
    <LandingHeroSpendingSummary
      :spending="spending"
      :is-loading="isLoading"
    />
  </MetricAside>

  <div
    v-show="!isAsideCollapsed"
    class="flex min-h-0 flex-1 flex-col text-zinc-100"
  >
    <div class="shrink-0 px-4 pb-4 md:px-8 lg:hidden">
      <Button
        type="button"
        variant="outline"
        class="flex h-auto w-full items-center justify-between rounded-xl border-border bg-card/80 px-4 py-2 text-sm text-foreground"
        :aria-expanded="isPanelExpanded"
        aria-controls="metric-aside-panel"
        @click="togglePanelExpanded"
      >
        <span>{{ isPanelExpanded ? 'Ocultar filtros' : 'Filtros' }}</span>
        <ChevronDown
          :class="cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            isPanelExpanded ? 'rotate-180' : '',
          )"
        />
      </Button>
    </div>

    <div
      id="metric-aside-panel"
      class="grid min-h-0 transition-[grid-template-rows] duration-300 ease-out lg:min-h-0 lg:flex-1"
      :class="isPanelExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] lg:grid-rows-[1fr]'"
    >
      <div class="min-h-0 overflow-hidden">
        <div
          class="flex max-h-[min(48dvh,100%)] min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-4 md:gap-8 md:px-8 md:pb-8 lg:h-full lg:max-h-none"
        >
          <PublicContractFiltersForm
            v-model:search-query="searchQuery"
            v-model:selected-statuses="selectedStatuses"
            v-model:year-from="yearFrom"
            v-model:year-to="yearTo"
            :available-years="availableYears"
          />
        </div>
      </div>
    </div>
  </div>
</template>

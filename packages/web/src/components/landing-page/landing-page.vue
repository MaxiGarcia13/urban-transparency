<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import type { MetricId } from '@/config/metrics';
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useMapRegion } from '@/composables/use-map-region';
import { useMetricView } from '@/composables/use-metric-view';
import { usePublicContractFilters } from '@/composables/use-public-contract-filters';
import { usePublicContracts } from '@/composables/use-public-contracts';
import { getMetricById } from '@/config/metrics';
import { getMapRegionById } from '@/config/regions';
import { aggregateMunicipalSpending } from '@/domain/aggregate-municipal-spending';
import {
  availableContractYears,
  filterPublicContracts,
} from '@/domain/filter-public-contracts';
import LandingPageMain from './landing-page-main.vue';
import LandingPageSidebar from './landing-page-sidebar.vue';
import { useMobilePanelCollapse } from './use-mobile-panel-collapse';

const emit = defineEmits<{
  navigateMetric: [metricId: MetricId];
}>();

const metric = getMetricById('public-spending');

const {
  searchQuery,
  selectedStatuses,
  yearFrom,
  yearTo,
  filters,
} = usePublicContractFilters();
const { regionId } = useMapRegion();
const { view } = useMetricView(metric.defaultView, metric.supportsMap);
const {
  isPanelCollapsed,
  mobilePanel,
  mobileListOffsetStyle,
  togglePanelCollapsed,
} = useMobilePanelCollapse();

const pendingFocusContractId = ref<string | null>(null);
const selectedRegion = computed(() => getMapRegionById(regionId.value));
const main = useTemplateRef<{
  focusContract: (contractId: string) => void;
}>('main');

const { contracts, isLoading, isError } = usePublicContracts(
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

const statusMessage = computed(() => {
  if (isLoading.value) {
    return null;
  }
  if (isError.value) {
    return 'No se pudieron cargar los contratos';
  }
  if (contracts.value.length === 0) {
    return 'Aún no hay contratos scrapeados para este municipio';
  }
  return null;
});

function tryFocusPendingContract(): void {
  const contractId = pendingFocusContractId.value;
  if (!contractId || !main.value) {
    return;
  }
  pendingFocusContractId.value = null;
  main.value.focusContract(contractId);
}

function focusContractOnMap(contract: PublicContract): void {
  if (view.value !== 'map') {
    view.value = 'map';
    pendingFocusContractId.value = contract.id;
    return;
  }
  if (main.value) {
    main.value.focusContract(contract.id);
    return;
  }
  pendingFocusContractId.value = contract.id;
}

watch(main, () => {
  tryFocusPendingContract();
});

watch(view, (nextView) => {
  if (nextView === 'map') {
    tryFocusPendingContract();
  }
});

watch(regionId, () => {
  pendingFocusContractId.value = null;
});
</script>

<template>
  <div class="relative h-dvh overflow-hidden bg-zinc-950 lg:flex lg:flex-row">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 lg:pointer-events-auto lg:static lg:inset-auto lg:flex lg:h-full lg:w-md lg:shrink-0 lg:border-r lg:border-white/10 lg:p-0"
    >
      <LandingPageSidebar
        ref="mobilePanel"
        v-model:search-query="searchQuery"
        v-model:selected-statuses="selectedStatuses"
        v-model:year-from="yearFrom"
        v-model:year-to="yearTo"
        v-model:region-id="regionId"
        :is-panel-collapsed="isPanelCollapsed"
        :spending="spending"
        :is-loading="isLoading"
        :available-years="availableYears"
        @navigate-metric="emit('navigateMetric', $event)"
        @toggle-collapsed="togglePanelCollapsed"
      />
    </div>

    <LandingPageMain
      ref="main"
      v-model:view="view"
      :contracts="filteredContracts"
      :filtered-contracts="filteredContracts"
      :selected-region="selectedRegion"
      :is-loading="isLoading"
      :status-message="statusMessage"
      :list-offset-style="mobileListOffsetStyle"
      @select-contract="focusContractOnMap"
    />
  </div>
</template>

<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import { computed, ref, useTemplateRef, watch } from 'vue';
import LandingPageMain from '@/components/landing-page/landing-page-main.vue';
import { useMapRegion } from '@/composables/use-map-region';
import { useMetricView } from '@/composables/use-metric-view';
import { usePublicContractFilters } from '@/composables/use-public-contract-filters';
import { usePublicContracts } from '@/composables/use-public-contracts';
import { getMetricById } from '@/config/metrics';
import { getMapRegionById } from '@/config/regions';
import { filterPublicContracts } from '@/domain/filter-public-contracts';

const metric = getMetricById('public-spending');
const { filters } = usePublicContractFilters();
const { regionId } = useMapRegion();
const { view } = useMetricView(metric.supportsMap);

const pendingFocusContractId = ref<string | null>(null);
const selectedRegion = computed(() => getMapRegionById(regionId.value));
const main = useTemplateRef<{
  focusContract: (contractId: string) => void;
}>('main');

const { contracts, isLoading, isError } = usePublicContracts(
  () => selectedRegion.value.provinceCodes,
);

const filteredContracts = computed(() =>
  filterPublicContracts(contracts.value, filters.value),
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
  <LandingPageMain
    ref="main"
    v-model:view="view"
    class="h-full"
    :contracts="filteredContracts"
    :filtered-contracts="filteredContracts"
    :selected-region="selectedRegion"
    :is-loading="isLoading"
    :status-message="statusMessage"
    @select-contract="focusContractOnMap"
  />
</template>

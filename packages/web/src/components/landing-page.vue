<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import {
  computed,
  defineAsyncComponent,
  ref,
  useTemplateRef,
  watch,
} from 'vue';
import { LandingHero } from '@/components/landing-hero';
import { PublicContractFiltersControl } from '@/components/public-contract-filters';
import { usePublicContractFilters } from '@/composables/use-public-contract-filters';
import { usePublicContracts } from '@/composables/use-public-contracts';
import { cantabriaRegion } from '@/config/regions/cantabria';
import { aggregateMunicipalSpending } from '@/domain/aggregate-municipal-spending';
import {
  availableContractYears,
  filterPublicContracts,
} from '@/domain/filter-public-contracts';

const SpendingMap = defineAsyncComponent(
  () => import('@/components/spending-map/spending-map.vue'),
);

const {
  searchQuery,
  selectedStatuses,
  yearFrom,
  yearTo,
  filters,
} = usePublicContractFilters();
const pendingFocusContractId = ref<string | null>(null);
const spendingMap = useTemplateRef<{
  focusContract: (contractId: string) => void;
}>('spendingMap');

const { contracts, isLoading, isError } = usePublicContracts(
  cantabriaRegion.provinceCode,
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

const mapContracts = computed(() => filteredContracts.value);

function tryFocusPendingContract(): void {
  const contractId = pendingFocusContractId.value;
  const map = spendingMap.value;
  if (!contractId || !map) {
    return;
  }
  pendingFocusContractId.value = null;
  map.focusContract(contractId);
}

function focusContractOnMap(contract: PublicContract): void {
  if (spendingMap.value) {
    spendingMap.value.focusContract(contract.id);
    return;
  }
  pendingFocusContractId.value = contract.id;
}

watch(spendingMap, () => {
  tryFocusPendingContract();
});
</script>

<template>
  <div class="relative h-dvh overflow-hidden bg-zinc-950 lg:flex lg:flex-row">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 lg:pointer-events-auto lg:static lg:inset-auto lg:flex lg:h-full lg:w-md lg:shrink-0 lg:border-r lg:border-white/10 lg:p-0"
    >
      <div
        class="pointer-events-auto flex max-h-[min(70dvh,100%)] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-lg backdrop-blur-md lg:h-full lg:max-h-none lg:rounded-none lg:border-0 lg:bg-zinc-950 lg:shadow-none lg:backdrop-blur-none"
      >
        <LandingHero
          v-model:search-query="searchQuery"
          :contracts="filteredContracts"
          :all-contract-count="contracts.length"
          :spending="spending"
          :is-loading="isLoading"
          :is-error="isError"
          @select-contract="focusContractOnMap"
        />
      </div>
    </div>

    <div class="relative h-full min-h-0 w-full bg-zinc-950 lg:flex-1">
      <SpendingMap
        ref="spendingMap"
        :contracts="mapContracts"
      />

      <div class="pointer-events-none absolute right-4 bottom-4 z-10">
        <PublicContractFiltersControl
          v-model:search-query="searchQuery"
          v-model:selected-statuses="selectedStatuses"
          v-model:year-from="yearFrom"
          v-model:year-to="yearTo"
          :available-years="availableYears"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import LandingHero from '@/components/landing-hero.vue';
import SpendingMap from '@/components/spending-map/spending-map.vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import { aggregateMunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { matchContractsBySearch } from '@/domain/match-contracts-by-search';

const searchQuery = ref('');
const contracts = ref<PublicContract[]>([]);
const isLoading = ref(true);
const isError = ref(false);
const spendingMap = useTemplateRef<{
  focusContract: (contractId: string) => void;
}>('spendingMap');

const filteredContracts = computed(() =>
  matchContractsBySearch(searchQuery.value, contracts.value),
);

const spending = computed(() =>
  contracts.value.length === 0
    ? null
    : aggregateMunicipalSpending(filteredContracts.value),
);

const mapContracts = computed(() => filteredContracts.value);

function focusContractOnMap(contract: PublicContract): void {
  spendingMap.value?.focusContract(contract.id);
}

onMounted(async () => {
  try {
    const response = await fetch(
      `/api/public-contracts?municipality=${santanderMunicipality.municipalityCode}`,
    );
    if (!response.ok) {
      isError.value = true;
      return;
    }
    contracts.value = (await response.json()) as PublicContract[];
  } catch {
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
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
          :contracts="contracts"
          :spending="spending"
          :is-loading="isLoading"
          :is-error="isError"
          @select-contract="focusContractOnMap"
        />
      </div>
    </div>

    <div class="h-full min-h-0 w-full lg:flex-1">
      <SpendingMap
        ref="spendingMap"
        :contracts="mapContracts"
      />
    </div>
  </div>
</template>

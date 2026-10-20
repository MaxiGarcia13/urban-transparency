<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import { computed, onMounted, ref } from 'vue';
import LandingHero from '@/components/landing-hero.vue';
import SpendingMap from '@/components/spending-map/spending-map.vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import { aggregateMunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { matchContractsBySearch } from '@/domain/match-contracts-by-search';

const searchQuery = ref('');
const contracts = ref<PublicContract[]>([]);
const isLoading = ref(true);
const isError = ref(false);

const filteredContracts = computed(() =>
  matchContractsBySearch(searchQuery.value, contracts.value),
);

const spending = computed(() =>
  contracts.value.length === 0
    ? null
    : aggregateMunicipalSpending(filteredContracts.value),
);

const mapSpending = computed(() =>
  contracts.value.length === 0
    ? null
    : aggregateMunicipalSpending(contracts.value),
);

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
  <div class="flex max-h-dvh flex-col overflow-auto bg-zinc-950 lg:flex-row">
    <div class="w-full shrink-0 border-b border-white/10 lg:w-md lg:border-r lg:border-b-0">
      <LandingHero
        v-model:search-query="searchQuery"
        :contracts="contracts"
        :spending="spending"
        :is-loading="isLoading"
        :is-error="isError"
      />
    </div>
    <div class="min-h-96 flex-1 lg:min-h-dvh">
      <SpendingMap :spending="mapSpending" />
    </div>
  </div>
</template>

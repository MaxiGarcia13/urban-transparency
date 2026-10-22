<script setup lang="ts">
import type { PublicContractStatus } from '@urban-transparency/shared';
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { onKeyStroke } from '@vueuse/core';
import { ref } from 'vue';
import { PublicContractFiltersForm } from '@/components/public-contract-filters';
import LandingHeroIntro from './landing-hero-intro.vue';

withDefaults(
  defineProps<{
    spending?: MunicipalSpending | null;
    isLoading?: boolean;
    availableYears: number[];
    titleHighlight: string;
    titleHighlightClass: string;
  }>(),
  {
    spending: null,
    isLoading: false,
  },
);

const searchQuery = defineModel<string>('searchQuery', { default: '' });
const selectedStatuses = defineModel<PublicContractStatus[]>('selectedStatuses', {
  default: () => [],
});
const yearFrom = defineModel<number | null>('yearFrom', { default: null });
const yearTo = defineModel<number | null>('yearTo', { default: null });
const regionId = defineModel<string>('regionId', { required: true });
const isExpanded = ref(false);

function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value;
}

onKeyStroke('Escape', () => {
  if (isExpanded.value) {
    isExpanded.value = false;
  }
});
</script>

<template>
  <aside class="flex h-full min-h-0 flex-col text-zinc-100">
    <LandingHeroIntro
      v-model:region-id="regionId"
      :spending="spending"
      :is-loading="isLoading"
      :is-expanded="isExpanded"
      :title-highlight="titleHighlight"
      :title-highlight-class="titleHighlightClass"
      @toggle-expanded="toggleExpanded"
    />

    <div
      id="landing-hero-details"
      class="grid min-h-0 transition-[grid-template-rows] duration-300 ease-out lg:min-h-0 lg:flex-1"
      :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] lg:grid-rows-[1fr]'"
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
  </aside>
</template>

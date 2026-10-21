<script setup lang="ts">
import type { PublicContract, PublicContractStatus } from '@urban-transparency/shared';
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import LandingHeroContractList from './landing-hero-contract-list.vue';
import LandingHeroFilters from './landing-hero-filters.vue';
import LandingHeroIntro from './landing-hero-intro.vue';

const props = withDefaults(
  defineProps<{
    contracts?: PublicContract[];
    availableYears?: number[];
    allContractCount?: number;
    spending?: MunicipalSpending | null;
    isLoading?: boolean;
    isError?: boolean;
  }>(),
  {
    contracts: () => [],
    availableYears: () => [],
    allContractCount: 0,
    spending: null,
    isLoading: false,
    isError: false,
  },
);

const emit = defineEmits<{
  selectContract: [contract: PublicContract];
}>();

const searchQuery = defineModel<string>('searchQuery', { default: '' });
const selectedStatuses = defineModel<PublicContractStatus[]>('selectedStatuses', {
  default: () => [],
});
const yearFrom = defineModel<number | null>('yearFrom', { default: null });
const yearTo = defineModel<number | null>('yearTo', { default: null });
const isExpanded = ref(false);

const statusMessage = computed(() => {
  if (props.isLoading) {
    return 'Cargando contratos…';
  }
  if (props.isError) {
    return 'No se pudieron cargar los contratos';
  }
  if (props.allContractCount === 0) {
    return 'Aún no hay contratos scrapeados para este municipio';
  }
  return null;
});

function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value;
}

function selectContract(contract: PublicContract): void {
  emit('selectContract', contract);
  isExpanded.value = false;
}

function handleEscapeKey(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isExpanded.value) {
    isExpanded.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscapeKey);
});
</script>

<template>
  <aside class="flex h-full min-h-0 flex-col text-zinc-100">
    <LandingHeroIntro
      :spending="spending"
      :is-expanded="isExpanded"
      @toggle-expanded="toggleExpanded"
    />

    <div
      id="landing-hero-details"
      class="grid min-h-0 transition-[grid-template-rows] duration-300 ease-out lg:min-h-0 lg:flex-1"
      :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] lg:grid-rows-[1fr]'"
    >
      <div class="min-h-0 overflow-hidden">
        <div class="flex max-h-[min(48dvh,100%)] flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-4 md:gap-8 md:px-8 md:pb-8 lg:h-full lg:max-h-none">
          <LandingHeroFilters
            v-model:search-query="searchQuery"
            v-model:selected-statuses="selectedStatuses"
            v-model:year-from="yearFrom"
            v-model:year-to="yearTo"
            :available-years="availableYears"
          />

          <LandingHeroContractList
            :contracts="contracts"
            :status-message="statusMessage"
            @select="selectContract"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

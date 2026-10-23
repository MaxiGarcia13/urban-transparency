<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import type { MetricView } from '@/config/metrics';
import type { MapRegion } from '@/config/regions';
import { defineAsyncComponent, useTemplateRef } from 'vue';
import LandingHeroContractList from '@/components/landing-hero/landing-hero-contract-list.vue';
import LandingPageViewToggle from './landing-page-view-toggle.vue';

defineProps<{
  contracts: PublicContract[];
  filteredContracts: PublicContract[];
  selectedRegion: MapRegion;
  isLoading: boolean;
  statusMessage: string | null;
}>();

const emit = defineEmits<{
  selectContract: [contract: PublicContract];
}>();

const view = defineModel<MetricView>('view', { required: true });

const SpendingMap = defineAsyncComponent(
  () => import('@/components/spending-map/spending-map.vue'),
);

const spendingMap = useTemplateRef<{
  focusContract: (contractId: string) => void;
}>('spendingMap');
const listScroll = useTemplateRef<HTMLElement>('listScroll');

defineExpose({
  focusContract: (contractId: string) => {
    spendingMap.value?.focusContract(contractId);
  },
});
</script>

<template>
  <div class="relative flex h-full min-h-0 w-full flex-col bg-zinc-950 lg:flex-1">
    <LandingPageViewToggle v-model:view="view" />

    <div
      v-show="view === 'map'"
      class="h-full min-h-0 w-full"
    >
      <SpendingMap
        :key="selectedRegion.id"
        ref="spendingMap"
        :contracts="contracts"
        :region="selectedRegion"
      />
    </div>

    <div
      v-show="view === 'list'"
      class="flex h-full min-h-0 flex-col pt-[var(--metric-aside-offset,0px)] pb-16 lg:pt-16 lg:pb-0"
    >
      <div
        ref="listScroll"
        class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-8"
      >
        <LandingHeroContractList
          :contracts="filteredContracts"
          :region-name="selectedRegion.name"
          :is-loading="isLoading"
          :status-message="statusMessage"
          :scroll-element="listScroll"
          @select="emit('selectContract', $event)"
        />
      </div>
    </div>
  </div>
</template>

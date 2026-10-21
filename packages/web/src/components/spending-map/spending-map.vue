<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import type { MapRegion } from '@/config/regions';
import { toRef } from 'vue';
import ContractSpendingTooltip from './contract-spending-tooltip.vue';
import { useSpendingMap } from './use-spending-map';

const props = defineProps<{
  contracts: PublicContract[];
  region: MapRegion;
}>();

const { mapContainer, tooltip, clearTooltip, focusContract } = useSpendingMap(
  toRef(props, 'contracts'),
  toRef(props, 'region'),
);

defineExpose({ focusContract });
</script>

<template>
  <div class="relative h-full min-h-0 w-full overflow-hidden bg-zinc-950">
    <div ref="mapContainer" class="h-full w-full" />

    <ContractSpendingTooltip
      v-if="tooltip"
      :contracts="tooltip.contracts"
      :contract-count="tooltip.contractCount"
      :total-awarded-eur="tooltip.totalAwardedEur"
      :postal-code="tooltip.postalCode"
      :has-known-location="tooltip.hasKnownLocation"
      :x="tooltip.x"
      :y="tooltip.y"
      @close="clearTooltip"
    />
  </div>
</template>

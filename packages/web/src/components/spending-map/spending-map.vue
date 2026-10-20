<script setup lang="ts">
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { toRef } from 'vue';
import MunicipalitySpendingTooltip from './municipality-spending-tooltip.vue';
import { useSpendingMap } from './use-spending-map';

const props = defineProps<{
  spending: MunicipalSpending | null;
}>();

const { mapContainer, tooltip } = useSpendingMap(toRef(props, 'spending'));
</script>

<template>
  <div class="relative h-full min-h-96 w-full overflow-hidden bg-zinc-950">
    <div ref="mapContainer" class="h-full w-full" />

    <MunicipalitySpendingTooltip
      v-if="tooltip"
      :name="tooltip.name"
      :contract-count="tooltip.contractCount"
      :total-awarded-eur="tooltip.totalAwardedEur"
      :x="tooltip.x"
      :y="tooltip.y"
    />
  </div>
</template>

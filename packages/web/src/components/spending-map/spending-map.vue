<script setup lang="ts">
import { toRef } from 'vue';
import NeighborhoodSpendingTooltip from './neighborhood-spending-tooltip.vue';
import { useSpendingMap } from './use-spending-map';

const props = withDefaults(
  defineProps<{
    searchQuery?: string;
  }>(),
  {
    searchQuery: '',
  },
);

const { mapContainer, tooltip } = useSpendingMap(toRef(props, 'searchQuery'));
</script>

<template>
  <div class="relative h-full min-h-96 w-full overflow-hidden bg-zinc-950">
    <div ref="mapContainer" class="h-full w-full" />

    <NeighborhoodSpendingTooltip
      v-if="tooltip"
      :name="tooltip.name"
      :contract-count="tooltip.contractCount"
      :total-awarded-eur="tooltip.totalAwardedEur"
      :x="tooltip.x"
      :y="tooltip.y"
    />
  </div>
</template>

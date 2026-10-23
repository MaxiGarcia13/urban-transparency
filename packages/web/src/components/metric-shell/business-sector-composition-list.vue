<script setup lang="ts">
import type { BusinessSectorCompositionRow } from '@/domain/municipal-business';
import ShareMetricRow from './share-metric-row.vue';

defineProps<{
  composition: BusinessSectorCompositionRow[];
}>();
</script>

<template>
  <ul class="flex flex-col gap-3">
    <li
      v-for="row in composition"
      :key="row.sectorCode"
    >
      <ShareMetricRow
        :label="row.label"
        :count="row.activeBusinessCount"
        :share="row.share"
      />
    </li>
  </ul>
</template>

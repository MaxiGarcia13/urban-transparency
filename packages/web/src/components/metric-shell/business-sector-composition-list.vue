<script setup lang="ts">
import type { BusinessSectorCompositionRow } from '@/domain/municipal-business';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';
import { shareToBarWidthPercent } from '@/utils/share-to-bar-width-percent';

defineProps<{
  composition: BusinessSectorCompositionRow[];
}>();
</script>

<template>
  <ul class="flex flex-col gap-3">
    <li
      v-for="row in composition"
      :key="row.sectorCode"
      class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1"
    >
      <span class="truncate text-sm text-zinc-200">
        {{ row.label }}
      </span>
      <span class="text-sm text-teal-300 tabular-nums">
        {{ formatInteger(row.activeBusinessCount) }}
        <span class="text-muted-foreground">
          · {{ formatPercent(row.share) }}
        </span>
      </span>
      <div class="col-span-2 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          class="h-full rounded-full bg-teal-400/80 transition-[width] duration-500"
          :style="{ width: `${shareToBarWidthPercent(row.share)}%` }"
        />
      </div>
    </li>
  </ul>
</template>

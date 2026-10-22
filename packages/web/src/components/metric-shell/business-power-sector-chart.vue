<script setup lang="ts">
import type { BusinessSectorCompositionRow } from '@/domain/municipal-business';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';

withDefaults(
  defineProps<{
    composition: BusinessSectorCompositionRow[];
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  },
);

function barWidthPercent(shareOfRegion: number): number {
  return Math.max(2, Math.round(shareOfRegion * 100));
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
        Composición sectorial
      </h2>
      <p class="text-sm text-muted-foreground">
        Peso de cada grupo CNAE en la región
      </p>
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col gap-3"
      aria-hidden="true"
    >
      <Skeleton
        v-for="index in 6"
        :key="index"
        class="h-8 w-full rounded-lg"
      />
    </div>

    <ul
      v-else
      class="flex flex-col gap-3"
    >
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
            · {{ formatPercent(row.shareOfRegion) }}
          </span>
        </span>
        <div class="col-span-2 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            class="h-full rounded-full bg-teal-400/80 transition-[width] duration-500"
            :style="{ width: `${barWidthPercent(row.shareOfRegion)}%` }"
          />
        </div>
      </li>
    </ul>
  </section>
</template>

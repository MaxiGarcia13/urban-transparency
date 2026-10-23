<script setup lang="ts">
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';
import BaselineDeviationBar from './baseline-deviation-bar.vue';
import ShareBar from './share-bar.vue';

withDefaults(
  defineProps<{
    label: string;
    count: number | null;
    share: number | null | undefined;
    rank?: number;
    formatValue?: (value: number) => string;
    valueClass?: string;
    barClass?: string;
    showShareLabel?: boolean;
    barMode?: 'share' | 'deviation' | 'none';
    deltaVsBaseline?: number | null;
    deviationScale?: number;
    aboveBarClass?: string;
    belowBarClass?: string;
    comparisonLabel?: string | null;
    comparisonClass?: string;
  }>(),
  {
    formatValue: formatInteger,
    valueClass: 'text-teal-300',
    barClass: 'bg-teal-400/80',
    showShareLabel: true,
    barMode: 'share',
    deltaVsBaseline: null,
    deviationScale: 0.25,
    aboveBarClass: 'bg-sky-400/80',
    belowBarClass: 'bg-orange-400/80',
    comparisonLabel: null,
    comparisonClass: 'text-muted-foreground',
  },
);
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1">
    <span class="truncate text-sm text-zinc-200">
      <span
        v-if="rank != null"
        class="mr-2 text-muted-foreground tabular-nums"
      >
        {{ rank }}.
      </span>
      {{ label }}
    </span>
    <span class="flex flex-col items-end gap-1 text-right">
      <span
        class="text-sm tabular-nums"
        :class="valueClass"
      >
        <template v-if="count != null">
          {{ formatValue(count) }}
        </template>
        <template v-else>
          —
        </template>
        <span
          v-if="showShareLabel && share != null"
          class="text-muted-foreground"
        >
          · {{ formatPercent(share) }}
        </span>
      </span>
      <span
        v-if="comparisonLabel"
        class="text-xs tabular-nums"
        :class="comparisonClass"
      >
        {{ comparisonLabel }}
      </span>
    </span>
    <ShareBar
      v-if="barMode === 'share'"
      class="col-span-2"
      :share="share"
      :bar-class="barClass"
    />
    <BaselineDeviationBar
      v-else-if="barMode === 'deviation'"
      class="col-span-2"
      :delta="deltaVsBaseline"
      :scale="deviationScale"
      :above-class="aboveBarClass"
      :below-class="belowBarClass"
    />
  </div>
</template>

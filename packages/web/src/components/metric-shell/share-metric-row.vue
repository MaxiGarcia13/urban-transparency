<script setup lang="ts">
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';
import ShareBar from './share-bar.vue';

defineProps<{
  label: string;
  count: number | null;
  share: number | null | undefined;
  rank?: number;
}>();
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
    <span class="text-sm text-teal-300 tabular-nums">
      <template v-if="count != null">
        {{ formatInteger(count) }}
      </template>
      <template v-else>
        —
      </template>
      <span
        v-if="share != null"
        class="text-muted-foreground"
      >
        · {{ formatPercent(share) }}
      </span>
    </span>
    <ShareBar
      class="col-span-2"
      :share="share"
    />
  </div>
</template>

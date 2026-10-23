<script setup lang="ts">
import { computed } from 'vue';
import { shareToBarWidthPercent } from '@/utils/share-to-bar-width-percent';

const props = withDefaults(
  defineProps<{
    share: number | null | undefined;
    barClass?: string;
  }>(),
  {
    barClass: 'bg-teal-400/80',
  },
);

const widthPercent = computed(() => shareToBarWidthPercent(props.share));
</script>

<template>
  <div class="h-2 overflow-hidden rounded-full bg-white/5">
    <div
      class="h-full rounded-full transition-[width] duration-500"
      :class="barClass"
      :style="{ width: `${widthPercent}%` }"
    />
  </div>
</template>

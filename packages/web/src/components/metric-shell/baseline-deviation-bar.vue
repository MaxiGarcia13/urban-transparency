<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    delta: number | null | undefined;
    /** Absolute delta that maps to full half-track (e.g. 0.25 = ±25%). */
    scale: number;
    aboveClass?: string;
    belowClass?: string;
  }>(),
  {
    aboveClass: 'bg-sky-400/80',
    belowClass: 'bg-orange-400/80',
  },
);

const HALF = 50;

const fill = computed(() => {
  if (props.delta == null || props.scale <= 0) {
    return null;
  }
  const clamped = Math.max(-props.scale, Math.min(props.scale, props.delta));
  const widthPercent = (Math.abs(clamped) / props.scale) * HALF;
  if (widthPercent < 1) {
    return null;
  }
  if (clamped >= 0) {
    return {
      side: 'above' as const,
      style: {
        left: `${HALF}%`,
        width: `${widthPercent}%`,
      },
      barClass: props.aboveClass,
    };
  }
  return {
    side: 'below' as const,
    style: {
      left: `${HALF - widthPercent}%`,
      width: `${widthPercent}%`,
    },
    barClass: props.belowClass,
  };
});
</script>

<template>
  <div
    class="relative h-2 w-full overflow-hidden rounded-full bg-white/5"
    role="img"
    :aria-label="delta == null
      ? 'Sin comparación con la media'
      : delta >= 0
        ? 'Por encima de la media provincial'
        : 'Por debajo de la media provincial'"
  >
    <div
      class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-500"
      aria-hidden="true"
    />
    <div
      v-if="fill"
      class="absolute inset-y-0 rounded-full transition-[width,left] duration-500"
      :class="fill.barClass"
      :style="fill.style"
    />
  </div>
</template>

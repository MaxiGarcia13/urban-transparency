<script setup lang="ts">
import type { BusinessYearTrendPoint } from '@/domain/municipal-business';
import { useElementSize } from '@vueuse/core';
import { computed, useTemplateRef } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInteger } from '@/utils/format-integer';

const props = withDefaults(
  defineProps<{
    trend: BusinessYearTrendPoint[];
    selectedYear: number | null;
    sectorLabel: string;
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  },
);

const chartRoot = useTemplateRef<HTMLElement>('chartRoot');
const { width: containerWidth } = useElementSize(chartRoot);

const VIEW_HEIGHT = 144;
const PADDING = { top: 14, right: 4, bottom: 8, left: 4 };

const chartGeometry = computed(() => {
  const points = props.trend;
  const width = Math.max(containerWidth.value, 1);
  if (points.length === 0) {
    return null;
  }

  const counts = points.map((point) => point.activeBusinessCount);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const range = Math.max(maxCount - minCount, 1);
  const innerWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  const innerHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = points.length === 1 ? 0 : innerWidth / (points.length - 1);

  const mapped = points.map((point, index) => {
    const x = PADDING.left + index * stepX;
    const y = PADDING.top
      + innerHeight
      - ((point.activeBusinessCount - minCount) / range) * innerHeight;
    return { ...point, x, y };
  });

  const linePath = mapped
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = [
    `M ${mapped[0]!.x} ${VIEW_HEIGHT - PADDING.bottom}`,
    ...mapped.map((point) => `L ${point.x} ${point.y}`),
    `L ${mapped[mapped.length - 1]!.x} ${VIEW_HEIGHT - PADDING.bottom}`,
    'Z',
  ].join(' ');

  return { width, mapped, linePath, areaPath };
});

const latestPoint = computed(() => {
  const points = props.trend;
  return points[points.length - 1] ?? null;
});
</script>

<template>
  <section class="flex w-full flex-col gap-4">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-col gap-1">
        <h2 class="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
          Evolución
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ sectorLabel }} · serie anual DIRCE
        </p>
      </div>
      <p
        v-if="!isLoading && latestPoint"
        class="text-sm text-muted-foreground tabular-nums"
      >
        Último:
        <span class="font-medium text-teal-300">
          {{ formatInteger(latestPoint.activeBusinessCount) }}
        </span>
        ({{ latestPoint.periodYear }})
      </p>
    </div>

    <div
      v-if="isLoading"
      aria-hidden="true"
    >
      <Skeleton class="h-40 w-full rounded-xl" />
    </div>

    <div
      v-else
      ref="chartRoot"
      class="flex w-full flex-col gap-2"
    >
      <svg
        v-if="chartGeometry"
        class="block w-full"
        :viewBox="`0 0 ${chartGeometry.width} ${VIEW_HEIGHT}`"
        :height="VIEW_HEIGHT"
        role="img"
        :aria-label="`Evolución de ${sectorLabel}`"
      >
        <path
          :d="chartGeometry.areaPath"
          class="fill-teal-400/15"
        />
        <path
          :d="chartGeometry.linePath"
          class="fill-none stroke-teal-300"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-for="point in chartGeometry.mapped"
          :key="point.periodYear"
          :cx="point.x"
          :cy="point.y"
          :r="selectedYear === point.periodYear ? 5 : 3.5"
          :class="selectedYear === point.periodYear
            ? 'fill-teal-200'
            : 'fill-teal-400'"
        />
      </svg>

      <div
        v-if="chartGeometry"
        class="flex w-full justify-between"
      >
        <span
          v-for="point in chartGeometry.mapped"
          :key="point.periodYear"
          class="min-w-0 flex-1 text-center text-[10px] tabular-nums sm:text-xs"
          :class="selectedYear === point.periodYear
            ? 'text-teal-300/80'
            : 'text-zinc-500'"
        >
          {{ point.periodYear }}
        </span>
      </div>
    </div>
  </section>
</template>

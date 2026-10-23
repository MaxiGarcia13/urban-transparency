<script setup lang="ts">
import type { BusinessYearTrendPoint } from '@/domain/municipal-business';
import { useElementSize } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInteger } from '@/utils/format-integer';

type MappedTrendPoint = BusinessYearTrendPoint & { x: number; y: number };

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
const hoveredPoint = ref<MappedTrendPoint | null>(null);

const VIEW_HEIGHT = 144;
const PADDING = { top: 14, right: 4, bottom: 8, left: 4 };
const DOMAIN_PAD_RATIO = 0.1;
const MIN_DOMAIN_PAD = 1;
const HIT_RADIUS = 12;

const chartGeometry = computed(() => {
  const points = props.trend;
  const width = Math.max(containerWidth.value, 1);
  if (points.length === 0) {
    return null;
  }

  const counts = points.map((point) => point.activeBusinessCount);
  const rawMin = Math.min(...counts);
  const rawMax = Math.max(...counts);
  const span = Math.max(rawMax - rawMin, MIN_DOMAIN_PAD);
  const pad = Math.max(span * DOMAIN_PAD_RATIO, MIN_DOMAIN_PAD);
  const domainMin = Math.max(0, rawMin - pad);
  const domainMax = rawMax + pad;
  const domainSpan = Math.max(domainMax - domainMin, MIN_DOMAIN_PAD);

  const innerWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  const innerHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = points.length === 1 ? 0 : innerWidth / (points.length - 1);

  const mapped: MappedTrendPoint[] = points.map((point, index) => {
    const x = PADDING.left + index * stepX;
    const y = PADDING.top
      + innerHeight
      - ((point.activeBusinessCount - domainMin) / domainSpan) * innerHeight;
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

function setHoveredPoint(point: MappedTrendPoint | null): void {
  hoveredPoint.value = point;
}
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
      <div
        v-if="chartGeometry"
        class="relative w-full"
      >
        <svg
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
          <g
            v-for="point in chartGeometry.mapped"
            :key="point.periodYear"
          >
            <circle
              :cx="point.x"
              :cy="point.y"
              :r="HIT_RADIUS"
              class="fill-transparent"
              @pointerenter="setHoveredPoint(point)"
              @pointerleave="setHoveredPoint(null)"
            />
            <circle
              :cx="point.x"
              :cy="point.y"
              :r="selectedYear === point.periodYear
                || hoveredPoint?.periodYear === point.periodYear
                ? 5
                : 3.5"
              :class="selectedYear === point.periodYear
                || hoveredPoint?.periodYear === point.periodYear
                ? 'fill-teal-200 pointer-events-none'
                : 'fill-teal-400 pointer-events-none'"
            />
          </g>
        </svg>

        <div
          v-if="hoveredPoint"
          class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground shadow-md"
          :style="{
            left: `${hoveredPoint.x}px`,
            top: `${hoveredPoint.y - 10}px`,
          }"
          role="tooltip"
        >
          <p class="text-muted-foreground">
            {{ hoveredPoint.periodYear }}
          </p>
          <p class="font-medium text-teal-300 tabular-nums">
            {{ formatInteger(hoveredPoint.activeBusinessCount) }}
          </p>
        </div>
      </div>

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

<script setup lang="ts">
import type { MetricTrendPoint } from '@/domain/metric-ranking';
import { useElementSize } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';

type MappedTrendPoint = MetricTrendPoint & { x: number; y: number };

const props = withDefaults(
  defineProps<{
    points: MetricTrendPoint[];
    selectedYear: number | null;
    subtitle: string;
    formatValue: (value: number) => string;
    title?: string;
    caption?: string | null;
    latestLabel?: string;
    accentTextClass?: string;
    accentMutedTextClass?: string;
    accentStrokeClass?: string;
    accentFillClass?: string;
    accentDotClass?: string;
    accentDotActiveClass?: string;
    isLoading?: boolean;
  }>(),
  {
    title: 'Evolución',
    caption: null,
    latestLabel: 'Último',
    accentTextClass: 'text-teal-300',
    accentMutedTextClass: 'text-teal-300/80',
    accentStrokeClass: 'stroke-teal-300',
    accentFillClass: 'fill-teal-400/15',
    accentDotClass: 'fill-teal-400',
    accentDotActiveClass: 'fill-teal-200',
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
  const points = props.points;
  const width = Math.max(containerWidth.value, 1);
  if (points.length === 0) {
    return null;
  }

  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
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
      - ((point.value - domainMin) / domainSpan) * innerHeight;
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
  const points = props.points;
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
        <h2
          class="text-sm font-medium tracking-wide uppercase"
          :class="accentTextClass"
        >
          {{ title }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ subtitle }}
        </p>
        <p
          v-if="caption"
          class="text-xs leading-relaxed text-muted-foreground/90 md:text-sm"
        >
          {{ caption }}
        </p>
      </div>
      <p
        v-if="!isLoading && latestPoint"
        class="text-sm text-muted-foreground tabular-nums"
      >
        {{ latestLabel }}:
        <span
          class="font-medium"
          :class="accentTextClass"
        >
          {{ formatValue(latestPoint.value) }}
        </span>
        ({{ latestPoint.year }})
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
          :aria-label="`Evolución: ${subtitle}`"
        >
          <path
            :d="chartGeometry.areaPath"
            :class="accentFillClass"
          />
          <path
            :d="chartGeometry.linePath"
            class="fill-none"
            :class="accentStrokeClass"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <g
            v-for="point in chartGeometry.mapped"
            :key="point.year"
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
              :r="selectedYear === point.year
                || hoveredPoint?.year === point.year
                ? 5
                : 3.5"
              class="pointer-events-none"
              :class="selectedYear === point.year
                || hoveredPoint?.year === point.year
                ? accentDotActiveClass
                : accentDotClass"
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
            {{ hoveredPoint.year }}
          </p>
          <p
            class="font-medium tabular-nums"
            :class="accentTextClass"
          >
            {{ formatValue(hoveredPoint.value) }}
          </p>
        </div>
      </div>

      <div
        v-if="chartGeometry"
        class="flex w-full justify-between"
      >
        <span
          v-for="point in chartGeometry.mapped"
          :key="point.year"
          class="min-w-0 flex-1 text-center text-[10px] tabular-nums sm:text-xs"
          :class="selectedYear === point.year
            ? accentMutedTextClass
            : 'text-zinc-500'"
        >
          {{ point.year }}
        </span>
      </div>
    </div>
  </section>
</template>

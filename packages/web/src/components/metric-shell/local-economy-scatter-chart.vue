<script setup lang="ts">
import type { MunicipalEconomySnapshot } from '@/domain/municipal-economy';
import { useElementSize } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';
import { formatSignedPercent } from '@/utils/format-signed-percent';

type MappedPoint = MunicipalEconomySnapshot & { x: number; y: number };

const props = withDefaults(
  defineProps<{
    snapshots: MunicipalEconomySnapshot[];
    selectedId: string | null;
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  },
);

const emit = defineEmits<{
  select: [municipalityCode: string];
}>();

const chartRoot = useTemplateRef<HTMLElement>('chartRoot');
const { width: containerWidth } = useElementSize(chartRoot);
const hovered = ref<MappedPoint | null>(null);

const VIEW_HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 36, left: 44 };

const chartGeometry = computed(() => {
  const width = Math.max(containerWidth.value, 1);
  const usable = props.snapshots.filter(
    (row) =>
      row.businessPercentile != null
      && row.incomeDeltaVsProvincialMean != null,
  );
  if (usable.length === 0) {
    return null;
  }

  const deltas = usable.map((row) => row.incomeDeltaVsProvincialMean!);
  const absMax = Math.max(
    0.05,
    ...deltas.map((value) => Math.abs(value)),
  );
  const domainMin = -absMax;
  const domainMax = absMax;
  const domainSpan = domainMax - domainMin;

  const innerWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  const innerHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;

  const mapped: MappedPoint[] = usable.map((row) => {
    const x
      = PADDING.left + row.businessPercentile! * innerWidth;
    const y
      = PADDING.top
        + innerHeight
        - ((row.incomeDeltaVsProvincialMean! - domainMin) / domainSpan)
        * innerHeight;
    return { ...row, x, y };
  });

  const zeroY
    = PADDING.top
      + innerHeight
      - ((0 - domainMin) / domainSpan) * innerHeight;

  return {
    width,
    mapped,
    zeroY,
    midX: PADDING.left + innerWidth / 2,
    axisBottom: VIEW_HEIGHT - PADDING.bottom,
    axisLeft: PADDING.left,
    axisRight: width - PADDING.right,
    axisTop: PADDING.top,
  };
});

function pointClass(point: MappedPoint): string {
  const isSelected = point.municipalityCode === props.selectedId;
  const isHovered = hovered.value?.municipalityCode === point.municipalityCode;
  if (isSelected || isHovered) {
    return 'fill-teal-200';
  }
  if (
    point.incomeDeltaVsProvincialMean != null
    && point.incomeDeltaVsProvincialMean >= 0
  ) {
    return 'fill-sky-400/80';
  }
  return 'fill-orange-400/70';
}

function onSelect(point: MappedPoint): void {
  emit('select', point.municipalityCode);
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
        Empresas × renta
      </h2>
      <p class="text-sm text-muted-foreground">
        Eje X: percentil de empresas en la región. Eje Y: renta vs media provincial.
      </p>
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col gap-2"
      aria-hidden="true"
    >
      <Skeleton class="h-60 w-full rounded-xl" />
    </div>

    <div
      v-else-if="chartGeometry == null"
      class="rounded-xl border border-white/10 px-4 py-8 text-sm text-muted-foreground"
    >
      No hay municipios con ambos datos para el año seleccionado.
    </div>

    <div
      v-else
      ref="chartRoot"
      class="relative w-full"
    >
      <svg
        :viewBox="`0 0 ${chartGeometry.width} ${VIEW_HEIGHT}`"
        class="h-60 w-full overflow-visible"
        role="img"
        aria-label="Dispersión empresas y renta por municipio"
      >
        <line
          :x1="chartGeometry.axisLeft"
          :x2="chartGeometry.axisRight"
          :y1="chartGeometry.zeroY"
          :y2="chartGeometry.zeroY"
          class="stroke-white/20"
          stroke-dasharray="4 4"
        />
        <line
          :x1="chartGeometry.midX"
          :x2="chartGeometry.midX"
          :y1="chartGeometry.axisTop"
          :y2="chartGeometry.axisBottom"
          class="stroke-white/15"
          stroke-dasharray="4 4"
        />
        <text
          :x="chartGeometry.axisLeft"
          :y="VIEW_HEIGHT - 8"
          class="fill-muted-foreground text-[10px]"
        >
          Menos empresas
        </text>
        <text
          :x="chartGeometry.axisRight"
          :y="VIEW_HEIGHT - 8"
          text-anchor="end"
          class="fill-muted-foreground text-[10px]"
        >
          Más empresas
        </text>
        <text
          :x="12"
          :y="chartGeometry.axisTop + 4"
          class="fill-sky-300/80 text-[10px]"
        >
          + renta
        </text>
        <text
          :x="12"
          :y="chartGeometry.axisBottom"
          class="fill-orange-300/80 text-[10px]"
        >
          − renta
        </text>

        <circle
          v-for="point in chartGeometry.mapped"
          :key="point.municipalityCode"
          :cx="point.x"
          :cy="point.y"
          :r="point.municipalityCode === selectedId ? 7 : 5"
          :class="pointClass(point)"
          class="cursor-pointer transition-[r] duration-150"
          @mouseenter="hovered = point"
          @mouseleave="hovered = null"
          @click="onSelect(point)"
        >
          <title>
            {{ point.municipalityName }}
          </title>
        </circle>
      </svg>

      <div
        v-if="hovered"
        class="pointer-events-none absolute top-2 right-2 max-w-56 rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
      >
        <p class="font-medium text-zinc-100">
          {{ hovered.municipalityName }}
        </p>
        <p class="text-muted-foreground">
          Percentil empresas:
          {{ formatPercent(hovered.businessPercentile ?? 0) }}
          <template v-if="hovered.activeBusinessCount != null">
            ({{ formatInteger(hovered.activeBusinessCount) }})
          </template>
        </p>
        <p class="text-muted-foreground">
          Renta vs media:
          {{ formatSignedPercent(hovered.incomeDeltaVsProvincialMean ?? 0) }}
        </p>
      </div>
    </div>
  </section>
</template>

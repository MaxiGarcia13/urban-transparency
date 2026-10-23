<script setup lang="ts">
import type { MetricRankingRow } from '@/domain/metric-ranking';
import { computed, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { METRIC_TOP_RANKING_LIMIT } from '@/domain/metric-ranking';
import ShareMetricRow from './share-metric-row.vue';

const props = withDefaults(
  defineProps<{
    ranking: MetricRankingRow[];
    regionName: string;
    isLoading: boolean;
    statusMessage: string | null;
    selectedId: string | null;
    formatValue: (value: number) => string;
    title?: string;
    subtitle?: string | null;
    caption?: string | null;
    accentTextClass?: string;
    accentSelectedClass?: string;
    accentButtonHoverClass?: string;
    barClass?: string;
    showShareLabel?: boolean;
    barMode?: 'share' | 'deviation' | 'none';
    aboveBarClass?: string;
    belowBarClass?: string;
    comparisonLabelForRow?: (row: MetricRankingRow) => string | null;
    comparisonClassForRow?: (row: MetricRankingRow) => string;
    topLimit?: number;
  }>(),
  {
    title: 'Ranking municipal',
    subtitle: null,
    caption: null,
    accentTextClass: 'text-teal-300',
    accentSelectedClass: 'bg-teal-400/5',
    accentButtonHoverClass: 'hover:text-teal-200',
    barClass: 'bg-teal-400/80',
    showShareLabel: true,
    barMode: 'share',
    aboveBarClass: 'bg-sky-400/80',
    belowBarClass: 'bg-orange-400/80',
    comparisonLabelForRow: undefined,
    comparisonClassForRow: undefined,
    topLimit: METRIC_TOP_RANKING_LIMIT,
  },
);

const emit = defineEmits<{
  select: [id: string];
}>();

const showAll = ref(false);

watch(
  () => props.ranking,
  () => {
    showAll.value = false;
  },
);

const visibleRanking = computed(() =>
  showAll.value
    ? props.ranking
    : props.ranking.slice(0, props.topLimit),
);

const hasMore = computed(
  () => props.ranking.length > props.topLimit,
);

const resolvedSubtitle = computed(() => {
  if (props.subtitle != null) {
    return props.subtitle;
  }
  if (!showAll.value && hasMore.value) {
    return `Top ${props.topLimit} en ${props.regionName}`;
  }
  return `Municipios en ${props.regionName}`;
});

const deviationScale = computed(() => {
  let maxAbs = 0;
  for (const row of props.ranking) {
    if (row.deltaVsBaseline == null) {
      continue;
    }
    maxAbs = Math.max(maxAbs, Math.abs(row.deltaVsBaseline));
  }
  return Math.max(maxAbs, 0.05);
});
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2
        class="text-sm font-medium tracking-wide uppercase"
        :class="accentTextClass"
      >
        {{ title }}
      </h2>
      <p class="text-sm text-muted-foreground">
        {{ resolvedSubtitle }}
      </p>
      <p
        v-if="caption"
        class="text-xs leading-relaxed text-muted-foreground/90 md:text-sm"
      >
        {{ caption }}
      </p>
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col gap-4"
      aria-hidden="true"
    >
      <Skeleton
        v-for="index in 8"
        :key="index"
        class="h-12 w-full rounded-xl"
      />
    </div>

    <p
      v-else-if="statusMessage"
      class="text-sm text-muted-foreground"
    >
      {{ statusMessage }}
    </p>

    <template v-else>
      <div
        v-if="barMode === 'deviation'"
        class="flex justify-between px-2 text-[10px] text-zinc-500"
      >
        <span>Por debajo de la media</span>
        <span>Media</span>
        <span>Por encima</span>
      </div>

      <ul class="flex flex-col gap-4">
        <li
          v-for="(row, index) in visibleRanking"
          :key="row.id"
        >
          <button
            type="button"
            class="w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.03]"
            :class="selectedId === row.id ? accentSelectedClass : ''"
            :aria-pressed="selectedId === row.id"
            @click="emit('select', row.id)"
          >
            <ShareMetricRow
              :rank="index + 1"
              :label="row.label"
              :count="row.value"
              :share="row.share"
              :format-value="formatValue"
              :value-class="accentTextClass"
              :bar-class="barClass"
              :show-share-label="showShareLabel"
              :bar-mode="barMode"
              :delta-vs-baseline="row.deltaVsBaseline"
              :deviation-scale="deviationScale"
              :above-bar-class="aboveBarClass"
              :below-bar-class="belowBarClass"
              :comparison-label="comparisonLabelForRow?.(row) ?? null"
              :comparison-class="comparisonClassForRow?.(row)"
            />
          </button>
        </li>
      </ul>

      <Button
        v-if="hasMore"
        type="button"
        variant="ghost"
        class="self-start rounded-xl text-muted-foreground"
        :class="accentButtonHoverClass"
        @click="showAll = !showAll"
      >
        {{ showAll
          ? 'Ver solo el top'
          : `Ver los ${ranking.length} municipios` }}
      </Button>
    </template>
  </section>
</template>

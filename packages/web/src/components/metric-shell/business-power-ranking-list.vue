<script setup lang="ts">
import type { MunicipalBusinessRankingRow } from '@/domain/municipal-business';
import { computed, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BUSINESS_POWER_TOP_RANKING_LIMIT } from '@/domain/municipal-business';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';

const props = defineProps<{
  ranking: MunicipalBusinessRankingRow[];
  regionName: string;
  isLoading: boolean;
  statusMessage: string | null;
  selectedMunicipalityCode: string | null;
}>();

const emit = defineEmits<{
  select: [municipalityCode: string];
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
    : props.ranking.slice(0, BUSINESS_POWER_TOP_RANKING_LIMIT),
);

const hasMore = computed(
  () => props.ranking.length > BUSINESS_POWER_TOP_RANKING_LIMIT,
);

const maxCount = computed(() => {
  let max = 0;
  for (const row of props.ranking) {
    if (row.activeBusinessCount != null && row.activeBusinessCount > max) {
      max = row.activeBusinessCount;
    }
  }
  return max;
});

function barWidthPercent(count: number | null): number {
  if (count == null || maxCount.value <= 0) {
    return 0;
  }
  return Math.max(4, Math.round((count / maxCount.value) * 100));
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
        Ranking municipal
      </h2>
      <p class="text-sm text-muted-foreground">
        <template v-if="!showAll && hasMore">
          Top {{ BUSINESS_POWER_TOP_RANKING_LIMIT }} en {{ regionName }}
        </template>
        <template v-else>
          Municipios en {{ regionName }}
        </template>
      </p>
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col gap-3"
      aria-hidden="true"
    >
      <Skeleton
        v-for="index in 8"
        :key="index"
        class="h-12 w-full rounded-lg"
      />
    </div>

    <p
      v-else-if="statusMessage"
      class="text-sm text-muted-foreground"
    >
      {{ statusMessage }}
    </p>

    <template v-else>
      <ul class="flex flex-col">
        <li
          v-for="(row, index) in visibleRanking"
          :key="row.municipalityCode"
          class="border-b border-white/5 last:border-b-0"
        >
          <button
            type="button"
            class="flex w-full flex-col gap-2 py-3 text-left transition-colors hover:bg-white/[0.03]"
            :class="selectedMunicipalityCode === row.municipalityCode
              ? 'bg-teal-400/5'
              : ''"
            :aria-pressed="selectedMunicipalityCode === row.municipalityCode"
            @click="emit('select', row.municipalityCode)"
          >
            <div class="flex items-baseline justify-between gap-3">
              <span class="min-w-0 truncate text-sm text-zinc-100 md:text-base">
                <span class="mr-2 text-muted-foreground tabular-nums">
                  {{ index + 1 }}.
                </span>
                {{ row.municipalityName }}
              </span>
              <span class="shrink-0 text-right">
                <span class="text-sm font-semibold text-teal-300 tabular-nums md:text-base">
                  <template v-if="row.activeBusinessCount != null">
                    {{ formatInteger(row.activeBusinessCount) }}
                  </template>
                  <template v-else>
                    —
                  </template>
                </span>
                <span
                  v-if="row.shareOfRegion != null"
                  class="ml-2 text-xs text-muted-foreground tabular-nums"
                >
                  {{ formatPercent(row.shareOfRegion) }}
                </span>
              </span>
            </div>
            <div class="h-1 overflow-hidden rounded-full bg-white/5">
              <div
                class="h-full rounded-full bg-teal-400/70"
                :style="{ width: `${barWidthPercent(row.activeBusinessCount)}%` }"
              />
            </div>
          </button>
        </li>
      </ul>

      <Button
        v-if="hasMore"
        type="button"
        variant="ghost"
        class="self-start rounded-xl text-muted-foreground hover:text-teal-200"
        @click="showAll = !showAll"
      >
        {{ showAll
          ? 'Ver solo el top'
          : `Ver los ${ranking.length} municipios` }}
      </Button>
    </template>
  </section>
</template>

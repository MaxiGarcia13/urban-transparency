<script setup lang="ts">
import type { MunicipalBusinessStats } from '@urban-transparency/shared';
import type { MunicipalBusinessRankingRow } from '@/domain/aggregate-municipal-business-ranking';
import { computed, ref } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';
import {
  sectorBreakdownForMunicipality,
} from '@/domain/aggregate-municipal-business-ranking';
import { dirceSectorLabel } from '@/domain/business-power-filters';
import { cn } from '@/lib/utils';
import { formatInteger } from '@/utils/format-integer';

const props = defineProps<{
  ranking: MunicipalBusinessRankingRow[];
  rows: MunicipalBusinessStats[];
  regionName: string;
  isLoading: boolean;
  statusMessage: string | null;
}>();

const expandedMunicipalityCode = ref<string | null>(null);

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

function toggleExpanded(municipalityCode: string): void {
  expandedMunicipalityCode.value
    = expandedMunicipalityCode.value === municipalityCode
      ? null
      : municipalityCode;
}

function breakdownFor(row: MunicipalBusinessRankingRow): MunicipalBusinessStats[] {
  return sectorBreakdownForMunicipality(
    props.rows,
    row.municipalityCode,
    row.periodYear,
  );
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      v-if="isLoading"
      class="flex flex-col gap-3"
      aria-hidden="true"
    >
      <Skeleton
        v-for="index in 8"
        :key="index"
        class="h-14 w-full rounded-xl"
      />
    </div>

    <p
      v-else-if="statusMessage"
      class="text-sm text-muted-foreground"
    >
      {{ statusMessage }}
    </p>

    <template v-else>
      <p class="text-sm text-muted-foreground">
        Ranking municipal en {{ regionName }}
      </p>

      <ul class="flex flex-col gap-2">
        <li
          v-for="(row, index) in ranking"
          :key="row.municipalityCode"
          class="overflow-hidden rounded-xl border border-white/10 bg-card/40"
        >
          <button
            type="button"
            class="flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-white/5"
            :aria-expanded="expandedMunicipalityCode === row.municipalityCode"
            @click="toggleExpanded(row.municipalityCode)"
          >
            <div class="flex items-baseline justify-between gap-3">
              <span class="min-w-0 truncate text-sm font-medium text-zinc-100 md:text-base">
                <span class="mr-2 text-muted-foreground tabular-nums">
                  {{ index + 1 }}.
                </span>
                {{ row.municipalityName }}
              </span>
              <span class="shrink-0 text-sm font-semibold text-teal-300 tabular-nums md:text-base">
                <template v-if="row.activeBusinessCount != null">
                  {{ formatInteger(row.activeBusinessCount) }}
                </template>
                <template v-else>
                  —
                </template>
              </span>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                class="h-full rounded-full bg-teal-400/70"
                :style="{ width: `${barWidthPercent(row.activeBusinessCount)}%` }"
              />
            </div>
          </button>

          <ul
            v-if="expandedMunicipalityCode === row.municipalityCode"
            class="border-t border-white/10 px-4 py-3"
          >
            <li
              v-for="sectorRow in breakdownFor(row)"
              :key="sectorRow.sectorCode"
              class="flex items-center justify-between gap-3 py-1.5 text-sm"
            >
              <span class="min-w-0 truncate text-muted-foreground">
                {{ dirceSectorLabel(sectorRow.sectorCode) }}
              </span>
              <span
                :class="cn(
                  'shrink-0 tabular-nums',
                  sectorRow.activeBusinessCount == null
                    ? 'text-muted-foreground'
                    : 'text-zinc-100',
                )"
              >
                <template v-if="sectorRow.activeBusinessCount != null">
                  {{ formatInteger(sectorRow.activeBusinessCount) }}
                </template>
                <template v-else>
                  —
                </template>
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </div>
</template>

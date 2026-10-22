<script setup lang="ts">
import type { MunicipalBusinessStats } from '@urban-transparency/shared';
import type { MunicipalBusinessRankingRow } from '@/domain/municipal-business';
import { computed } from 'vue';
import { dirceSectorLabel } from '@/domain/business-power-filters';
import { sectorBreakdownForMunicipality } from '@/domain/municipal-business';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';

const props = defineProps<{
  municipality: MunicipalBusinessRankingRow;
  rows: MunicipalBusinessStats[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const breakdown = computed(() =>
  sectorBreakdownForMunicipality(
    props.rows,
    props.municipality.municipalityCode,
    props.municipality.periodYear,
  ),
);

const maxCount = computed(() => {
  let max = 0;
  for (const row of breakdown.value) {
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
  return Math.max(6, Math.round((count / maxCount.value) * 100));
}
</script>

<template>
  <section class="flex flex-col gap-4 border-t border-white/10 pt-6">
    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="truncate text-lg font-semibold text-zinc-100">
          {{ municipality.municipalityName }}
        </h2>
        <p class="text-sm text-muted-foreground">
          <template v-if="municipality.activeBusinessCount != null">
            {{ formatInteger(municipality.activeBusinessCount) }} empresas
          </template>
          <template v-else>
            Sin dato publicado
          </template>
          <template v-if="municipality.shareOfRegion != null">
            · {{ formatPercent(municipality.shareOfRegion) }} de la región
          </template>
          · {{ municipality.periodYear }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-zinc-100"
        @click="emit('close')"
      >
        Cerrar
      </button>
    </div>

    <ul class="flex flex-col gap-3">
      <li
        v-for="row in breakdown"
        :key="row.sectorCode"
        class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1"
      >
        <span class="truncate text-sm text-zinc-300">
          {{ dirceSectorLabel(row.sectorCode) }}
        </span>
        <span class="text-sm text-zinc-100 tabular-nums">
          <template v-if="row.activeBusinessCount != null">
            {{ formatInteger(row.activeBusinessCount) }}
          </template>
          <template v-else>
            —
          </template>
        </span>
        <div class="col-span-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            class="h-full rounded-full bg-teal-400/60"
            :style="{ width: `${barWidthPercent(row.activeBusinessCount)}%` }"
          />
        </div>
      </li>
    </ul>
  </section>
</template>

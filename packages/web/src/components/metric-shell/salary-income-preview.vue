<script setup lang="ts">
import type { MunicipalIncomeStats } from '@urban-transparency/shared';
import type { MetricRankingRow } from '@/domain/metric-ranking';
import { computed, ref, watch } from 'vue';
import { useMapRegion } from '@/composables/use-map-region';
import { useMunicipalIncomeStats } from '@/composables/use-municipal-income-stats';
import { useSalaryIncomeFilters } from '@/composables/use-salary-income-filters';
import { getMapRegionById } from '@/config/regions';
import {
  buildMunicipalIncomeRanking,
  buildRegionalIncomeYearTrend,
  resolveIncomeStatsPeriodYear,
} from '@/domain/municipal-income';
import { salaryIncomeMeasureLabel } from '@/domain/salary-income-filters';
import { formatEur } from '@/utils/format-eur';
import { formatSignedPercent } from '@/utils/format-signed-percent';
import MetricMunicipalityDetail from './metric-municipality-detail.vue';
import MetricRankingList from './metric-ranking-list.vue';
import MetricTrendChart from './metric-trend-chart.vue';

const { filters } = useSalaryIncomeFilters();
const { regionId } = useMapRegion();
const selectedRegion = computed(() => getMapRegionById(regionId.value));
const selectedMunicipalityCode = ref<string | null>(null);

const { rows, isLoading, isError } = useMunicipalIncomeStats(
  () => selectedRegion.value.provinceCodes,
);

const resolvedYear = computed(() =>
  resolveIncomeStatsPeriodYear(rows.value, filters.value.periodYear),
);

const trend = computed(() =>
  buildRegionalIncomeYearTrend(rows.value, filters.value.measure),
);

const provincialMean = computed(() => {
  const year = resolvedYear.value;
  if (year == null) {
    return null;
  }
  return trend.value.find((point) => point.year === year)?.value ?? null;
});

const ranking = computed(() =>
  buildMunicipalIncomeRanking(
    rows.value,
    filters.value,
    provincialMean.value,
  ),
);

const selectedRow = computed(() => {
  if (!selectedMunicipalityCode.value) {
    return null;
  }
  return (
    ranking.value.find((row) => row.id === selectedMunicipalityCode.value)
    ?? null
  );
});

const selectedStats = computed((): MunicipalIncomeStats | null => {
  if (
    selectedMunicipalityCode.value == null
    || resolvedYear.value == null
  ) {
    return null;
  }
  return (
    rows.value.find(
      (row) =>
        row.municipalityCode === selectedMunicipalityCode.value
        && row.periodYear === resolvedYear.value,
    ) ?? null
  );
});

const selectedDetailTitle = computed(() => selectedRow.value?.label ?? null);

const selectedDetailDescription = computed(() => {
  const stats = selectedStats.value;
  if (stats == null) {
    return '';
  }
  const parts = [String(stats.periodYear)];
  const delta = selectedRow.value?.deltaVsBaseline;
  if (delta != null && provincialMean.value != null) {
    parts.push(
      `${formatSignedPercent(delta)} vs media provincial (${formatEur(provincialMean.value)})`,
    );
  }
  return parts.join(' · ');
});

const listStatusMessage = computed(() => {
  if (isLoading.value) {
    return null;
  }
  if (isError.value) {
    return 'No se pudieron cargar las estadísticas de renta';
  }
  if (rows.value.length === 0) {
    return 'Aún no hay datos ADRH scrapeados para esta región';
  }
  if (ranking.value.length === 0) {
    return 'No hay municipios con datos para los filtros seleccionados';
  }
  return null;
});

const rankingSubtitle = computed(() => {
  if (provincialMean.value == null || resolvedYear.value == null) {
    return `Municipios en ${selectedRegion.value.name}`;
  }
  return `Respecto a la media provincial de ${formatEur(provincialMean.value)} (${resolvedYear.value})`;
});

const measureLabel = computed(() =>
  salaryIncomeMeasureLabel(filters.value.measure),
);

function comparisonLabelForRow(row: MetricRankingRow): string | null {
  if (row.deltaVsBaseline == null) {
    return null;
  }
  const signed = formatSignedPercent(row.deltaVsBaseline);
  if (row.deltaVsBaseline > 0) {
    return `${signed} vs media · por encima`;
  }
  if (row.deltaVsBaseline < 0) {
    return `${signed} vs media · por debajo`;
  }
  return 'Igual que la media provincial';
}

function comparisonClassForRow(row: MetricRankingRow): string {
  if (row.deltaVsBaseline == null) {
    return 'text-muted-foreground';
  }
  if (row.deltaVsBaseline > 0) {
    return 'text-sky-300/90';
  }
  if (row.deltaVsBaseline < 0) {
    return 'text-orange-300/90';
  }
  return 'text-muted-foreground';
}

watch(regionId, () => {
  selectedMunicipalityCode.value = null;
});

watch(
  () => filters.value,
  () => {
    selectedMunicipalityCode.value = null;
  },
  { deep: true },
);

function selectMunicipality(municipalityCode: string): void {
  selectedMunicipalityCode.value = municipalityCode;
}
</script>

<template>
  <div class="relative flex h-full min-h-0 w-full flex-col bg-zinc-950 lg:flex-1">
    <div class="flex h-full min-h-0 flex-col pt-[var(--metric-aside-offset,0px)] pb-16 lg:pt-16 lg:pb-0">
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-8">
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-10 md:gap-12">
          <p class="text-sm leading-relaxed text-muted-foreground md:text-base">
            La
            <span class="text-zinc-200">línea</span>
            es la media de la provincia. El
            <span class="text-zinc-200">ranking</span>
            compara municipios con esa media.
          </p>

          <MetricTrendChart
            title="Evolución provincial"
            :points="trend"
            :selected-year="resolvedYear"
            :subtitle="`${measureLabel} · cómo cambia la media de ${selectedRegion.name}`"
            caption="Cada punto es un año de la media oficial provincial (INE ADRH), no un municipio."
            latest-label="Media provincial"
            :format-value="formatEur"
            accent-text-class="text-sky-300"
            accent-muted-text-class="text-sky-300/80"
            accent-stroke-class="stroke-sky-300"
            accent-fill-class="fill-sky-400/15"
            accent-dot-class="fill-sky-400"
            accent-dot-active-class="fill-sky-200"
            :is-loading="isLoading"
          />

          <MetricRankingList
            title="Municipios vs media"
            :ranking="ranking"
            :region-name="selectedRegion.name"
            :subtitle="rankingSubtitle"
            caption="La marca central es la media provincial. Azul = por encima; naranja = por debajo."
            :is-loading="isLoading"
            :status-message="listStatusMessage"
            :selected-id="selectedMunicipalityCode"
            :format-value="formatEur"
            accent-text-class="text-sky-300"
            accent-selected-class="bg-sky-400/5"
            accent-button-hover-class="hover:text-sky-200"
            bar-mode="deviation"
            :show-share-label="false"
            :comparison-label-for-row="comparisonLabelForRow"
            :comparison-class-for-row="comparisonClassForRow"
            @select="selectMunicipality"
          />
        </div>
      </div>
    </div>

    <MetricMunicipalityDetail
      :title="selectedDetailTitle"
      :description="selectedDetailDescription"
      @close="selectedMunicipalityCode = null"
    >
      <dl
        v-if="selectedStats"
        class="flex flex-col gap-4 text-sm"
      >
        <div class="flex flex-col gap-1">
          <dt class="text-muted-foreground">
            Renta neta media por persona
          </dt>
          <dd class="text-lg font-medium text-sky-300 tabular-nums">
            <template v-if="selectedStats.meanNetIncomePerPerson != null">
              {{ formatEur(selectedStats.meanNetIncomePerPerson) }}
            </template>
            <template v-else>
              —
            </template>
          </dd>
        </div>
        <div class="flex flex-col gap-1">
          <dt class="text-muted-foreground">
            Renta neta media por hogar
          </dt>
          <dd class="text-lg font-medium text-sky-300 tabular-nums">
            <template v-if="selectedStats.meanNetIncomePerHousehold != null">
              {{ formatEur(selectedStats.meanNetIncomePerHousehold) }}
            </template>
            <template v-else>
              —
            </template>
          </dd>
        </div>
      </dl>
    </MetricMunicipalityDetail>
  </div>
</template>

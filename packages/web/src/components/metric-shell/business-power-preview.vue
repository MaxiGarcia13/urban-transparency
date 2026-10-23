<script setup lang="ts">
import type { MetricRankingRow, MetricTrendPoint } from '@/domain/metric-ranking';
import { computed, ref, watch } from 'vue';
import { useBusinessPowerFilters } from '@/composables/use-business-power-filters';
import { useMapRegion } from '@/composables/use-map-region';
import { useMunicipalBusinessStats } from '@/composables/use-municipal-business-stats';
import { getMapRegionById } from '@/config/regions';
import { dirceSectorLabel } from '@/domain/business-power-filters';
import {
  buildMunicipalBusinessRanking,
  buildRegionalSectorComposition,
  buildRegionalYearTrend,
  resolveBusinessStatsPeriodYear,
  sectorBreakdownForMunicipality,
} from '@/domain/municipal-business';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';
import BusinessPowerSectorChart from './business-power-sector-chart.vue';
import BusinessSectorCompositionList from './business-sector-composition-list.vue';
import MetricMunicipalityDetail from './metric-municipality-detail.vue';
import MetricRankingList from './metric-ranking-list.vue';
import MetricTrendChart from './metric-trend-chart.vue';

const { filters } = useBusinessPowerFilters();
const { regionId } = useMapRegion();
const selectedRegion = computed(() => getMapRegionById(regionId.value));
const selectedMunicipalityCode = ref<string | null>(null);

const { rows, isLoading, isError } = useMunicipalBusinessStats(
  () => selectedRegion.value.provinceCodes,
);

const resolvedYear = computed(() =>
  resolveBusinessStatsPeriodYear(rows.value, filters.value.periodYear),
);

const businessRanking = computed(() =>
  buildMunicipalBusinessRanking(rows.value, filters.value),
);

const ranking = computed((): MetricRankingRow[] =>
  businessRanking.value.map((row) => ({
    id: row.municipalityCode,
    label: row.municipalityName,
    value: row.activeBusinessCount,
    share: row.shareOfRegion,
  })),
);

const composition = computed(() =>
  buildRegionalSectorComposition(rows.value, filters.value.periodYear),
);

const trend = computed((): MetricTrendPoint[] =>
  buildRegionalYearTrend(rows.value, filters.value.sectorCode).map((point) => ({
    year: point.periodYear,
    value: point.activeBusinessCount,
  })),
);

const selectedBusinessRow = computed(() => {
  if (!selectedMunicipalityCode.value) {
    return null;
  }
  return (
    businessRanking.value.find(
      (row) => row.municipalityCode === selectedMunicipalityCode.value,
    ) ?? null
  );
});

const selectedDetailTitle = computed(
  () => selectedBusinessRow.value?.municipalityName ?? null,
);

const selectedDetailDescription = computed(() => {
  const municipality = selectedBusinessRow.value;
  if (municipality == null) {
    return '';
  }
  const parts: string[] = [];
  if (municipality.activeBusinessCount != null) {
    parts.push(`${formatInteger(municipality.activeBusinessCount)} empresas`);
  } else {
    parts.push('Sin dato publicado');
  }
  if (municipality.shareOfRegion != null) {
    parts.push(`${formatPercent(municipality.shareOfRegion)} de la región`);
  }
  parts.push(String(municipality.periodYear));
  return parts.join(' · ');
});

const selectedSectorComposition = computed(() => {
  if (selectedBusinessRow.value == null) {
    return [];
  }
  return sectorBreakdownForMunicipality(
    rows.value,
    selectedBusinessRow.value.municipalityCode,
    selectedBusinessRow.value.periodYear,
  );
});

const listStatusMessage = computed(() => {
  if (isLoading.value) {
    return null;
  }
  if (isError.value) {
    return 'No se pudieron cargar las estadísticas empresariales';
  }
  if (rows.value.length === 0) {
    return 'Aún no hay datos DIRCE scrapeados para esta región';
  }
  if (ranking.value.length === 0) {
    return 'No hay municipios con datos para los filtros seleccionados';
  }
  return null;
});

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
          <BusinessPowerSectorChart
            :composition="composition"
            :is-loading="isLoading"
          />

          <MetricTrendChart
            :points="trend"
            :selected-year="resolvedYear"
            :subtitle="`${dirceSectorLabel(filters.sectorCode)} · serie anual DIRCE`"
            :format-value="formatInteger"
            :is-loading="isLoading"
          />

          <MetricRankingList
            :ranking="ranking"
            :region-name="selectedRegion.name"
            :is-loading="isLoading"
            :status-message="listStatusMessage"
            :selected-id="selectedMunicipalityCode"
            :format-value="formatInteger"
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
      <BusinessSectorCompositionList :composition="selectedSectorComposition" />
    </MetricMunicipalityDetail>
  </div>
</template>

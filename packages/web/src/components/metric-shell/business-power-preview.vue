<script setup lang="ts">
import type { BusinessPowerFilters } from '@/domain/business-power-filters';
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
} from '@/domain/municipal-business';
import BusinessPowerMunicipalityDetail from './business-power-municipality-detail.vue';
import BusinessPowerRankingList from './business-power-ranking-list.vue';
import BusinessPowerSectorChart from './business-power-sector-chart.vue';
import BusinessPowerTrendChart from './business-power-trend-chart.vue';

const props = defineProps<{
  regionId: string;
  filters: BusinessPowerFilters;
}>();

const { filters } = useBusinessPowerFilters(props.filters);
const { regionId } = useMapRegion(props.regionId);
const selectedRegion = computed(() => getMapRegionById(regionId.value));
const selectedMunicipalityCode = ref<string | null>(null);

const { rows, isLoading, isError } = useMunicipalBusinessStats(
  () => selectedRegion.value.provinceCodes,
);

const resolvedYear = computed(() =>
  resolveBusinessStatsPeriodYear(rows.value, filters.value.periodYear),
);

const ranking = computed(() =>
  buildMunicipalBusinessRanking(rows.value, filters.value),
);

const composition = computed(() =>
  buildRegionalSectorComposition(rows.value, filters.value.periodYear),
);

const trend = computed(() =>
  buildRegionalYearTrend(rows.value, filters.value.sectorCode),
);

const selectedMunicipality = computed(() => {
  if (!selectedMunicipalityCode.value) {
    return null;
  }
  return (
    ranking.value.find(
      (row) => row.municipalityCode === selectedMunicipalityCode.value,
    ) ?? null
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
  selectedMunicipalityCode.value
    = selectedMunicipalityCode.value === municipalityCode
      ? null
      : municipalityCode;
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

          <BusinessPowerTrendChart
            :trend="trend"
            :selected-year="resolvedYear"
            :sector-label="dirceSectorLabel(filters.sectorCode)"
            :is-loading="isLoading"
          />

          <BusinessPowerRankingList
            :ranking="ranking"
            :region-name="selectedRegion.name"
            :is-loading="isLoading"
            :status-message="listStatusMessage"
            :selected-municipality-code="selectedMunicipalityCode"
            @select="selectMunicipality"
          />

          <BusinessPowerMunicipalityDetail
            v-if="selectedMunicipality"
            :municipality="selectedMunicipality"
            :rows="rows"
            @close="selectedMunicipalityCode = null"
          />
        </div>
      </div>
    </div>
  </div>
</template>

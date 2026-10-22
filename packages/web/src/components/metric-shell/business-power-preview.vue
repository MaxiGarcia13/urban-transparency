<script setup lang="ts">
import type { BusinessPowerFilters } from '@/domain/business-power-filters';
import { computed } from 'vue';
import { useBusinessPowerFilters } from '@/composables/use-business-power-filters';
import { useMapRegion } from '@/composables/use-map-region';
import { useMunicipalBusinessStats } from '@/composables/use-municipal-business-stats';
import { getMapRegionById } from '@/config/regions';
import {
  buildMunicipalBusinessRanking,
} from '@/domain/aggregate-municipal-business-ranking';
import BusinessPowerRankingList from './business-power-ranking-list.vue';

const props = defineProps<{
  regionId: string;
  filters: BusinessPowerFilters;
}>();

const { filters } = useBusinessPowerFilters(props.filters);
const { regionId } = useMapRegion(props.regionId);
const selectedRegion = computed(() => getMapRegionById(regionId.value));

const { rows, isLoading, isError } = useMunicipalBusinessStats(
  () => selectedRegion.value.provinceCodes,
);

const ranking = computed(() =>
  buildMunicipalBusinessRanking(rows.value, filters.value),
);

const statusMessage = computed(() => {
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
</script>

<template>
  <div class="relative flex h-full min-h-0 w-full flex-col bg-zinc-950 lg:flex-1">
    <div class="flex h-full min-h-0 flex-col pt-[var(--metric-aside-offset,0px)] pb-16 lg:pt-16 lg:pb-0">
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-8">
        <BusinessPowerRankingList
          :ranking="ranking"
          :rows="rows"
          :region-name="selectedRegion.name"
          :is-loading="isLoading"
          :status-message="statusMessage"
        />
      </div>
    </div>
  </div>
</template>

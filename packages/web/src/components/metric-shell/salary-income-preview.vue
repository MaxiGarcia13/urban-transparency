<script setup lang="ts">
import { computed } from 'vue';
import { useMapRegion } from '@/composables/use-map-region';
import { useMunicipalIncomeStats } from '@/composables/use-municipal-income-stats';
import { useSalaryIncomeFilters } from '@/composables/use-salary-income-filters';
import { getMapRegionById } from '@/config/regions';
import { salaryIncomeMeasureLabel } from '@/domain/salary-income-filters';

const { filters } = useSalaryIncomeFilters();
const { regionId } = useMapRegion();
const selectedRegion = computed(() => getMapRegionById(regionId.value));

const { rows, isLoading, isError } = useMunicipalIncomeStats(
  () => selectedRegion.value.provinceCodes,
);

const statusMessage = computed(() => {
  if (isLoading.value) {
    return 'Cargando rentas municipales…';
  }
  if (isError.value) {
    return 'No se pudieron cargar las estadísticas de renta';
  }
  if (rows.value.length === 0) {
    return 'Aún no hay datos ADRH scrapeados para esta región';
  }
  return null;
});

const measureLabel = computed(() =>
  salaryIncomeMeasureLabel(filters.value.measure),
);
</script>

<template>
  <div class="relative flex h-full min-h-0 w-full flex-col bg-zinc-950 lg:flex-1">
    <div class="flex h-full min-h-0 flex-col pt-[var(--metric-aside-offset,0px)] pb-16 lg:pt-16 lg:pb-0">
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-8">
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-6 md:gap-8">
          <p class="text-sm text-muted-foreground md:text-base">
            {{ selectedRegion.name }}
            ·
            {{ measureLabel }}
            <template v-if="filters.periodYear != null">
              ·
              {{ filters.periodYear }}
            </template>
          </p>

          <p
            v-if="statusMessage"
            class="text-sm text-muted-foreground md:text-base"
          >
            {{ statusMessage }}
          </p>
          <p
            v-else
            class="text-sm text-muted-foreground md:text-base"
          >
            {{ rows.length }} registros de renta cargados para esta región.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

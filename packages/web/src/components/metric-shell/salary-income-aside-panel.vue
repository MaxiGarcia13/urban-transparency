<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { onKeyStroke } from '@vueuse/core';
import { ChevronDown } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import LandingHeroIncomeSummary from '@/components/landing-hero/landing-hero-income-summary.vue';
import { SalaryIncomeFiltersForm } from '@/components/salary-income-filters';
import { Button } from '@/components/ui/button';
import { useMapRegion } from '@/composables/use-map-region';
import { useMunicipalIncomeStats } from '@/composables/use-municipal-income-stats';
import { useSalaryIncomeFilters } from '@/composables/use-salary-income-filters';
import { getMapRegionById } from '@/config/regions';
import {
  availableIncomeStatsYears,
  buildRegionalIncomeYearTrend,
  incomeYearOverYearChange,
  resolveIncomeStatsPeriodYear,
} from '@/domain/municipal-income';
import { salaryIncomeMeasureLabel } from '@/domain/salary-income-filters';
import { cn } from '@/lib/utils';
import { $metricAsideCollapsed } from '@/stores/metric-aside-ui';
import MetricAside from './metric-aside.vue';

const isAsideCollapsed = useStore($metricAsideCollapsed);
const { regionId } = useMapRegion();
const {
  filters: incomeFilters,
  periodYear,
  measure,
} = useSalaryIncomeFilters();

const selectedRegion = computed(() => getMapRegionById(regionId.value));
const regionName = computed(() => selectedRegion.value.name);
const { rows, isLoading } = useMunicipalIncomeStats(
  () => selectedRegion.value.provinceCodes,
);
const availableYears = computed(() => availableIncomeStatsYears(rows.value));

const incomePeriodYear = computed(() =>
  resolveIncomeStatsPeriodYear(
    rows.value,
    incomeFilters.value.periodYear,
  ),
);
const incomeTrend = computed(() =>
  buildRegionalIncomeYearTrend(
    rows.value,
    incomeFilters.value.measure,
  ),
);
const incomeMean = computed(() => {
  const year = incomePeriodYear.value;
  if (year == null) {
    return null;
  }
  return incomeTrend.value.find((point) => point.year === year)?.value ?? null;
});
const incomeYearOverYear = computed(() =>
  incomeYearOverYearChange(
    incomeTrend.value,
    incomePeriodYear.value,
  ),
);
const measureLabel = computed(() =>
  salaryIncomeMeasureLabel(incomeFilters.value.measure),
);

const isPanelExpanded = ref(false);

function togglePanelExpanded(): void {
  isPanelExpanded.value = !isPanelExpanded.value;
}

onKeyStroke('Escape', () => {
  if (isPanelExpanded.value) {
    isPanelExpanded.value = false;
  }
});
</script>

<template>
  <MetricAside metric-id="salary-income">
    <template #description>
      Renta neta media oficial (INE ADRH) en
      {{ regionName }}:
      evolución de la media provincial y ranking de municipios respecto a esa media.
    </template>
    <LandingHeroIncomeSummary
      :mean-income="incomeMean"
      :period-year="incomePeriodYear"
      :measure-label="measureLabel"
      :year-over-year="incomeYearOverYear"
      :is-loading="isLoading"
    />
  </MetricAside>

  <div
    v-show="!isAsideCollapsed"
    class="flex min-h-0 flex-1 flex-col text-zinc-100"
  >
    <div class="shrink-0 px-4 pb-4 md:px-8 lg:hidden">
      <Button
        type="button"
        variant="outline"
        class="flex h-auto w-full items-center justify-between rounded-xl border-border bg-card/80 px-4 py-2 text-sm text-foreground"
        :aria-expanded="isPanelExpanded"
        aria-controls="metric-aside-panel"
        @click="togglePanelExpanded"
      >
        <span>{{ isPanelExpanded ? 'Ocultar filtros' : 'Filtros' }}</span>
        <ChevronDown
          :class="cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            isPanelExpanded ? 'rotate-180' : '',
          )"
        />
      </Button>
    </div>

    <div
      id="metric-aside-panel"
      class="grid min-h-0 transition-[grid-template-rows] duration-300 ease-out lg:min-h-0 lg:flex-1"
      :class="isPanelExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] lg:grid-rows-[1fr]'"
    >
      <div class="min-h-0 overflow-hidden">
        <div
          class="flex max-h-[min(48dvh,100%)] min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-4 md:gap-8 md:px-8 md:pb-8 lg:h-full lg:max-h-none"
        >
          <SalaryIncomeFiltersForm
            v-model:period-year="periodYear"
            v-model:measure="measure"
            :available-years="availableYears"
          />
        </div>
      </div>
    </div>
  </div>
</template>

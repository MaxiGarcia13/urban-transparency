<script setup lang="ts">
import { computed } from 'vue';
import LandingHeroEconomySummary from '@/components/landing-hero/landing-hero-economy-summary.vue';
import { useLocalEconomyFilters } from '@/composables/use-local-economy-filters';
import { useMapRegion } from '@/composables/use-map-region';
import { useMunicipalBusinessStats } from '@/composables/use-municipal-business-stats';
import { useMunicipalIncomeStats } from '@/composables/use-municipal-income-stats';
import { getMapRegionById } from '@/config/regions';
import { salaryIncomeMeasureLabel } from '@/domain/local-economy-filters';
import {
  buildMunicipalBusinessRanking,
  buildRegionalYearTrend,
  sumActiveBusinessCount,
  yearOverYearChange,
} from '@/domain/municipal-business';
import { resolveEconomyJoinYear } from '@/domain/municipal-economy';
import {
  buildRegionalIncomeYearTrend,
  incomeYearOverYearChange,
} from '@/domain/municipal-income';
import MetricAside from './metric-aside.vue';

const { regionId } = useMapRegion();
const { filters: economyFilters } = useLocalEconomyFilters();

const selectedRegion = computed(() => getMapRegionById(regionId.value));
const regionName = computed(() => selectedRegion.value.name);

const { rows: businessRows, isLoading: businessLoading }
  = useMunicipalBusinessStats(() => selectedRegion.value.provinceCodes);
const { rows: incomeRows, isLoading: incomeLoading }
  = useMunicipalIncomeStats(() => selectedRegion.value.provinceCodes);

const isLoading = computed(
  () => businessLoading.value || incomeLoading.value,
);

const joinYear = computed(() =>
  resolveEconomyJoinYear(
    businessRows.value,
    incomeRows.value,
    economyFilters.value.periodYear,
  ),
);

const businessRanking = computed(() =>
  buildMunicipalBusinessRanking(businessRows.value, {
    periodYear: joinYear.value,
    sectorCode: economyFilters.value.sectorCode,
  }),
);

const businessTotal = computed(() =>
  sumActiveBusinessCount(businessRanking.value),
);

const businessYearOverYear = computed(() =>
  yearOverYearChange(
    buildRegionalYearTrend(
      businessRows.value,
      economyFilters.value.sectorCode,
    ),
    joinYear.value,
  ),
);

const incomeTrend = computed(() =>
  buildRegionalIncomeYearTrend(
    incomeRows.value,
    economyFilters.value.measure,
  ),
);

const incomeMean = computed(() => {
  const year = joinYear.value;
  if (year == null) {
    return null;
  }
  return incomeTrend.value.find((point) => point.year === year)?.value ?? null;
});

const incomeYearOverYear = computed(() =>
  incomeYearOverYearChange(incomeTrend.value, joinYear.value),
);

const measureLabel = computed(() =>
  salaryIncomeMeasureLabel(economyFilters.value.measure),
);
</script>

<template>
  <MetricAside metric-id="local-economy">
    <template #description>
      Cruce de empresas activas (DIRCE) y renta neta media (ADRH) en
      {{ regionName }}.
      Solo se usan años disponibles en ambas fuentes.
    </template>
    <LandingHeroEconomySummary
      :join-year="joinYear"
      :total-active-businesses="businessTotal"
      :mean-income="incomeMean"
      :measure-label="measureLabel"
      :business-year-over-year="businessYearOverYear"
      :income-year-over-year="incomeYearOverYear"
      :is-loading="isLoading"
    />
  </MetricAside>
</template>

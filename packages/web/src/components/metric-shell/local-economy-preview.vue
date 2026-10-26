<script setup lang="ts">
import type { MunicipalIncomeStats } from '@urban-transparency/shared';
import type { MetricRankingRow, MetricTrendPoint } from '@/domain/metric-ranking';
import { computed, ref, watch } from 'vue';
import { LocalEconomyFiltersForm } from '@/components/local-economy-filters';
import { useLocalEconomyFilters } from '@/composables/use-local-economy-filters';
import { useMapRegion } from '@/composables/use-map-region';
import { useMunicipalBusinessStats } from '@/composables/use-municipal-business-stats';
import { useMunicipalIncomeStats } from '@/composables/use-municipal-income-stats';
import { usePublicContracts } from '@/composables/use-public-contracts';
import { getMapRegionById } from '@/config/regions';
import { aggregateSpendingByMunicipality } from '@/domain/aggregate-municipal-spending';
import {
  dirceSectorLabel,
  salaryIncomeMeasureLabel,
} from '@/domain/local-economy-filters';
import { MAP_REGION_QUERY_KEY } from '@/domain/map-region-query';
import {
  buildRegionalSectorComposition,
  buildRegionalYearTrend,
  sectorBreakdownForMunicipality,
} from '@/domain/municipal-business';
import {
  availableEconomyJoinYears,
  buildMunicipalEconomySnapshots,
  resolveEconomyJoinYear,
} from '@/domain/municipal-economy';
import { buildRegionalIncomeYearTrend } from '@/domain/municipal-income';
import { formatEur } from '@/utils/format-eur';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';
import { formatSignedPercent } from '@/utils/format-signed-percent';
import BusinessPowerSectorChart from './business-power-sector-chart.vue';
import BusinessSectorCompositionList from './business-sector-composition-list.vue';
import LocalEconomyScatterChart from './local-economy-scatter-chart.vue';
import MetricMunicipalityDetail from './metric-municipality-detail.vue';
import MetricRankingList from './metric-ranking-list.vue';
import MetricTrendChart from './metric-trend-chart.vue';

const {
  filters,
  periodYear,
  sectorCode,
  measure,
} = useLocalEconomyFilters();
const { regionId } = useMapRegion();
const selectedRegion = computed(() => getMapRegionById(regionId.value));
const selectedMunicipalityCode = ref<string | null>(null);

const { rows: businessRows, isLoading: businessLoading, isError: businessError }
  = useMunicipalBusinessStats(() => selectedRegion.value.provinceCodes);
const { rows: incomeRows, isLoading: incomeLoading, isError: incomeError }
  = useMunicipalIncomeStats(() => selectedRegion.value.provinceCodes);
const { contracts, isLoading: contractsLoading }
  = usePublicContracts(() => selectedRegion.value.provinceCodes);

const isLoading = computed(
  () => businessLoading.value || incomeLoading.value,
);

const availableYears = computed(() =>
  availableEconomyJoinYears(businessRows.value, incomeRows.value),
);

const joinYear = computed(() =>
  resolveEconomyJoinYear(
    businessRows.value,
    incomeRows.value,
    filters.value.periodYear,
  ),
);

const incomeTrend = computed(() =>
  buildRegionalIncomeYearTrend(incomeRows.value, filters.value.measure),
);

const provincialMean = computed(() => {
  const year = joinYear.value;
  if (year == null) {
    return null;
  }
  return incomeTrend.value.find((point) => point.year === year)?.value ?? null;
});

const snapshots = computed(() =>
  buildMunicipalEconomySnapshots(
    businessRows.value,
    incomeRows.value,
    filters.value,
    provincialMean.value,
  ),
);

const spendingByMunicipality = computed(() =>
  aggregateSpendingByMunicipality(contracts.value),
);

const composition = computed(() =>
  buildRegionalSectorComposition(businessRows.value, joinYear.value),
);

const businessTrend = computed((): MetricTrendPoint[] =>
  buildRegionalYearTrend(businessRows.value, filters.value.sectorCode).map(
    (point) => ({
      year: point.periodYear,
      value: point.activeBusinessCount,
    }),
  ),
);

const incomeTrendPoints = computed((): MetricTrendPoint[] => incomeTrend.value);

const ranking = computed((): MetricRankingRow[] =>
  [...snapshots.value]
    .sort((a, b) => {
      const aDelta = a.incomeDeltaVsProvincialMean;
      const bDelta = b.incomeDeltaVsProvincialMean;
      if (aDelta == null && bDelta == null) {
        return a.municipalityName.localeCompare(b.municipalityName, 'es');
      }
      if (aDelta == null) {
        return 1;
      }
      if (bDelta == null) {
        return -1;
      }
      return bDelta - aDelta;
    })
    .map((row) => ({
      id: row.municipalityCode,
      label: row.municipalityName,
      value: row.meanIncome,
      share: row.businessPercentile,
      deltaVsBaseline: row.incomeDeltaVsProvincialMean,
    })),
);

const selectedSnapshot = computed(() => {
  if (!selectedMunicipalityCode.value) {
    return null;
  }
  return (
    snapshots.value.find(
      (row) => row.municipalityCode === selectedMunicipalityCode.value,
    ) ?? null
  );
});

const selectedIncomeStats = computed((): MunicipalIncomeStats | null => {
  if (
    selectedMunicipalityCode.value == null
    || joinYear.value == null
  ) {
    return null;
  }
  return (
    incomeRows.value.find(
      (row) =>
        row.municipalityCode === selectedMunicipalityCode.value
        && row.periodYear === joinYear.value,
    ) ?? null
  );
});

const selectedSpending = computed(() => {
  if (selectedMunicipalityCode.value == null) {
    return null;
  }
  return (
    spendingByMunicipality.value.get(selectedMunicipalityCode.value) ?? null
  );
});

const selectedSectorComposition = computed(() => {
  if (selectedSnapshot.value == null) {
    return [];
  }
  return sectorBreakdownForMunicipality(
    businessRows.value,
    selectedSnapshot.value.municipalityCode,
    selectedSnapshot.value.periodYear,
  );
});

const selectedDetailTitle = computed(
  () => selectedSnapshot.value?.municipalityName ?? null,
);

const selectedDetailDescription = computed(() => {
  const snapshot = selectedSnapshot.value;
  if (snapshot == null) {
    return '';
  }
  const parts = [String(snapshot.periodYear)];
  if (snapshot.activeBusinessCount != null) {
    parts.push(`${formatInteger(snapshot.activeBusinessCount)} empresas`);
  }
  if (snapshot.incomeDeltaVsProvincialMean != null) {
    parts.push(
      `${formatSignedPercent(snapshot.incomeDeltaVsProvincialMean)} vs media provincial`,
    );
  }
  return parts.join(' · ');
});

const publicSpendingHref = computed(() => {
  const params = new URLSearchParams();
  params.set(MAP_REGION_QUERY_KEY, regionId.value);
  return `/?${params.toString()}`;
});

const listStatusMessage = computed(() => {
  if (isLoading.value) {
    return null;
  }
  if (businessError.value || incomeError.value) {
    return 'No se pudieron cargar los datos de economía local';
  }
  if (businessRows.value.length === 0 || incomeRows.value.length === 0) {
    return 'Aún faltan datos DIRCE o ADRH scrapeados para esta región';
  }
  if (snapshots.value.length === 0) {
    return 'No hay municipios con ambos datos para los filtros seleccionados';
  }
  return null;
});

const rankingSubtitle = computed(() => {
  if (provincialMean.value == null || joinYear.value == null) {
    return `Municipios en ${selectedRegion.value.name}`;
  }
  return `Renta vs media provincial de ${formatEur(provincialMean.value)} (${joinYear.value})`;
});

const measureLabel = computed(() =>
  salaryIncomeMeasureLabel(filters.value.measure),
);

function comparisonLabelForRow(row: MetricRankingRow): string | null {
  if (row.deltaVsBaseline == null) {
    return null;
  }
  const signed = formatSignedPercent(row.deltaVsBaseline);
  const firmShare
    = row.share != null ? ` · percentil empresas ${formatPercent(row.share)}` : '';
  if (row.deltaVsBaseline > 0) {
    return `${signed} vs media · por encima${firmShare}`;
  }
  if (row.deltaVsBaseline < 0) {
    return `${signed} vs media · por debajo${firmShare}`;
  }
  return `Igual que la media provincial${firmShare}`;
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
          <LocalEconomyFiltersForm
            v-model:period-year="periodYear"
            v-model:sector-code="sectorCode"
            v-model:measure="measure"
            :available-years="availableYears"
          />

          <p class="text-sm leading-relaxed text-muted-foreground md:text-base">
            Cada punto es un municipio con
            <span class="text-zinc-200">empresas</span>
            (DIRCE) y
            <span class="text-zinc-200">renta</span>
            (ADRH) en el mismo año.
          </p>

          <LocalEconomyScatterChart
            :snapshots="snapshots"
            :selected-id="selectedMunicipalityCode"
            :is-loading="isLoading"
            @select="selectMunicipality"
          />

          <BusinessPowerSectorChart
            :composition="composition"
            :is-loading="isLoading"
          />

          <MetricTrendChart
            title="Empresas en la región"
            :points="businessTrend"
            :selected-year="joinYear"
            :subtitle="`${dirceSectorLabel(filters.sectorCode)} · serie anual DIRCE`"
            :format-value="formatInteger"
            :is-loading="isLoading"
          />

          <MetricTrendChart
            title="Renta media provincial"
            :points="incomeTrendPoints"
            :selected-year="joinYear"
            :subtitle="`${measureLabel} · media oficial ADRH`"
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
            title="Municipios vs media de renta"
            :ranking="ranking"
            :region-name="selectedRegion.name"
            :subtitle="rankingSubtitle"
            caption="Azul = renta por encima de la media; naranja = por debajo. El percentil de empresas aparece en la comparación."
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
      <div class="flex flex-col gap-8">
        <dl
          v-if="selectedIncomeStats || selectedSnapshot"
          class="flex flex-col gap-4 text-sm"
        >
          <div
            v-if="selectedSnapshot"
            class="flex flex-col gap-1"
          >
            <dt class="text-muted-foreground">
              Empresas activas ({{ dirceSectorLabel(selectedSnapshot.sectorCode) }})
            </dt>
            <dd class="text-lg font-medium text-teal-300 tabular-nums">
              <template v-if="selectedSnapshot.activeBusinessCount != null">
                {{ formatInteger(selectedSnapshot.activeBusinessCount) }}
              </template>
              <template v-else>
                —
              </template>
            </dd>
          </div>
          <div
            v-if="selectedIncomeStats"
            class="flex flex-col gap-1"
          >
            <dt class="text-muted-foreground">
              Renta neta media por persona
            </dt>
            <dd class="text-lg font-medium text-sky-300 tabular-nums">
              <template v-if="selectedIncomeStats.meanNetIncomePerPerson != null">
                {{ formatEur(selectedIncomeStats.meanNetIncomePerPerson) }}
              </template>
              <template v-else>
                —
              </template>
            </dd>
          </div>
          <div
            v-if="selectedIncomeStats"
            class="flex flex-col gap-1"
          >
            <dt class="text-muted-foreground">
              Renta neta media por hogar
            </dt>
            <dd class="text-lg font-medium text-sky-300 tabular-nums">
              <template v-if="selectedIncomeStats.meanNetIncomePerHousehold != null">
                {{ formatEur(selectedIncomeStats.meanNetIncomePerHousehold) }}
              </template>
              <template v-else>
                —
              </template>
            </dd>
          </div>
        </dl>

        <div
          v-if="selectedSectorComposition.length > 0"
          class="flex flex-col gap-4"
        >
          <h3 class="text-sm font-medium text-zinc-200">
            Composición sectorial
          </h3>
          <BusinessSectorCompositionList :composition="selectedSectorComposition" />
        </div>

        <div class="flex flex-col gap-2 border-t border-white/10 pt-6">
          <h3 class="text-sm font-medium text-zinc-200">
            Gasto público adjudicado
          </h3>
          <p class="text-xs leading-relaxed text-muted-foreground">
            Dato parcial PLACSP (contratos con municipio identificado), no el presupuesto municipal completo.
          </p>
          <template v-if="contractsLoading">
            <p class="text-sm text-muted-foreground">
              Cargando contratos…
            </p>
          </template>
          <template v-else-if="selectedSpending && selectedSpending.contractCount > 0">
            <p class="text-lg font-medium text-orange-300 tabular-nums">
              {{ formatEur(selectedSpending.totalAwardedEur) }}
            </p>
            <p class="text-sm text-muted-foreground">
              {{ selectedSpending.contractCount }}
              {{ selectedSpending.contractCount === 1 ? 'contrato' : 'contratos' }}
            </p>
          </template>
          <template v-else>
            <p class="text-sm text-muted-foreground">
              Sin contratos geolocalizados a este municipio en PLACSP.
            </p>
          </template>
          <a
            :href="publicSpendingHref"
            data-astro-prefetch
            class="mt-2 text-sm text-orange-300/90 underline-offset-4 hover:underline"
          >
            Ver gasto público en el mapa
          </a>
        </div>
      </div>
    </MetricMunicipalityDetail>
  </div>
</template>

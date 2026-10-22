<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import type { MetricId } from '@/config/metrics';
import { useResizeObserver } from '@vueuse/core';
import {
  computed,
  defineAsyncComponent,
  ref,
  useTemplateRef,
  watch,
} from 'vue';
import { LandingHero } from '@/components/landing-hero';
import LandingHeroContractList from '@/components/landing-hero/landing-hero-contract-list.vue';
import { MetricNav } from '@/components/metric-nav';
import { Button } from '@/components/ui/button';
import { useMapRegion } from '@/composables/use-map-region';
import { useMetricView } from '@/composables/use-metric-view';
import { usePublicContractFilters } from '@/composables/use-public-contract-filters';
import { usePublicContracts } from '@/composables/use-public-contracts';
import { getMetricById } from '@/config/metrics';
import { getMapRegionById } from '@/config/regions';
import { aggregateMunicipalSpending } from '@/domain/aggregate-municipal-spending';
import {
  availableContractYears,
  filterPublicContracts,
} from '@/domain/filter-public-contracts';
import { cn } from '@/lib/utils';

const emit = defineEmits<{
  navigateMetric: [metricId: MetricId];
}>();

const SpendingMap = defineAsyncComponent(
  () => import('@/components/spending-map/spending-map.vue'),
);

const metric = getMetricById('public-spending');

const {
  searchQuery,
  selectedStatuses,
  yearFrom,
  yearTo,
  filters,
} = usePublicContractFilters();
const { regionId } = useMapRegion();
const { view } = useMetricView(metric.defaultView, metric.supportsMap);
const pendingFocusContractId = ref<string | null>(null);
const isPanelCollapsed = ref(false);
const selectedRegion = computed(() => getMapRegionById(regionId.value));
const spendingMap = useTemplateRef<{
  focusContract: (contractId: string) => void;
}>('spendingMap');
const listScroll = useTemplateRef<HTMLElement>('listScroll');
const mobilePanel = useTemplateRef<HTMLElement>('mobilePanel');
const mobilePanelHeight = ref(0);

useResizeObserver(mobilePanel, (entries) => {
  const entry = entries[0];
  if (!entry) {
    return;
  }
  mobilePanelHeight.value = entry.borderBoxSize?.[0]?.blockSize
    ?? entry.contentRect.height;
});

const mobileContentOffsetStyle = computed(() => {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
    return undefined;
  }
  // Overlay wrapper uses p-4 (16px) above the panel.
  const offsetPx = mobilePanelHeight.value + 16;
  if (offsetPx <= 16) {
    return undefined;
  }
  return { paddingTop: `${offsetPx}px` };
});

const { contracts, isLoading, isError } = usePublicContracts(
  () => selectedRegion.value.provinceCodes,
);

const availableYears = computed(() => availableContractYears(contracts.value));

const filteredContracts = computed(() =>
  filterPublicContracts(contracts.value, filters.value),
);

const spending = computed(() =>
  contracts.value.length === 0
    ? null
    : aggregateMunicipalSpending(filteredContracts.value),
);

const mapContracts = computed(() => filteredContracts.value);

const statusMessage = computed(() => {
  if (isLoading.value) {
    return null;
  }
  if (isError.value) {
    return 'No se pudieron cargar los contratos';
  }
  if (contracts.value.length === 0) {
    return 'Aún no hay contratos scrapeados para este municipio';
  }
  return null;
});

function togglePanelCollapsed(): void {
  isPanelCollapsed.value = !isPanelCollapsed.value;
}

function tryFocusPendingContract(): void {
  const contractId = pendingFocusContractId.value;
  const map = spendingMap.value;
  if (!contractId || !map) {
    return;
  }
  pendingFocusContractId.value = null;
  map.focusContract(contractId);
}

function focusContractOnMap(contract: PublicContract): void {
  if (view.value !== 'map') {
    view.value = 'map';
    pendingFocusContractId.value = contract.id;
    return;
  }
  if (spendingMap.value) {
    spendingMap.value.focusContract(contract.id);
    return;
  }
  pendingFocusContractId.value = contract.id;
}

watch(spendingMap, () => {
  tryFocusPendingContract();
});

watch(view, (nextView) => {
  if (nextView === 'map') {
    tryFocusPendingContract();
  }
});

watch(regionId, () => {
  pendingFocusContractId.value = null;
});
</script>

<template>
  <div class="relative h-dvh overflow-hidden bg-zinc-950 lg:flex lg:flex-row">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 lg:pointer-events-auto lg:static lg:inset-auto lg:flex lg:h-full lg:w-md lg:shrink-0 lg:border-r lg:border-white/10 lg:p-0"
    >
      <div
        ref="mobilePanel"
        class="pointer-events-auto flex max-h-[min(70dvh,100%)] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-lg backdrop-blur-md lg:h-full lg:max-h-none lg:rounded-none lg:border-0 lg:bg-zinc-950 lg:shadow-none lg:backdrop-blur-none"
      >
        <MetricNav
          active-metric-id="public-spending"
          :region-id="regionId"
          collapsible
          :collapsed="isPanelCollapsed"
          @navigate="emit('navigateMetric', $event)"
          @toggle-collapsed="togglePanelCollapsed"
        />
        <LandingHero
          v-show="!isPanelCollapsed"
          v-model:search-query="searchQuery"
          v-model:selected-statuses="selectedStatuses"
          v-model:year-from="yearFrom"
          v-model:year-to="yearTo"
          v-model:region-id="regionId"
          :spending="spending"
          :is-loading="isLoading"
          :available-years="availableYears"
          :title-highlight="metric.titleHighlight"
          :title-highlight-class="metric.titleHighlightClass"
        />
      </div>
    </div>

    <div
      class="relative flex h-full min-h-0 w-full flex-col bg-zinc-950 lg:flex-1 lg:pt-0!"
      :style="mobileContentOffsetStyle"
    >
      <div
        class="pointer-events-none absolute bottom-4 left-4 z-2 flex gap-2 lg:top-4 lg:bottom-auto"
      >
        <div
          class="pointer-events-auto flex gap-2 rounded-xl border border-white/10 bg-zinc-950/90 p-2 backdrop-blur-md"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :aria-pressed="view === 'list'"
            :class="cn(
              'rounded-xl px-4',
              view === 'list' ? 'bg-white/10 text-foreground' : 'text-muted-foreground',
            )"
            @click="view = 'list'"
          >
            Lista
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :aria-pressed="view === 'map'"
            :class="cn(
              'rounded-xl px-4',
              view === 'map' ? 'bg-white/10 text-foreground' : 'text-muted-foreground',
            )"
            @click="view = 'map'"
          >
            Mapa
          </Button>
        </div>
      </div>

      <div
        v-show="view === 'map'"
        class="h-full min-h-0 w-full"
      >
        <SpendingMap
          :key="selectedRegion.id"
          ref="spendingMap"
          :contracts="mapContracts"
          :region="selectedRegion"
        />
      </div>

      <div
        v-show="view === 'list'"
        class="flex h-full min-h-0 flex-col pb-16 lg:pt-16 lg:pb-0"
      >
        <div
          ref="listScroll"
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-8"
        >
          <LandingHeroContractList
            :contracts="filteredContracts"
            :region-name="selectedRegion.name"
            :is-loading="isLoading"
            :status-message="statusMessage"
            :scroll-element="listScroll"
            @select="focusContractOnMap"
          />
        </div>
      </div>
    </div>
  </div>
</template>

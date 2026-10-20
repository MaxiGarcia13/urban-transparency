<script setup lang="ts">
import type { NeighborhoodSpendingFeature, NeighborhoodSpendingFeatureCollection } from '@/domain/join-neighborhood-spending-features';
import type { PublicContractWithNeighborhood } from '@/domain/public-contract-with-neighborhood';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MaplibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import fakeNeighborhoods from '@/data/fake/fake-santander-neighborhoods.geojson';
import fakePublicContracts from '@/data/fake/fake-santander-public-contracts.json';
import { aggregateSpendingByNeighborhood } from '@/domain/aggregate-spending-by-neighborhood';
import {
  joinNeighborhoodSpendingFeatures,

} from '@/domain/join-neighborhood-spending-features';
import { formatEur } from '@/utils/format-eur';
import { spendingChoroplethColor } from '@/utils/spending-choropleth-color';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

const CARTO_DARK_STYLE
  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const ELEVATION_SCALE = 0.08;

const mapContainer = ref<HTMLElement | null>(null);
const hoveredNeighborhoodId = ref<string | null>(null);
const tooltip = ref<{
  name: string;
  contractCount: number;
  totalAwardedEur: number;
  x: number;
  y: number;
} | null>(null);

const mapInstance = shallowRef<MaplibreMap | null>(null);
const deckOverlay = shallowRef<MapLibreOverlay | null>(null);

const spendingFeatures = computed((): NeighborhoodSpendingFeatureCollection => {
  const contracts = fakePublicContracts as PublicContractWithNeighborhood[];
  const spending = aggregateSpendingByNeighborhood(contracts);

  return joinNeighborhoodSpendingFeatures(fakeNeighborhoods, spending);
});

const maxAwardedEur = computed(() => {
  let max = 0;

  for (const feature of spendingFeatures.value.features) {
    max = Math.max(max, feature.properties.totalAwardedEur);
  }

  return max;
});

function buildSpendingLayer(): GeoJsonLayer<NeighborhoodSpendingFeature> {
  const maxEur = maxAwardedEur.value;
  const hoveredId = hoveredNeighborhoodId.value;

  return new GeoJsonLayer<NeighborhoodSpendingFeature>({
    id: 'neighborhood-spending',
    data: spendingFeatures.value,
    extruded: true,
    wireframe: false,
    filled: true,
    pickable: true,
    autoHighlight: false,
    getFillColor: (feature) =>
      spendingChoroplethColor(
        feature.properties.totalAwardedEur,
        maxEur,
        feature.properties.neighborhoodId === hoveredId,
      ),
    getElevation: (feature) => feature.properties.totalAwardedEur,
    elevationScale: ELEVATION_SCALE,
    getLineColor: [255, 220, 180, 120],
    lineWidthMinPixels: 1,
    updateTriggers: {
      getFillColor: [hoveredId, maxEur],
    },
    onHover: (info) => {
      const feature = info.object as NeighborhoodSpendingFeature | undefined;

      if (!feature || info.x == null || info.y == null) {
        hoveredNeighborhoodId.value = null;
        tooltip.value = null;
        return;
      }

      hoveredNeighborhoodId.value = feature.properties.neighborhoodId;
      tooltip.value = {
        name: feature.properties.name,
        contractCount: feature.properties.contractCount,
        totalAwardedEur: feature.properties.totalAwardedEur,
        x: info.x,
        y: info.y,
      };
    },
  });
}

function syncDeckLayers(): void {
  deckOverlay.value?.setProps({
    layers: [buildSpendingLayer()],
  });
}

watch([hoveredNeighborhoodId, spendingFeatures], () => {
  syncDeckLayers();
});

onMounted(() => {
  if (!mapContainer.value) {
    return;
  }

  const map = new MaplibreMap({
    container: mapContainer.value,
    style: CARTO_DARK_STYLE,
    center: santanderMunicipality.center,
    zoom: santanderMunicipality.zoom,
    pitch: santanderMunicipality.pitch,
    bearing: santanderMunicipality.bearing,
    attributionControl: true,
  });

  map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

  const overlay = new MapLibreOverlay({
    interleaved: false,
    layers: [buildSpendingLayer()],
  });

  map.addControl(overlay);

  mapInstance.value = map;
  deckOverlay.value = overlay;
});

onUnmounted(() => {
  deckOverlay.value?.finalize();
  mapInstance.value?.remove();
  deckOverlay.value = null;
  mapInstance.value = null;
});
</script>

<template>
  <div class="relative h-full min-h-96 w-full overflow-hidden bg-zinc-950">
    <div ref="mapContainer" class="h-full w-full" />

    <div
      v-if="tooltip"
      class="pointer-events-none absolute z-10 max-w-xs rounded-xl border border-white/10 bg-zinc-950/90 px-4 py-4 text-white shadow-lg backdrop-blur-sm"
      :style="{ left: `${tooltip.x + 12}px`, top: `${tooltip.y + 12}px` }"
    >
      <p class="text-base font-semibold">
        {{ tooltip.name }}
      </p>
      <p class="mt-2 text-sm text-zinc-300">
        {{ tooltip.contractCount }}
        {{ tooltip.contractCount === 1 ? 'contrato' : 'contratos' }}
      </p>
      <p class="mt-2 text-2xl font-semibold text-orange-300">
        {{ formatEur(tooltip.totalAwardedEur) }}
      </p>
      <p class="mt-2 text-xs tracking-wide text-zinc-500 uppercase">
        Gasto adjudicado (datos de prueba)
      </p>
    </div>
  </div>
</template>

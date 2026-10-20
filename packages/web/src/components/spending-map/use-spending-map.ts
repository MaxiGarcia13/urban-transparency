import type { Ref } from 'vue';
import type { NeighborhoodSpendingTooltipState } from './neighborhood-spending-tooltip-state';
import type {
  NeighborhoodGeoJson,
  NeighborhoodSpendingFeatureCollection,
  NeighborhoodSpendingFeatureProperties,
} from '@/domain/join-neighborhood-spending-features';
import type { PublicContractWithNeighborhood } from '@/domain/public-contract-with-neighborhood';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MaplibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import fakeNeighborhoodsJson from '@/data/fake/fake-santander-neighborhoods.json';
import fakePublicContracts from '@/data/fake/fake-santander-public-contracts.json';
import { aggregateSpendingByNeighborhood } from '@/domain/aggregate-spending-by-neighborhood';
import { joinNeighborhoodSpendingFeatures } from '@/domain/join-neighborhood-spending-features';
import { matchNeighborhoodsBySearch } from '@/domain/match-neighborhoods-by-search';
import { buildSpendingDeckLayers } from './build-spending-deck-layers';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

const CARTO_DARK_STYLE
  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const fakeNeighborhoods = fakeNeighborhoodsJson as NeighborhoodGeoJson;
const fakeContracts = fakePublicContracts as PublicContractWithNeighborhood[];

export function useSpendingMap(searchQuery: Ref<string>) {
  const mapContainer = ref<HTMLElement | null>(null);
  const hoveredNeighborhoodId = ref<string | null>(null);
  const tooltip = ref<NeighborhoodSpendingTooltipState | null>(null);
  const mapInstance = shallowRef<MaplibreMap | null>(null);
  const deckOverlay = shallowRef<MapLibreOverlay | null>(null);

  const spendingFeatures = computed((): NeighborhoodSpendingFeatureCollection => {
    const spending = aggregateSpendingByNeighborhood(fakeContracts);
    return joinNeighborhoodSpendingFeatures(fakeNeighborhoods, spending);
  });

  const matchedNeighborhoodIds = computed(() =>
    matchNeighborhoodsBySearch(
      searchQuery.value,
      santanderMunicipality.fakeNeighborhoods,
      fakeContracts,
    ),
  );

  const maxAwardedEur = computed(() => {
    let max = 0;

    for (const feature of spendingFeatures.value.features) {
      max = Math.max(max, feature.properties.totalAwardedEur);
    }

    return max;
  });

  function clearTooltip(): void {
    hoveredNeighborhoodId.value = null;
    tooltip.value = null;
  }

  function showNeighborhoodTooltip(
    neighborhood: NeighborhoodSpendingFeatureProperties,
    x: number,
    y: number,
  ): void {
    hoveredNeighborhoodId.value = neighborhood.neighborhoodId;
    tooltip.value = {
      name: neighborhood.name,
      contractCount: neighborhood.contractCount,
      totalAwardedEur: neighborhood.totalAwardedEur,
      x,
      y,
    };
  }

  function syncDeckLayers(): void {
    deckOverlay.value?.setProps({
      layers: buildSpendingDeckLayers({
        spendingFeatures: spendingFeatures.value,
        maxAwardedEur: maxAwardedEur.value,
        hoveredNeighborhoodId: hoveredNeighborhoodId.value,
        matchedNeighborhoodIds: matchedNeighborhoodIds.value,
        searchQuery: searchQuery.value,
        onShowTooltip: showNeighborhoodTooltip,
        onClearTooltip: clearTooltip,
      }),
    });
  }

  watch([hoveredNeighborhoodId, spendingFeatures, matchedNeighborhoodIds], () => {
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
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    const overlay = new MapLibreOverlay({
      interleaved: false,
      layers: buildSpendingDeckLayers({
        spendingFeatures: spendingFeatures.value,
        maxAwardedEur: maxAwardedEur.value,
        hoveredNeighborhoodId: hoveredNeighborhoodId.value,
        matchedNeighborhoodIds: matchedNeighborhoodIds.value,
        searchQuery: searchQuery.value,
        onShowTooltip: showNeighborhoodTooltip,
        onClearTooltip: clearTooltip,
      }),
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

  return {
    mapContainer,
    tooltip,
  };
}

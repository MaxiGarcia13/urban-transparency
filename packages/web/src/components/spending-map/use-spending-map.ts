import type { PublicContract } from '@urban-transparency/shared';
import type { Ref } from 'vue';
import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import type { ContractMapCluster } from './group-contract-map-points';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MaplibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import { buildSpendingDeckLayers } from './build-spending-deck-layers';
import {

  groupContractsByCoordinates,
} from './group-contract-map-points';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

const CARTO_DARK_STYLE
  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const MUNICIPALITY_FALLBACK_CENTER = {
  longitude: santanderMunicipality.center[0],
  latitude: santanderMunicipality.center[1],
};

export function useSpendingMap(contracts: Ref<PublicContract[]>) {
  const mapContainer = shallowRef<HTMLElement | null>(null);
  const tooltip = shallowRef<ContractSpendingTooltipState | null>(null);
  const selectedClusterId = shallowRef<string | null>(null);
  const mapInstance = shallowRef<MaplibreMap | null>(null);
  const deckOverlay = shallowRef<MapLibreOverlay | null>(null);

  const clusters = computed(() =>
    groupContractsByCoordinates(contracts.value, MUNICIPALITY_FALLBACK_CENTER),
  );

  function clearTooltip(): void {
    tooltip.value = null;
    selectedClusterId.value = null;
  }

  function selectCluster(cluster: ContractMapCluster, x: number, y: number): void {
    if (selectedClusterId.value === cluster.id) {
      clearTooltip();
      return;
    }

    selectedClusterId.value = cluster.id;
    tooltip.value = {
      contracts: cluster.contracts,
      contractCount: cluster.contractCount,
      totalAwardedEur: cluster.totalAwardedEur,
      postalCode: cluster.postalCode,
      hasKnownLocation: cluster.hasKnownLocation,
      x,
      y,
    };
  }

  function syncDeckLayers(): void {
    deckOverlay.value?.setProps({
      layers: buildSpendingDeckLayers({
        clusters: clusters.value,
        onSelectCluster: selectCluster,
      }),
      onClick: (info) => {
        if (!info.object) {
          clearTooltip();
        }
      },
      getCursor: ({ isHovering }) => (isHovering ? 'pointer' : 'grab'),
    });
  }

  watch(clusters, () => {
    syncDeckLayers();
  });

  function handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      clearTooltip();
    }
  }

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
      maxCanvasSize: [8192, 8192],
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    const overlay = new MapLibreOverlay({
      interleaved: false,
      layers: buildSpendingDeckLayers({
        clusters: clusters.value,
        onSelectCluster: selectCluster,
      }),
      onClick: (info) => {
        if (!info.object) {
          clearTooltip();
        }
      },
      getCursor: ({ isHovering }) => (isHovering ? 'pointer' : 'grab'),
    });

    map.addControl(overlay);
    mapInstance.value = map;
    deckOverlay.value = overlay;
    window.addEventListener('keydown', handleEscapeKey);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscapeKey);
    deckOverlay.value?.finalize();
    mapInstance.value?.remove();
    deckOverlay.value = null;
    mapInstance.value = null;
  });

  return {
    mapContainer,
    tooltip,
    clearTooltip,
  };
}

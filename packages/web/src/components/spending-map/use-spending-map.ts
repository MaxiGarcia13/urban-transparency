import type { PublicContract } from '@urban-transparency/shared';
import type { Ref } from 'vue';
import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import type { ContractMapCluster } from './group-contract-map-points';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MaplibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { cantabriaRegion } from '@/config/regions/cantabria';
import { buildSpendingDeckLayers } from './build-spending-deck-layers';
import {

  groupContractsByCoordinates,
} from './group-contract-map-points';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

const CARTO_DARK_STYLE
  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const REGION_FALLBACK_CENTER = {
  longitude: cantabriaRegion.center[0],
  latitude: cantabriaRegion.center[1],
};

export function useSpendingMap(contracts: Ref<PublicContract[]>) {
  const mapContainer = shallowRef<HTMLElement | null>(null);
  const tooltip = shallowRef<ContractSpendingTooltipState | null>(null);
  const selectedClusterId = shallowRef<string | null>(null);
  const mapInstance = shallowRef<MaplibreMap | null>(null);
  const deckOverlay = shallowRef<MapLibreOverlay | null>(null);

  const clusters = computed(() =>
    groupContractsByCoordinates(contracts.value, REGION_FALLBACK_CENTER),
  );

  function clearTooltip(): void {
    tooltip.value = null;
    selectedClusterId.value = null;
  }

  function openCluster(cluster: ContractMapCluster, x: number, y: number): void {
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

  function selectCluster(cluster: ContractMapCluster, x: number, y: number): void {
    if (selectedClusterId.value === cluster.id) {
      clearTooltip();
      return;
    }
    openCluster(cluster, x, y);
  }

  const FOCUS_MIN_ZOOM = 14;
  let pendingFocusOnMoveEnd: (() => void) | null = null;

  function clearPendingFocus(): void {
    const map = mapInstance.value;
    if (map && pendingFocusOnMoveEnd) {
      map.off('moveend', pendingFocusOnMoveEnd);
    }
    pendingFocusOnMoveEnd = null;
  }

  function focusContract(contractId: string): void {
    const map = mapInstance.value;
    if (!map) {
      return;
    }

    const cluster = clusters.value.find((candidate) =>
      candidate.contracts.some((point) => point.id === contractId),
    );
    if (!cluster) {
      return;
    }

    clearPendingFocus();

    const targetZoom = Math.max(map.getZoom(), FOCUS_MIN_ZOOM);
    const center = map.getCenter();
    const alreadyFocused
      = Math.abs(center.lng - cluster.longitude) < 1e-5
        && Math.abs(center.lat - cluster.latitude) < 1e-5
        && Math.abs(map.getZoom() - targetZoom) < 0.05;

    const showAtCluster = (): void => {
      pendingFocusOnMoveEnd = null;
      const point = map.project([cluster.longitude, cluster.latitude]);
      openCluster(cluster, point.x, point.y);
    };

    if (alreadyFocused) {
      showAtCluster();
      return;
    }

    pendingFocusOnMoveEnd = showAtCluster;
    map.once('moveend', showAtCluster);
    map.flyTo({
      center: [cluster.longitude, cluster.latitude],
      zoom: targetZoom,
      essential: true,
    });
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
      center: cantabriaRegion.center,
      zoom: cantabriaRegion.zoom,
      pitch: cantabriaRegion.pitch,
      bearing: cantabriaRegion.bearing,
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
    clearPendingFocus();
    deckOverlay.value?.finalize();
    mapInstance.value?.remove();
    deckOverlay.value = null;
    mapInstance.value = null;
  });

  return {
    mapContainer,
    tooltip,
    clearTooltip,
    focusContract,
  };
}

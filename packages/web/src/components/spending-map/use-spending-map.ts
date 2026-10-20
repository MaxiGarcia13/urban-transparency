import type { Ref } from 'vue';
import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import type { PublicContract } from '@urban-transparency/shared';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MaplibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import {
  buildSpendingDeckLayers,
  toContractMapPoints,
  type ContractMapPoint,
} from './build-spending-deck-layers';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

const CARTO_DARK_STYLE
  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export function useSpendingMap(contracts: Ref<PublicContract[]>) {
  const mapContainer = shallowRef<HTMLElement | null>(null);
  const tooltip = shallowRef<ContractSpendingTooltipState | null>(null);
  const mapInstance = shallowRef<MaplibreMap | null>(null);
  const deckOverlay = shallowRef<MapLibreOverlay | null>(null);

  const contractPoints = computed(() => toContractMapPoints(contracts.value));

  function clearTooltip(): void {
    tooltip.value = null;
  }

  function showTooltip(point: ContractMapPoint, x: number, y: number): void {
    tooltip.value = {
      title: point.title,
      awardedAmountEur: point.awardedAmountEur,
      postalCode: point.postalCode,
      x,
      y,
    };
  }

  function syncDeckLayers(): void {
    deckOverlay.value?.setProps({
      layers: buildSpendingDeckLayers({
        contractPoints: contractPoints.value,
        onShowTooltip: showTooltip,
        onClearTooltip: clearTooltip,
      }),
    });
  }

  watch(contractPoints, () => {
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
      maxCanvasSize: [8192, 8192],
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    const overlay = new MapLibreOverlay({
      interleaved: false,
      layers: buildSpendingDeckLayers({
        contractPoints: contractPoints.value,
        onShowTooltip: showTooltip,
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

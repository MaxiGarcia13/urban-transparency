import type { Ref } from 'vue';
import type { MunicipalitySpendingTooltipState } from './municipality-spending-tooltip-state';
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MaplibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import {
  buildSpendingDeckLayers,
  type MunicipalityMapPoint,
} from './build-spending-deck-layers';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

const CARTO_DARK_STYLE
  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export function useSpendingMap(spending: Ref<MunicipalSpending | null>) {
  const mapContainer = shallowRef<HTMLElement | null>(null);
  const tooltip = shallowRef<MunicipalitySpendingTooltipState | null>(null);
  const mapInstance = shallowRef<MaplibreMap | null>(null);
  const deckOverlay = shallowRef<MapLibreOverlay | null>(null);

  const municipalityPoint = computed((): MunicipalityMapPoint | null => {
    if (!spending.value) {
      return null;
    }

    return {
      name: santanderMunicipality.name,
      longitude: santanderMunicipality.center[0],
      latitude: santanderMunicipality.center[1],
      contractCount: spending.value.contractCount,
      totalAwardedEur: spending.value.totalAwardedEur,
    };
  });

  function clearTooltip(): void {
    tooltip.value = null;
  }

  function showTooltip(point: MunicipalityMapPoint, x: number, y: number): void {
    tooltip.value = {
      name: point.name,
      contractCount: point.contractCount,
      totalAwardedEur: point.totalAwardedEur,
      x,
      y,
    };
  }

  function syncDeckLayers(): void {
    deckOverlay.value?.setProps({
      layers: buildSpendingDeckLayers({
        municipalityPoint: municipalityPoint.value,
        onShowTooltip: showTooltip,
        onClearTooltip: clearTooltip,
      }),
    });
  }

  watch(municipalityPoint, () => {
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
      // Retina / large split layouts exceed the default [4096, 4096] canvas cap.
      maxCanvasSize: [8192, 8192],
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    const overlay = new MapLibreOverlay({
      interleaved: false,
      layers: buildSpendingDeckLayers({
        municipalityPoint: municipalityPoint.value,
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

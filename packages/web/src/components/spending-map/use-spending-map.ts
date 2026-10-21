import type { MapLibreOverlay } from '@deck.gl/maplibre';
import type { PublicContract } from '@urban-transparency/shared';
import type { Map as MaplibreMap } from 'maplibre-gl';
import type { Ref } from 'vue';
import type { MapRegion } from '@/config/regions';
import { onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { buildSpendingDeckLayers } from './build-spending-deck-layers';
import { createSpendingMap } from './create-spending-map';
import { useContractMapTooltip } from './use-contract-map-tooltip';
import { useFitMapToClusters } from './use-fit-map-to-clusters';
import { useFocusContractOnMap } from './use-focus-contract-on-map';
import { useVisibleMapClusters } from './use-visible-map-clusters';

export function useSpendingMap(
  contracts: Ref<PublicContract[]>,
  region: Ref<MapRegion>,
) {
  const mapContainer = shallowRef<HTMLElement | null>(null);
  const mapInstance = shallowRef<MaplibreMap | null>(null);
  const deckOverlay = shallowRef<MapLibreOverlay | null>(null);
  let destroyMap: (() => void) | null = null;

  const { tooltip, clearTooltip, openCluster, selectCluster } = useContractMapTooltip();

  const {
    clusters,
    visibleClusters,
    syncVisibleClusters,
    scheduleVisibleClustersSync,
  } = useVisibleMapClusters({
    contracts,
    region,
    mapInstance,
  });

  const { focusContract } = useFocusContractOnMap({
    mapInstance,
    clusters,
    openCluster,
    syncVisibleClusters,
  });

  useFitMapToClusters({
    mapInstance,
    clusters,
    onBeforeFit: clearTooltip,
  });

  function syncDeckLayers(): void {
    deckOverlay.value?.setProps({
      layers: buildSpendingDeckLayers({
        clusters: visibleClusters.value,
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

  watch(visibleClusters, () => {
    syncDeckLayers();
  });

  onMounted(() => {
    if (!mapContainer.value) {
      return;
    }

    visibleClusters.value = clusters.value;

    const { map, overlay, destroy } = createSpendingMap({
      container: mapContainer.value,
      region: region.value,
      initialClusters: visibleClusters.value,
      onSelectCluster: selectCluster,
      onClearSelection: clearTooltip,
      onViewportChange: scheduleVisibleClustersSync,
      onLoad: syncVisibleClusters,
    });

    mapInstance.value = map;
    deckOverlay.value = overlay;
    destroyMap = destroy;
  });

  onUnmounted(() => {
    destroyMap?.();
    destroyMap = null;
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

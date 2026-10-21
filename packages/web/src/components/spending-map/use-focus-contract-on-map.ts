import type { Map as MaplibreMap } from 'maplibre-gl';
import type { ComputedRef, ShallowRef } from 'vue';
import type { ContractMapCluster } from './group-contract-map-points';
import { onUnmounted } from 'vue';
import { FOCUS_MIN_ZOOM } from './spending-map-config';

interface UseFocusContractOnMapOptions {
  mapInstance: ShallowRef<MaplibreMap | null>;
  clusters: ComputedRef<ContractMapCluster[]>;
  openCluster: (cluster: ContractMapCluster, x: number, y: number) => void;
  syncVisibleClusters: () => void;
}

export function useFocusContractOnMap({
  mapInstance,
  clusters,
  openCluster,
  syncVisibleClusters,
}: UseFocusContractOnMapOptions) {
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
      syncVisibleClusters();
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

  onUnmounted(() => {
    clearPendingFocus();
  });

  return {
    focusContract,
    clearPendingFocus,
  };
}

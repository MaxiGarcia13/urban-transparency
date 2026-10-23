import type { Map as MaplibreMap } from 'maplibre-gl';
import type { ComputedRef, ShallowRef } from 'vue';
import type { ContractMapCluster } from './group-contract-map-points';
import { onUnmounted, watch } from 'vue';
import { FOCUS_MIN_ZOOM } from './spending-map-config';

interface UseFocusContractOnMapOptions {
  mapInstance: ShallowRef<MaplibreMap | null>;
  clusters: ComputedRef<ContractMapCluster[]>;
  openFocusedContract: (
    cluster: ContractMapCluster,
    contractId: string,
    x: number,
    y: number,
  ) => void;
  clearTooltip: () => void;
  syncVisibleClusters: () => void;
}

export function useFocusContractOnMap({
  mapInstance,
  clusters,
  openFocusedContract,
  clearTooltip,
  syncVisibleClusters,
}: UseFocusContractOnMapOptions) {
  let pendingFocusOnMoveEnd: (() => void) | null = null;
  let pendingContractId: string | null = null;

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
      pendingContractId = contractId;
      return;
    }

    const cluster = clusters.value.find((candidate) =>
      candidate.contracts.some((point) => point.id === contractId),
    );
    if (!cluster) {
      return;
    }

    pendingContractId = null;
    clearPendingFocus();
    clearTooltip();

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
      openFocusedContract(cluster, contractId, point.x, point.y);
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

  watch(mapInstance, (map) => {
    if (!map || !pendingContractId) {
      return;
    }
    const contractId = pendingContractId;
    pendingContractId = null;
    focusContract(contractId);
  });

  onUnmounted(() => {
    clearPendingFocus();
    pendingContractId = null;
  });

  return {
    focusContract,
    clearPendingFocus,
  };
}

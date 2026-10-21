import type { PublicContract } from '@urban-transparency/shared';
import type { Map as MaplibreMap } from 'maplibre-gl';
import type { Ref, ShallowRef } from 'vue';
import type { ContractMapCluster } from './group-contract-map-points';
import type { MapRegion } from '@/config/regions';
import { computed, onUnmounted, shallowRef, watch } from 'vue';
import { filterClustersInBounds } from './filter-clusters-in-bounds';
import { groupContractsByCoordinates } from './group-contract-map-points';
import { BOUNDS_SYNC_DEBOUNCE_MS } from './spending-map-config';

interface UseVisibleMapClustersOptions {
  contracts: Ref<PublicContract[]>;
  region: Ref<MapRegion>;
  mapInstance: ShallowRef<MaplibreMap | null>;
}

export function useVisibleMapClusters({
  contracts,
  region,
  mapInstance,
}: UseVisibleMapClustersOptions) {
  const visibleClusters = shallowRef<ContractMapCluster[]>([]);
  let boundsSyncTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const clusters = computed(() =>
    groupContractsByCoordinates(contracts.value, {
      longitude: region.value.center[0],
      latitude: region.value.center[1],
    }),
  );

  function clearBoundsSyncTimeout(): void {
    if (boundsSyncTimeoutId != null) {
      clearTimeout(boundsSyncTimeoutId);
      boundsSyncTimeoutId = null;
    }
  }

  function clustersInCurrentViewport(): ContractMapCluster[] {
    const map = mapInstance.value;
    const allClusters = clusters.value;
    if (!map || allClusters.length === 0) {
      return allClusters;
    }

    const bounds = map.getBounds();
    return filterClustersInBounds(allClusters, {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    });
  }

  function syncVisibleClusters(): void {
    visibleClusters.value = clustersInCurrentViewport();
  }

  function scheduleVisibleClustersSync(): void {
    clearBoundsSyncTimeout();
    boundsSyncTimeoutId = setTimeout(() => {
      boundsSyncTimeoutId = null;
      syncVisibleClusters();
    }, BOUNDS_SYNC_DEBOUNCE_MS);
  }

  watch(clusters, (next) => {
    // Full filtered set so off-screen markers render while the camera fits.
    visibleClusters.value = next;
  });

  onUnmounted(() => {
    clearBoundsSyncTimeout();
  });

  return {
    clusters,
    visibleClusters,
    syncVisibleClusters,
    scheduleVisibleClustersSync,
  };
}

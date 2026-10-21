import type { Map as MaplibreMap } from 'maplibre-gl';
import type { ComputedRef, ShallowRef } from 'vue';
import type { ContractMapCluster } from './group-contract-map-points';
import { watch } from 'vue';
import { FOCUS_MIN_ZOOM } from './spending-map-config';

interface UseFitMapToClustersOptions {
  mapInstance: ShallowRef<MaplibreMap | null>;
  clusters: ComputedRef<ContractMapCluster[]>;
  onBeforeFit?: () => void;
}

function fitMapToClusters(
  map: MaplibreMap,
  clusters: readonly ContractMapCluster[],
): void {
  const known = clusters.filter((cluster) => cluster.hasKnownLocation);
  if (known.length === 0) {
    return;
  }

  if (known.length === 1) {
    const cluster = known[0]!;
    map.flyTo({
      center: [cluster.longitude, cluster.latitude],
      zoom: Math.max(map.getZoom(), FOCUS_MIN_ZOOM),
      essential: true,
    });
    return;
  }

  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const cluster of known) {
    west = Math.min(west, cluster.longitude);
    south = Math.min(south, cluster.latitude);
    east = Math.max(east, cluster.longitude);
    north = Math.max(north, cluster.latitude);
  }

  map.fitBounds(
    [
      [west, south],
      [east, north],
    ],
    {
      padding: 64,
      maxZoom: 14,
      essential: true,
    },
  );
}

export function useFitMapToClusters({
  mapInstance,
  clusters,
  onBeforeFit,
}: UseFitMapToClustersOptions) {
  watch(
    [mapInstance, clusters],
    ([map]) => {
      if (!map) {
        return;
      }

      const hasKnownLocation = clusters.value.some(
        (cluster) => cluster.hasKnownLocation,
      );
      if (!hasKnownLocation) {
        return;
      }

      onBeforeFit?.();
      fitMapToClusters(map, clusters.value);
    },
  );
}

import type { ContractMapCluster } from './group-contract-map-points';
import type { MapRegion } from '@/config/regions';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MaplibreMap, NavigationControl } from 'maplibre-gl';
import { addRegionBoundaryLayers } from './add-region-boundary-layers';
import { buildSpendingDeckLayers } from './build-spending-deck-layers';
import { CARTO_DARK_STYLE } from './spending-map-config';

interface CreateSpendingMapOptions {
  container: HTMLElement;
  region: MapRegion;
  initialClusters: ContractMapCluster[];
  onSelectCluster: (cluster: ContractMapCluster, x: number, y: number) => void;
  onClearSelection: () => void;
  onViewportChange: () => void;
  onLoad: () => void;
}

export interface SpendingMapHandles {
  map: MaplibreMap;
  overlay: MapLibreOverlay;
  destroy: () => void;
}

export function createSpendingMap({
  container,
  region,
  initialClusters,
  onSelectCluster,
  onClearSelection,
  onViewportChange,
  onLoad,
}: CreateSpendingMapOptions): SpendingMapHandles {
  const map = new MaplibreMap({
    container,
    style: CARTO_DARK_STYLE,
    center: region.center,
    zoom: region.zoom,
    pitch: region.pitch,
    bearing: region.bearing,
    maxCanvasSize: [8192, 8192],
  });

  map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

  const overlay = new MapLibreOverlay({
    interleaved: false,
    layers: buildSpendingDeckLayers({
      clusters: initialClusters,
      onSelectCluster,
    }),
    onClick: (info) => {
      if (!info.object) {
        onClearSelection();
      }
    },
    getCursor: ({ isHovering }) => (isHovering ? 'pointer' : 'grab'),
  });

  map.addControl(overlay);
  map.on('moveend', onViewportChange);
  map.on('zoomend', onViewportChange);
  map.once('load', () => {
    addRegionBoundaryLayers(map, region.boundary);
    onLoad();
  });

  function destroy(): void {
    map.off('moveend', onViewportChange);
    map.off('zoomend', onViewportChange);
    overlay.finalize();
    map.remove();
  }

  return { map, overlay, destroy };
}

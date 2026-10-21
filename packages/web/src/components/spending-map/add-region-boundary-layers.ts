import type { GeoJSONSourceSpecification, Map as MaplibreMap } from 'maplibre-gl';
import {
  REGION_BOUNDARY_FILL_COLOR,
  REGION_BOUNDARY_FILL_LAYER_ID,
  REGION_BOUNDARY_LINE_COLOR,
  REGION_BOUNDARY_LINE_LAYER_ID,
  REGION_BOUNDARY_LINE_WIDTH,
  REGION_BOUNDARY_SOURCE_ID,
} from './spending-map-config';

type RegionBoundaryData = Exclude<GeoJSONSourceSpecification['data'], string>;

export function addRegionBoundaryLayers(
  map: MaplibreMap,
  boundary: RegionBoundaryData,
): void {
  if (map.getSource(REGION_BOUNDARY_SOURCE_ID)) {
    return;
  }

  map.addSource(REGION_BOUNDARY_SOURCE_ID, {
    type: 'geojson',
    data: boundary,
  });

  map.addLayer({
    id: REGION_BOUNDARY_FILL_LAYER_ID,
    type: 'fill',
    source: REGION_BOUNDARY_SOURCE_ID,
    paint: {
      'fill-color': REGION_BOUNDARY_FILL_COLOR,
    },
  });

  map.addLayer({
    id: REGION_BOUNDARY_LINE_LAYER_ID,
    type: 'line',
    source: REGION_BOUNDARY_SOURCE_ID,
    paint: {
      'line-color': REGION_BOUNDARY_LINE_COLOR,
      'line-width': REGION_BOUNDARY_LINE_WIDTH,
      'line-opacity': 0.85,
    },
  });
}

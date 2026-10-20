import type {
  NeighborhoodSpendingFeature,
  NeighborhoodSpendingFeatureCollection,
  NeighborhoodSpendingFeatureProperties,
} from '@/domain/join-neighborhood-spending-features';
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { spendingZoneColor } from '@/utils/spending-zone-color';

/** Max zone extrusion in meters for the highest-spending neighborhood. */
export const MAX_ZONE_HEIGHT_METERS = 480;

interface BuildSpendingDeckLayersOptions {
  spendingFeatures: NeighborhoodSpendingFeatureCollection;
  maxAwardedEur: number;
  hoveredNeighborhoodId: string | null;
  matchedNeighborhoodIds: Set<string> | null;
  searchQuery: string;
  onShowTooltip: (
    neighborhood: NeighborhoodSpendingFeatureProperties,
    x: number,
    y: number,
  ) => void;
  onClearTooltip: () => void;
}

export function buildSpendingDeckLayers({
  spendingFeatures,
  maxAwardedEur,
  hoveredNeighborhoodId,
  matchedNeighborhoodIds,
  searchQuery,
  onShowTooltip,
  onClearTooltip,
}: BuildSpendingDeckLayersOptions): Array<
  | GeoJsonLayer<NeighborhoodSpendingFeatureProperties>
  | ScatterplotLayer<NeighborhoodSpendingFeatureProperties>
  | TextLayer<NeighborhoodSpendingFeatureProperties>
> {
  const zoneProperties = spendingFeatures.features.map(
    (feature) => feature.properties,
  );

  const zoneLayer = new GeoJsonLayer<NeighborhoodSpendingFeatureProperties>({
    id: 'neighborhood-zones',
    data: spendingFeatures,
    extruded: true,
    filled: true,
    stroked: true,
    wireframe: false,
    pickable: true,
    autoHighlight: false,
    elevationScale: MAX_ZONE_HEIGHT_METERS,
    getElevation: (feature) => {
      const totalAwardedEur = feature.properties?.totalAwardedEur ?? 0;
      return maxAwardedEur > 0 ? totalAwardedEur / maxAwardedEur : 0;
    },
    getFillColor: (feature) => {
      const properties = feature.properties;
      const totalAwardedEur = properties?.totalAwardedEur ?? 0;
      const neighborhoodId = properties?.neighborhoodId ?? '';

      return spendingZoneColor(totalAwardedEur, maxAwardedEur, {
        isHovered: neighborhoodId === hoveredNeighborhoodId,
        isDimmed:
          matchedNeighborhoodIds != null
          && !matchedNeighborhoodIds.has(neighborhoodId),
      });
    },
    getLineColor: [255, 255, 255, 70],
    lineWidthMinPixels: 1,
    material: {
      ambient: 0.45,
      diffuse: 0.7,
      shininess: 24,
      specularColor: [40, 40, 40],
    },
    updateTriggers: {
      getFillColor: [hoveredNeighborhoodId, maxAwardedEur, searchQuery],
      getElevation: [maxAwardedEur],
    },
    onHover: (info) => {
      const feature = info.object as NeighborhoodSpendingFeature | undefined;
      const properties = feature?.properties;

      if (!properties || info.x == null || info.y == null) {
        onClearTooltip();
        return;
      }

      onShowTooltip(properties, info.x, info.y);
    },
  });

  const markerLayer = new ScatterplotLayer<NeighborhoodSpendingFeatureProperties>({
    id: 'neighborhood-markers',
    data: zoneProperties,
    pickable: true,
    radiusUnits: 'pixels',
    getPosition: (zone) => [zone.labelLongitude, zone.labelLatitude],
    getRadius: 5,
    getFillColor: [255, 255, 255, 230],
    getLineColor: [20, 20, 20, 180],
    lineWidthMinPixels: 1,
    stroked: true,
    onHover: (info) => {
      const zone = info.object as NeighborhoodSpendingFeatureProperties | undefined;

      if (!zone || info.x == null || info.y == null) {
        return;
      }

      onShowTooltip(zone, info.x, info.y);
    },
  });

  const labelLayer = new TextLayer<NeighborhoodSpendingFeatureProperties>({
    id: 'neighborhood-labels',
    data: zoneProperties,
    pickable: false,
    billboard: true,
    sizeUnits: 'pixels',
    getPosition: (zone) => [zone.labelLongitude, zone.labelLatitude],
    getText: (zone) => zone.name,
    getSize: 13,
    getColor: [255, 255, 255, 235],
    getTextAnchor: 'start',
    getAlignmentBaseline: 'center',
    getPixelOffset: [10, 0],
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
    outlineWidth: 2,
    outlineColor: [0, 0, 0, 180],
  });

  return [zoneLayer, markerLayer, labelLayer];
}

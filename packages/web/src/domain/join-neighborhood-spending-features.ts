import type { NeighborhoodSpending } from './aggregate-spending-by-neighborhood';

interface RawNeighborhoodFeature {
  type: 'Feature';
  properties?: {
    neighborhoodId?: string;
    name?: string;
    labelLongitude?: number;
    labelLatitude?: number;
  } | null;
  geometry?: {
    type: string;
    coordinates: number[][][];
  } | null;
}

export interface NeighborhoodGeoJson {
  type: 'FeatureCollection';
  features: RawNeighborhoodFeature[];
}

/** Zone properties for map layers, tooltips, and labels. */
export type NeighborhoodSpendingFeatureProperties = NeighborhoodSpending & {
  name: string;
  labelLongitude: number;
  labelLatitude: number;
};

export interface NeighborhoodSpendingFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: NeighborhoodSpendingFeatureProperties;
}

export interface NeighborhoodSpendingFeatureCollection {
  type: 'FeatureCollection';
  features: NeighborhoodSpendingFeature[];
}

/** Joins neighborhood polygons with aggregated spending for deck.gl zones. */
export function joinNeighborhoodSpendingFeatures(
  neighborhoods: NeighborhoodGeoJson,
  spendingByNeighborhood: Map<string, NeighborhoodSpending>,
): NeighborhoodSpendingFeatureCollection {
  const features: NeighborhoodSpendingFeature[] = [];

  for (const feature of neighborhoods.features) {
    if (feature.geometry?.type !== 'Polygon') {
      continue;
    }

    const neighborhoodId = feature.properties?.neighborhoodId ?? '';
    const name = feature.properties?.name ?? neighborhoodId;
    const spending = spendingByNeighborhood.get(neighborhoodId);
    const ring = feature.geometry.coordinates[0] ?? [];
    const fallbackLng = ring[0]?.[0] ?? 0;
    const fallbackLat = ring[0]?.[1] ?? 0;

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: feature.geometry.coordinates,
      },
      properties: {
        neighborhoodId,
        name,
        contractCount: spending?.contractCount ?? 0,
        totalAwardedEur: spending?.totalAwardedEur ?? 0,
        labelLongitude: feature.properties?.labelLongitude ?? fallbackLng,
        labelLatitude: feature.properties?.labelLatitude ?? fallbackLat,
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

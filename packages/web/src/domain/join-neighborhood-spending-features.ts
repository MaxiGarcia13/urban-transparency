import type { NeighborhoodSpending } from './aggregate-spending-by-neighborhood';

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

interface RawNeighborhoodFeature {
  type: 'Feature';
  properties?: {
    neighborhoodId?: string;
    name?: string;
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

export interface NeighborhoodSpendingFeatureProperties {
  neighborhoodId: string;
  name: string;
  contractCount: number;
  totalAwardedEur: number;
}

export interface NeighborhoodSpendingFeature {
  type: 'Feature';
  geometry: PolygonGeometry;
  properties: NeighborhoodSpendingFeatureProperties;
}

export interface NeighborhoodSpendingFeatureCollection {
  type: 'FeatureCollection';
  features: NeighborhoodSpendingFeature[];
}

/** Joins GeoJSON neighborhoods with aggregated spending for deck.gl. */
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
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

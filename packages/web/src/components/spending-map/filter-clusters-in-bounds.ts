import type { ContractMapCluster } from './group-contract-map-points';

export interface MapBoundsBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

const BOUNDS_PADDING_RATIO = 0.08;

export function expandBounds(
  bounds: MapBoundsBox,
  paddingRatio = BOUNDS_PADDING_RATIO,
): MapBoundsBox {
  const lngSpan = bounds.east - bounds.west;
  const latSpan = bounds.north - bounds.south;
  const lngPad = lngSpan * paddingRatio;
  const latPad = latSpan * paddingRatio;

  return {
    west: bounds.west - lngPad,
    south: bounds.south - latPad,
    east: bounds.east + lngPad,
    north: bounds.north + latPad,
  };
}

function isLongitudeInBounds(
  longitude: number,
  west: number,
  east: number,
): boolean {
  if (west <= east) {
    return longitude >= west && longitude <= east;
  }
  // Antimeridian wrap: west > east
  return longitude >= west || longitude <= east;
}

export function filterClustersInBounds(
  clusters: readonly ContractMapCluster[],
  bounds: MapBoundsBox,
): ContractMapCluster[] {
  const padded = expandBounds(bounds);

  return clusters.filter((cluster) => {
    if (!cluster.hasKnownLocation) {
      return true;
    }
    return (
      isLongitudeInBounds(cluster.longitude, padded.west, padded.east)
      && cluster.latitude >= padded.south
      && cluster.latitude <= padded.north
    );
  });
}

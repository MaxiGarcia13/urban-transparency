import type { RegionBoundaryFeatureCollection } from './region-boundary';

type Position = number[];

function walkPositions(
  node: unknown,
  visit: (position: Position) => void,
): void {
  if (!Array.isArray(node) || node.length === 0) {
    return;
  }

  if (typeof node[0] === 'number') {
    visit(node as Position);
    return;
  }

  for (const child of node) {
    walkPositions(child, visit);
  }
}

export function getBoundaryBboxCenter(
  boundary: RegionBoundaryFeatureCollection,
): [number, number] {
  let minLongitude = Number.POSITIVE_INFINITY;
  let maxLongitude = Number.NEGATIVE_INFINITY;
  let minLatitude = Number.POSITIVE_INFINITY;
  let maxLatitude = Number.NEGATIVE_INFINITY;
  let pointCount = 0;

  for (const feature of boundary.features) {
    if (!feature.geometry || feature.geometry.type === 'GeometryCollection') {
      continue;
    }

    walkPositions(feature.geometry.coordinates, (position) => {
      const longitude = position[0];
      const latitude = position[1];
      if (
        typeof longitude !== 'number'
        || typeof latitude !== 'number'
        || !Number.isFinite(longitude)
        || !Number.isFinite(latitude)
      ) {
        return;
      }
      minLongitude = Math.min(minLongitude, longitude);
      maxLongitude = Math.max(maxLongitude, longitude);
      minLatitude = Math.min(minLatitude, latitude);
      maxLatitude = Math.max(maxLatitude, latitude);
      pointCount += 1;
    });
  }

  if (pointCount === 0) {
    throw new Error('Boundary has no coordinates');
  }

  return [
    (minLongitude + maxLongitude) / 2,
    (minLatitude + maxLatitude) / 2,
  ];
}

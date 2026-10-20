import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';

import type { ContractMapCluster } from './group-contract-map-points';

interface BuildSpendingDeckLayersOptions {
  clusters: ContractMapCluster[];
  onSelectCluster: (cluster: ContractMapCluster, x: number, y: number) => void;
}

const KNOWN_FILL: [number, number, number, number] = [251, 146, 60, 220];
const UNKNOWN_FILL: [number, number, number, number] = [113, 113, 122, 200];

export function buildSpendingDeckLayers({
  clusters,
  onSelectCluster,
}: BuildSpendingDeckLayersOptions): Array<
  ScatterplotLayer<ContractMapCluster> | TextLayer<ContractMapCluster>
> {
  if (clusters.length === 0) {
    return [];
  }

  const markerLayer = new ScatterplotLayer<ContractMapCluster>({
    id: 'contract-markers',
    data: clusters,
    pickable: true,
    autoHighlight: true,
    radiusUnits: 'pixels',
    getPosition: (cluster) => [cluster.longitude, cluster.latitude],
    getRadius: (cluster) => (cluster.contractCount > 1 ? 14 : 10),
    getFillColor: (cluster) => (cluster.hasKnownLocation ? KNOWN_FILL : UNKNOWN_FILL),
    getLineColor: [255, 255, 255, 200],
    lineWidthMinPixels: 1,
    stroked: true,
    onClick: (info) => {
      const cluster = info.object as ContractMapCluster | undefined;
      if (!cluster || info.x == null || info.y == null) {
        return;
      }
      onSelectCluster(cluster, info.x, info.y);
    },
  });

  const labelLayer = new TextLayer<ContractMapCluster>({
    id: 'contract-cluster-labels',
    data: clusters,
    pickable: false,
    billboard: true,
    sizeUnits: 'pixels',
    getPosition: (cluster) => [cluster.longitude, cluster.latitude],
    getText: (cluster) => {
      if (!cluster.hasKnownLocation) {
        return cluster.contractCount > 1
          ? String(cluster.contractCount)
          : '?';
      }
      if (cluster.contractCount > 1) {
        return String(cluster.contractCount);
      }
      return cluster.postalCode ?? '';
    },
    getSize: 11,
    getColor: [255, 255, 255, 220],
    getTextAnchor: (cluster) => {
      if (!cluster.hasKnownLocation || cluster.contractCount > 1) {
        return 'middle';
      }
      return 'start';
    },
    getAlignmentBaseline: 'center',
    getPixelOffset: (cluster) => {
      if (!cluster.hasKnownLocation || cluster.contractCount > 1) {
        return [0, 0];
      }
      return [14, 0];
    },
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
  });

  return [markerLayer, labelLayer];
}

import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';

import type { ContractMapCluster } from './group-contract-map-points';

interface BuildSpendingDeckLayersOptions {
  clusters: ContractMapCluster[];
  onShowTooltip: (cluster: ContractMapCluster, x: number, y: number) => void;
  onClearTooltip: () => void;
}

export function buildSpendingDeckLayers({
  clusters,
  onShowTooltip,
  onClearTooltip,
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
    radiusUnits: 'pixels',
    getPosition: (cluster) => [cluster.longitude, cluster.latitude],
    getRadius: (cluster) => (cluster.contractCount > 1 ? 14 : 10),
    getFillColor: [251, 146, 60, 220],
    getLineColor: [255, 255, 255, 200],
    lineWidthMinPixels: 1,
    stroked: true,
    onHover: (info) => {
      const cluster = info.object as ContractMapCluster | undefined;
      if (!cluster || info.x == null || info.y == null) {
        onClearTooltip();
        return;
      }
      onShowTooltip(cluster, info.x, info.y);
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
      if (cluster.contractCount > 1) {
        return String(cluster.contractCount);
      }
      return cluster.postalCode ?? '';
    },
    getSize: 11,
    getColor: [255, 255, 255, 220],
    getTextAnchor: (cluster) => (cluster.contractCount > 1 ? 'middle' : 'start'),
    getAlignmentBaseline: 'center',
    getPixelOffset: (cluster) => (cluster.contractCount > 1 ? [0, 0] : [14, 0]),
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
  });

  return [markerLayer, labelLayer];
}

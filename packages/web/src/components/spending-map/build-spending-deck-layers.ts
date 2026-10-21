import type { ContractMapCluster } from './group-contract-map-points';
import type { RgbaColor } from '@/utils/public-contract-status-style';
import { IconLayer } from '@deck.gl/layers';
import {
  MIXED_STATUS_RGBA,
  publicContractStatusRgba,
  UNKNOWN_LOCATION_RGBA,
} from '@/utils/public-contract-status-style';
import {
  createClusterMarkerIcon,
  type ClusterMarkerLabelPlacement,
} from './create-cluster-marker-icon';

interface BuildSpendingDeckLayersOptions {
  clusters: ContractMapCluster[];
  onSelectCluster: (cluster: ContractMapCluster, x: number, y: number) => void;
}

function clusterFillColor(cluster: ContractMapCluster): RgbaColor {
  if (!cluster.hasKnownLocation) {
    return UNKNOWN_LOCATION_RGBA;
  }
  if (cluster.status == null) {
    return MIXED_STATUS_RGBA;
  }
  return publicContractStatusRgba(cluster.status);
}

function clusterRadiusPx(cluster: ContractMapCluster): number {
  return cluster.contractCount > 1 ? 14 : 10;
}

function clusterLabel(cluster: ContractMapCluster): {
  text: string;
  placement: ClusterMarkerLabelPlacement;
} {
  if (!cluster.hasKnownLocation) {
    return {
      text: cluster.contractCount > 1 ? String(cluster.contractCount) : '?',
      placement: 'center',
    };
  }
  if (cluster.contractCount > 1) {
    return {
      text: String(cluster.contractCount),
      placement: 'center',
    };
  }
  return {
    text: cluster.postalCode ?? '',
    placement: 'end',
  };
}

export function buildSpendingDeckLayers({
  clusters,
  onSelectCluster,
}: BuildSpendingDeckLayersOptions): Array<IconLayer<ContractMapCluster>> {
  if (clusters.length === 0) {
    return [];
  }

  return [
    new IconLayer<ContractMapCluster>({
      id: 'contract-markers',
      data: clusters,
      pickable: true,
      autoHighlight: true,
      sizeUnits: 'pixels',
      getPosition: (cluster) => [cluster.longitude, cluster.latitude],
      getIcon: (cluster) => {
        const { text, placement } = clusterLabel(cluster);
        return createClusterMarkerIcon({
          fill: clusterFillColor(cluster),
          radiusPx: clusterRadiusPx(cluster),
          label: text,
          labelPlacement: placement,
        });
      },
      getSize: (cluster) => clusterRadiusPx(cluster) * 2,
      onClick: (info) => {
        const cluster = info.object as ContractMapCluster | undefined;
        if (!cluster || info.x == null || info.y == null) {
          return;
        }
        onSelectCluster(cluster, info.x, info.y);
      },
    }),
  ];
}

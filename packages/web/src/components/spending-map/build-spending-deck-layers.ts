import type { PublicContract } from '@urban-transparency/shared';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';

export type ContractMapPoint = {
  id: string;
  title: string;
  awardedAmountEur: number;
  postalCode: string | null;
  longitude: number;
  latitude: number;
};

interface BuildSpendingDeckLayersOptions {
  contractPoints: ContractMapPoint[];
  onShowTooltip: (point: ContractMapPoint, x: number, y: number) => void;
  onClearTooltip: () => void;
}

export function toContractMapPoints(
  contracts: readonly PublicContract[],
): ContractMapPoint[] {
  const points: ContractMapPoint[] = [];

  for (const contract of contracts) {
    if (contract.executionLongitude == null || contract.executionLatitude == null) {
      continue;
    }

    points.push({
      id: contract.id,
      title: contract.title,
      awardedAmountEur: contract.awardedAmountEur ?? 0,
      postalCode: contract.postalCode,
      longitude: contract.executionLongitude,
      latitude: contract.executionLatitude,
    });
  }

  return points;
}

export function buildSpendingDeckLayers({
  contractPoints,
  onShowTooltip,
  onClearTooltip,
}: BuildSpendingDeckLayersOptions): Array<
  ScatterplotLayer<ContractMapPoint> | TextLayer<ContractMapPoint>
> {
  if (contractPoints.length === 0) {
    return [];
  }

  const markerLayer = new ScatterplotLayer<ContractMapPoint>({
    id: 'contract-markers',
    data: contractPoints,
    pickable: true,
    radiusUnits: 'pixels',
    getPosition: (point) => [point.longitude, point.latitude],
    getRadius: 10,
    getFillColor: [251, 146, 60, 220],
    getLineColor: [255, 255, 255, 200],
    lineWidthMinPixels: 1,
    stroked: true,
    onHover: (info) => {
      const point = info.object as ContractMapPoint | undefined;
      if (!point || info.x == null || info.y == null) {
        onClearTooltip();
        return;
      }
      onShowTooltip(point, info.x, info.y);
    },
  });

  const labelLayer = new TextLayer<ContractMapPoint>({
    id: 'contract-postal-labels',
    data: contractPoints.filter((point) => point.postalCode),
    pickable: false,
    billboard: true,
    sizeUnits: 'pixels',
    getPosition: (point) => [point.longitude, point.latitude],
    getText: (point) => point.postalCode ?? '',
    getSize: 11,
    getColor: [255, 255, 255, 220],
    getTextAnchor: 'start',
    getAlignmentBaseline: 'center',
    getPixelOffset: [14, 0],
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
  });

  return [markerLayer, labelLayer];
}

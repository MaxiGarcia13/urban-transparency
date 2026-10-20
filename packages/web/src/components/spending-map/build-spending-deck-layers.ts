import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';

export type MunicipalityMapPoint = MunicipalSpending & {
  name: string;
  longitude: number;
  latitude: number;
};

interface BuildSpendingDeckLayersOptions {
  municipalityPoint: MunicipalityMapPoint | null;
  onShowTooltip: (point: MunicipalityMapPoint, x: number, y: number) => void;
  onClearTooltip: () => void;
}

export function buildSpendingDeckLayers({
  municipalityPoint,
  onShowTooltip,
  onClearTooltip,
}: BuildSpendingDeckLayersOptions): Array<
  ScatterplotLayer<MunicipalityMapPoint> | TextLayer<MunicipalityMapPoint>
> {
  if (!municipalityPoint || municipalityPoint.contractCount === 0) {
    return [];
  }

  const data = [municipalityPoint];

  const markerLayer = new ScatterplotLayer<MunicipalityMapPoint>({
    id: 'municipality-marker',
    data,
    pickable: true,
    radiusUnits: 'pixels',
    getPosition: (point) => [point.longitude, point.latitude],
    getRadius: 18,
    getFillColor: [251, 146, 60, 220],
    getLineColor: [255, 255, 255, 200],
    lineWidthMinPixels: 2,
    stroked: true,
    onHover: (info) => {
      const point = info.object as MunicipalityMapPoint | undefined;
      if (!point || info.x == null || info.y == null) {
        onClearTooltip();
        return;
      }
      onShowTooltip(point, info.x, info.y);
    },
  });

  const labelLayer = new TextLayer<MunicipalityMapPoint>({
    id: 'municipality-label',
    data,
    pickable: false,
    billboard: true,
    sizeUnits: 'pixels',
    getPosition: (point) => [point.longitude, point.latitude],
    getText: (point) => point.name,
    getSize: 14,
    getColor: [255, 255, 255, 235],
    getTextAnchor: 'start',
    getAlignmentBaseline: 'center',
    getPixelOffset: [22, 0],
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
  });

  return [markerLayer, labelLayer];
}

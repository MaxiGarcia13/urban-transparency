import type { GeoJSONSourceSpecification } from 'maplibre-gl';

export type RegionBoundaryFeatureCollection = Extract<
  Exclude<GeoJSONSourceSpecification['data'], string>,
  { type: 'FeatureCollection' }
>;

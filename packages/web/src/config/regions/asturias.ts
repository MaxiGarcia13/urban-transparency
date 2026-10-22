import type { RegionBoundaryFeatureCollection } from './region-boundary';
import asturiasBoundaryJson from './asturias-boundary.json';
import { getBoundaryBboxCenter } from './get-boundary-bbox-center';

export const ASTURIAS_REGION_ID = 'asturias';
export const ASTURIAS_PROVINCE_CODES = ['33'] as const;

const boundary = asturiasBoundaryJson as RegionBoundaryFeatureCollection;

export const asturiasRegion = {
  id: ASTURIAS_REGION_ID,
  name: 'Asturias',
  provinceCodes: ASTURIAS_PROVINCE_CODES,
  center: getBoundaryBboxCenter(boundary),
  zoom: 8,
  pitch: 40,
  bearing: -20,
  boundary,
} as const;

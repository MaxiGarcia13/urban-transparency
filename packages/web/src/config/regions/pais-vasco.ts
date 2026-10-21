import type { RegionBoundaryFeatureCollection } from './region-boundary';
import { getBoundaryBboxCenter } from './get-boundary-bbox-center';
import paisVascoBoundaryJson from './pais-vasco-boundary.json';

export const PAIS_VASCO_REGION_ID = 'pais-vasco';
export const PAIS_VASCO_PROVINCE_CODES = ['01', '20', '48'] as const;

const boundary = paisVascoBoundaryJson as RegionBoundaryFeatureCollection;

export const paisVascoRegion = {
  id: PAIS_VASCO_REGION_ID,
  name: 'País Vasco',
  provinceCodes: PAIS_VASCO_PROVINCE_CODES,
  center: getBoundaryBboxCenter(boundary),
  zoom: 8,
  pitch: 40,
  bearing: -20,
  boundary,
} as const;

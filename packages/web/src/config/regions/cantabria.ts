import type { RegionBoundaryFeatureCollection } from './region-boundary';
import cantabriaBoundaryJson from './cantabria-boundary.json';
import { getBoundaryBboxCenter } from './get-boundary-bbox-center';

export const CANTABRIA_REGION_ID = 'cantabria';
export const CANTABRIA_PROVINCE_CODES = ['39'] as const;

const boundary = cantabriaBoundaryJson as RegionBoundaryFeatureCollection;

export const cantabriaRegion = {
  id: CANTABRIA_REGION_ID,
  name: 'Cantabria',
  provinceCodes: CANTABRIA_PROVINCE_CODES,
  center: getBoundaryBboxCenter(boundary),
  zoom: 7,
  pitch: 40,
  bearing: -20,
  boundary,
} as const;

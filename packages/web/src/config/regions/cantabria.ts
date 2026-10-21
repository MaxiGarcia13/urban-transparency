import type { GeoJSONSourceSpecification } from 'maplibre-gl';
import { listMunicipalitiesByProvinceCode } from '@urban-transparency/shared';
import cantabriaBoundaryJson from './cantabria-boundary.json';

export const CANTABRIA_PROVINCE_CODE = '39';

type RegionBoundaryData = Exclude<GeoJSONSourceSpecification['data'], string>;

const municipalities = listMunicipalitiesByProvinceCode(CANTABRIA_PROVINCE_CODE);
const centerLongitude
  = municipalities.reduce((sum, municipality) => sum + municipality.longitude, 0)
    / municipalities.length;
const centerLatitude
  = municipalities.reduce((sum, municipality) => sum + municipality.latitude, 0)
    / municipalities.length;

export const cantabriaRegion = {
  provinceCode: CANTABRIA_PROVINCE_CODE,
  name: 'Cantabria',
  center: [centerLongitude, centerLatitude] as [number, number],
  zoom: 9,
  pitch: 40,
  bearing: -20,
  boundary: cantabriaBoundaryJson as RegionBoundaryData,
} as const;

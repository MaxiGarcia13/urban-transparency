import type { GeoJSONSourceSpecification } from 'maplibre-gl';
import { listMunicipalitiesByProvinceCode } from '@urban-transparency/shared';
import vizcayaBoundaryJson from './vizcaya-boundary.json';

export const VIZCAYA_PROVINCE_CODE = '48';

type RegionBoundaryData = Exclude<GeoJSONSourceSpecification['data'], string>;

const municipalities = listMunicipalitiesByProvinceCode(VIZCAYA_PROVINCE_CODE);
const centerLongitude
  = municipalities.reduce((sum, municipality) => sum + municipality.longitude, 0)
    / municipalities.length;
const centerLatitude
  = municipalities.reduce((sum, municipality) => sum + municipality.latitude, 0)
    / municipalities.length;

export const vizcayaRegion = {
  provinceCode: VIZCAYA_PROVINCE_CODE,
  name: 'Vizcaya',
  center: [centerLongitude, centerLatitude] as [number, number],
  zoom: 9,
  pitch: 40,
  bearing: -20,
  boundary: vizcayaBoundaryJson as RegionBoundaryData,
} as const;

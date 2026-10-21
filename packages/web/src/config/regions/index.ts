import { cantabriaRegion } from './cantabria';
import { vizcayaRegion } from './vizcaya';

export { CANTABRIA_PROVINCE_CODE, cantabriaRegion } from './cantabria';
export { VIZCAYA_PROVINCE_CODE, vizcayaRegion } from './vizcaya';

export const MAP_REGIONS = [cantabriaRegion, vizcayaRegion] as const;

export type MapRegion = (typeof MAP_REGIONS)[number];

export function getMapRegionByProvinceCode(provinceCode: string): MapRegion {
  const region = MAP_REGIONS.find(
    (candidate) => candidate.provinceCode === provinceCode,
  );
  if (!region) {
    throw new Error(`Unknown map region province code: ${provinceCode}`);
  }
  return region;
}

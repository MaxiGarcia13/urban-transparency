import { cantabriaRegion } from './cantabria';
import { paisVascoRegion } from './pais-vasco';

export {
  CANTABRIA_PROVINCE_CODES,
  CANTABRIA_REGION_ID,
  cantabriaRegion,
} from './cantabria';
export {
  PAIS_VASCO_PROVINCE_CODES,
  PAIS_VASCO_REGION_ID,
  paisVascoRegion,
} from './pais-vasco';

export const MAP_REGIONS = [cantabriaRegion, paisVascoRegion] as const;

export type MapRegion = (typeof MAP_REGIONS)[number];

export function getMapRegionById(regionId: string): MapRegion {
  const region = MAP_REGIONS.find((candidate) => candidate.id === regionId);
  if (!region) {
    throw new Error(`Unknown map region id: ${regionId}`);
  }
  return region;
}

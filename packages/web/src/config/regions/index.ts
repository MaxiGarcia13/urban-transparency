import { asturiasRegion } from './asturias';
import { cantabriaRegion } from './cantabria';
import { paisVascoRegion } from './pais-vasco';

export {
  ASTURIAS_PROVINCE_CODES,
  ASTURIAS_REGION_ID,
  asturiasRegion,
} from './asturias';
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

export const MAP_REGIONS = [
  cantabriaRegion,
  paisVascoRegion,
  asturiasRegion,
] as const;

export type MapRegion = (typeof MAP_REGIONS)[number];

export function getMapRegionById(regionId: string): MapRegion {
  const region = MAP_REGIONS.find((candidate) => candidate.id === regionId);
  if (!region) {
    throw new Error(`Unknown map region id: ${regionId}`);
  }
  return region;
}

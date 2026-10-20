import type { MunicipalityPlacspFilter } from './santander';
import {

  SANTANDER_MUNICIPALITY_CODE,
  santanderPlacspFilter,
} from './santander';

const filtersByMunicipalityCode: Record<string, MunicipalityPlacspFilter> = {
  [SANTANDER_MUNICIPALITY_CODE]: santanderPlacspFilter,
};

export function getMunicipalityPlacspFilter(
  municipalityCode: string,
): MunicipalityPlacspFilter {
  const filter = filtersByMunicipalityCode[municipalityCode];
  if (!filter) {
    throw new Error(`No PLACSP filter configured for municipality ${municipalityCode}`);
  }
  return filter;
}

export type { MunicipalityPlacspFilter };

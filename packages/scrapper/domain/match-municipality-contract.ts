import type { PublicContract } from '@urban-transparency/shared';

import type { MunicipalityPlacspFilter } from '../config/municipalities';

function includesIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLocaleLowerCase('es').includes(needle.toLocaleLowerCase('es'));
}

function equalsIgnoreCase(left: string, right: string): boolean {
  return left.toLocaleLowerCase('es') === right.toLocaleLowerCase('es');
}

/** Keep contracts that match city, NUTS, or contracting-party name for the municipality. */
export function matchesMunicipalityContract(
  contract: PublicContract,
  filter: MunicipalityPlacspFilter,
): boolean {
  if (
    contract.executionCity
    && filter.cityNames.some((cityName) => equalsIgnoreCase(contract.executionCity!, cityName))
  ) {
    return true;
  }

  if (contract.nutsCode && filter.nutsCodes.includes(contract.nutsCode)) {
    return true;
  }

  return filter.contractingPartyNameIncludes.some((fragment) =>
    includesIgnoreCase(contract.contractingPartyName, fragment),
  );
}

export function applyMunicipalityCode(
  contract: PublicContract,
  municipalityCode: string,
): PublicContract {
  return {
    ...contract,
    municipalityCode,
  };
}

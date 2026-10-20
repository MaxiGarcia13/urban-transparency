import type { Municipality, PublicContract } from '@urban-transparency/shared';

function equalsIgnoreCase(left: string, right: string): boolean {
  return left.toLocaleLowerCase('es') === right.toLocaleLowerCase('es');
}

function includesIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLocaleLowerCase('es').includes(needle.toLocaleLowerCase('es'));
}

/** Keep contracts whose execution city or contracting party matches the municipality. */
export function matchesMunicipalityContract(
  contract: PublicContract,
  municipality: Municipality,
): boolean {
  if (
    contract.executionCity
    && equalsIgnoreCase(contract.executionCity, municipality.name)
  ) {
    return true;
  }

  return includesIgnoreCase(
    contract.contractingPartyName,
    `Ayuntamiento de ${municipality.name}`,
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

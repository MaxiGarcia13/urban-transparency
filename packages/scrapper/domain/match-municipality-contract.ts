import type { Municipality, PublicContract } from '@urban-transparency/shared';

function normalizeName(value: string): string {
  return value.toLocaleLowerCase('es');
}

function includesIgnoreCase(haystack: string, needle: string): boolean {
  return normalizeName(haystack).includes(normalizeName(needle));
}

export function buildMunicipalityNameIndex(
  municipalities: readonly Municipality[],
): Map<string, Municipality> {
  return new Map(
    municipalities.map((municipality) => [
      normalizeName(municipality.name),
      municipality,
    ]),
  );
}

export function findMatchingMunicipality(
  contract: PublicContract,
  municipalitiesByNormalizedName: Map<string, Municipality>,
): Municipality | null {
  if (contract.executionCity) {
    const byCity = municipalitiesByNormalizedName.get(
      normalizeName(contract.executionCity),
    );
    if (byCity) {
      return byCity;
    }
  }

  for (const municipality of municipalitiesByNormalizedName.values()) {
    if (
      includesIgnoreCase(
        contract.contractingPartyName,
        `Ayuntamiento de ${municipality.name}`,
      )
    ) {
      return municipality;
    }
  }

  return null;
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

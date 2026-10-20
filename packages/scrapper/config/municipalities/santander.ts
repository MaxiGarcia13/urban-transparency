export const SANTANDER_MUNICIPALITY_CODE = '39075';

/** Pilot filter for PLACSP Atom entries (not a product constant for other cities). */
export const santanderPlacspFilter = {
  municipalityCode: SANTANDER_MUNICIPALITY_CODE,
  cityNames: ['Santander'],
  nutsCodes: ['ES130'],
  contractingPartyNameIncludes: ['Ayuntamiento de Santander'],
} as const;

export interface MunicipalityPlacspFilter {
  municipalityCode: string;
  cityNames: readonly string[];
  nutsCodes: readonly string[];
  contractingPartyNameIncludes: readonly string[];
}

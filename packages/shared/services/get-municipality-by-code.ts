import type { Municipality } from '../domain/municipality';
import spainMunicipalities from '../cities/data/spain.json';

const municipalitiesByCode = new Map(
  (spainMunicipalities as Municipality[]).map((municipality) => [
    municipality.id,
    municipality,
  ]),
);

/** Look up a municipality by INE code (e.g. `39075`). */
export function getMunicipalityByCode(municipalityCode: string): Municipality | null {
  return municipalitiesByCode.get(municipalityCode) ?? null;
}

/** Require a municipality by INE code or throw. */
export function requireMunicipalityByCode(municipalityCode: string): Municipality {
  const municipality = getMunicipalityByCode(municipalityCode);
  if (!municipality) {
    throw new Error(`Unknown municipality code: ${municipalityCode}`);
  }
  return municipality;
}

const PROVINCE_CODE_PATTERN = /^\d{2}$/;

export function listMunicipalitiesByProvinceCode(
  provinceCode: string,
): Municipality[] {
  if (!PROVINCE_CODE_PATTERN.test(provinceCode)) {
    throw new Error(`Invalid province code: ${provinceCode}`);
  }

  return (spainMunicipalities as Municipality[]).filter((municipality) =>
    municipality.id.startsWith(provinceCode),
  );
}

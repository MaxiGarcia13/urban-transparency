import type { Municipality } from '../domain/municipality';
import spainMunicipalities from '../cities/data/spain.json';

const municipalitiesByCode = new Map(
  (spainMunicipalities as Municipality[]).map((municipality) => [
    municipality.id,
    municipality,
  ]),
);

function getMunicipalityByCode(municipalityCode: string): Municipality | null {
  return municipalitiesByCode.get(municipalityCode) ?? null;
}

export function requireMunicipalityByCode(municipalityCode: string): Municipality {
  const municipality = getMunicipalityByCode(municipalityCode);
  if (!municipality) {
    throw new Error(`Unknown municipality code: ${municipalityCode}`);
  }
  return municipality;
}

const PROVINCE_CODE_PATTERN = /^\d{2}$/;

export function listMunicipalitiesByProvinceCodes(
  provinceCodes: readonly string[],
): Municipality[] {
  if (provinceCodes.length === 0) {
    throw new Error('At least one province code is required');
  }

  const uniqueProvinceCodes = [...new Set(provinceCodes)];
  for (const provinceCode of uniqueProvinceCodes) {
    if (!PROVINCE_CODE_PATTERN.test(provinceCode)) {
      throw new Error(`Invalid province code: ${provinceCode}`);
    }
  }

  return (spainMunicipalities as Municipality[]).filter((municipality) =>
    uniqueProvinceCodes.some((provinceCode) =>
      municipality.id.startsWith(provinceCode),
    ),
  );
}

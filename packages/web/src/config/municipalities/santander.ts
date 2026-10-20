import { requireMunicipalityByCode } from '@urban-transparency/shared';

/** Pilot INE municipality code — name/coords come from spain.json. */
const PILOT_MUNICIPALITY_CODE = '39075';

const santander = requireMunicipalityByCode(PILOT_MUNICIPALITY_CODE);

export const santanderMunicipality = {
  municipalityCode: santander.id,
  name: santander.name,
  center: [santander.longitude, santander.latitude] as [number, number],
  zoom: 12,
  pitch: 45,
  bearing: -20,
} as const;

export const SANTANDER_MUNICIPALITY_CODE = santanderMunicipality.municipalityCode;

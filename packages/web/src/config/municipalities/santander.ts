import { requireMunicipalityByCode } from '@urban-transparency/shared';

const santander = requireMunicipalityByCode('39075');

/** Pilot city map camera and fake neighborhood labels (demo only). */
export const santanderMunicipality = {
  municipalityCode: santander.id,
  name: santander.name,
  center: [santander.longitude, santander.latitude] as [number, number],
  zoom: 12,
  pitch: 50,
  bearing: -25,
  fakeNeighborhoods: [
    { id: 'centro', name: 'Centro' },
    { id: 'sardinero', name: 'El Sardinero' },
    { id: 'general-davila', name: 'General Dávila' },
    { id: 'alisal-cazona', name: 'Alisal / Cazoña' },
    { id: 'penacastillo', name: 'Peñacastillo' },
  ],
} as const;

export const SANTANDER_MUNICIPALITY_CODE = santanderMunicipality.municipalityCode;

export type FakeSantanderNeighborhoodId
  = (typeof santanderMunicipality.fakeNeighborhoods)[number]['id'];

export const SANTANDER_MUNICIPALITY_CODE = '39075';

/** Pilot city map camera and fake neighborhood ids (demo geo, not official barrios). */
export const santanderMunicipality = {
  municipalityCode: SANTANDER_MUNICIPALITY_CODE,
  name: 'Santander',
  nutsCode: 'ES130',
  center: [-3.81, 43.46] as [number, number],
  zoom: 12,
  pitch: 45,
  bearing: -20,
  fakeNeighborhoods: [
    { id: 'centro', name: 'Centro' },
    { id: 'sardinero', name: 'El Sardinero' },
    { id: 'general-davila', name: 'General Dávila' },
    { id: 'alisal-cazona', name: 'Alisal / Cazoña' },
    { id: 'penacastillo', name: 'Peñacastillo' },
  ],
} as const;

export type FakeSantanderNeighborhoodId
  = (typeof santanderMunicipality.fakeNeighborhoods)[number]['id'];

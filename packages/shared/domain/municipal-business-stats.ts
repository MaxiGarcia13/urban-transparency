export const DIRCE_SECTOR_CODES = [
  'TOTAL',
  'INDUSTRIA',
  'F',
  'GHI',
  'J',
  'K',
  'L',
  'MN',
  'PQS',
  'S',
  'SERVICES',
] as const;

export type DirceSectorCode = (typeof DIRCE_SECTOR_CODES)[number];

export interface MunicipalBusinessStats {
  municipalityCode: string;
  periodYear: number;
  sectorCode: DirceSectorCode;
  activeBusinessCount: number | null;
  sourceSystem: 'ine-dirce';
  fetchedAt: string;
}

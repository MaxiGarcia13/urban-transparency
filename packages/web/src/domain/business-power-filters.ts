import type { DirceSectorCode } from '@urban-transparency/shared';
import { DIRCE_SECTOR_CODES } from '@urban-transparency/shared';

export interface BusinessPowerFilters {
  periodYear: number | null;
  sectorCode: DirceSectorCode;
}

export const DEFAULT_BUSINESS_POWER_FILTERS: BusinessPowerFilters = {
  periodYear: null,
  sectorCode: 'TOTAL',
};

export const BUSINESS_POWER_SECTOR_OPTIONS: readonly {
  code: DirceSectorCode;
  label: string;
}[] = [
  { code: 'TOTAL', label: 'Total' },
  { code: 'INDUSTRIA', label: 'Industria' },
  { code: 'F', label: 'Construcción' },
  { code: 'GHI', label: 'Comercio, transporte y hostelería' },
  { code: 'J', label: 'Información y comunicaciones' },
  { code: 'K', label: 'Actividades financieras y de seguros' },
  { code: 'L', label: 'Actividades inmobiliarias' },
  { code: 'MN', label: 'Actividades profesionales y técnicas' },
  { code: 'PQS', label: 'Educación, sanidad y servicios sociales' },
  { code: 'S', label: 'Otros servicios personales' },
  { code: 'SERVICES', label: 'Total servicios' },
] as const;

const DIRCE_SECTOR_CODE_SET = new Set<string>(DIRCE_SECTOR_CODES);

export function isDirceSectorCode(value: string): value is DirceSectorCode {
  return DIRCE_SECTOR_CODE_SET.has(value);
}

export function dirceSectorLabel(sectorCode: DirceSectorCode): string {
  return (
    BUSINESS_POWER_SECTOR_OPTIONS.find((option) => option.code === sectorCode)
      ?.label ?? sectorCode
  );
}

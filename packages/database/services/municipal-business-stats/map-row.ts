import type {
  DirceSectorCode,
  MunicipalBusinessStats,
} from '@urban-transparency/shared';
import { DIRCE_SECTOR_CODES } from '@urban-transparency/shared';

const DIRCE_SECTOR_CODE_SET = new Set<string>(DIRCE_SECTOR_CODES);

function parseDirceSectorCode(value: string): DirceSectorCode {
  if (!DIRCE_SECTOR_CODE_SET.has(value)) {
    throw new Error(`Unknown DIRCE sector code: ${value}`);
  }
  return value as DirceSectorCode;
}

export function mapRowToMunicipalBusinessStats(
  row: Record<string, unknown>,
): MunicipalBusinessStats {
  return {
    municipalityCode: String(row.municipalityCode),
    periodYear: Number(row.periodYear),
    sectorCode: parseDirceSectorCode(String(row.sectorCode)),
    activeBusinessCount: (row.activeBusinessCount as number | null) ?? null,
    sourceSystem: 'ine-dirce',
    fetchedAt: String(row.fetchedAt),
  };
}

import type { DirceSectorCode, MunicipalBusinessStats } from '@urban-transparency/shared';
import {
  BUSINESS_POWER_SECTOR_OPTIONS,
  dirceSectorLabel,
} from '../business-power-filters';
import { resolveBusinessStatsPeriodYear } from './business-stats-period';

const COMPOSITION_SECTOR_CODES = BUSINESS_POWER_SECTOR_OPTIONS
  .map((option) => option.code)
  .filter(
    (code): code is Exclude<DirceSectorCode, 'TOTAL' | 'SERVICES'> =>
      code !== 'TOTAL' && code !== 'SERVICES',
  );

export interface BusinessSectorCompositionRow {
  sectorCode: DirceSectorCode;
  label: string;
  activeBusinessCount: number;
  share: number;
}

export function toSectorCompositionRows(
  countsBySector: ReadonlyMap<DirceSectorCode, number>,
): BusinessSectorCompositionRow[] {
  let total = 0;
  for (const value of countsBySector.values()) {
    total += value;
  }
  if (total <= 0) {
    return [];
  }

  const rows: BusinessSectorCompositionRow[] = [];
  for (const [sectorCode, activeBusinessCount] of countsBySector) {
    if (activeBusinessCount <= 0) {
      continue;
    }
    rows.push({
      sectorCode,
      label: dirceSectorLabel(sectorCode),
      activeBusinessCount,
      share: activeBusinessCount / total,
    });
  }

  return rows.sort((a, b) => b.activeBusinessCount - a.activeBusinessCount);
}

export function buildRegionalSectorComposition(
  rows: readonly MunicipalBusinessStats[],
  periodYear: number | null,
): BusinessSectorCompositionRow[] {
  const year = resolveBusinessStatsPeriodYear(rows, periodYear);
  if (year == null) {
    return [];
  }

  const totals = new Map<DirceSectorCode, number>(
    COMPOSITION_SECTOR_CODES.map((sectorCode) => [sectorCode, 0]),
  );

  for (const row of rows) {
    if (row.periodYear !== year || row.activeBusinessCount == null) {
      continue;
    }
    const current = totals.get(row.sectorCode);
    if (current == null) {
      continue;
    }
    totals.set(row.sectorCode, current + row.activeBusinessCount);
  }

  return toSectorCompositionRows(totals);
}

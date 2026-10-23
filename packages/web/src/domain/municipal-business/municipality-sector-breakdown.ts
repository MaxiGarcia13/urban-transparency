import type { DirceSectorCode, MunicipalBusinessStats } from '@urban-transparency/shared';
import type { BusinessSectorCompositionRow } from './regional-sector-composition';
import { toSectorCompositionRows } from './regional-sector-composition';

export function sectorBreakdownForMunicipality(
  rows: readonly MunicipalBusinessStats[],
  municipalityCode: string,
  periodYear: number,
): BusinessSectorCompositionRow[] {
  const totals = new Map<DirceSectorCode, number>();

  for (const row of rows) {
    if (
      row.municipalityCode !== municipalityCode
      || row.periodYear !== periodYear
      || row.sectorCode === 'TOTAL'
      || row.sectorCode === 'SERVICES'
      || row.activeBusinessCount == null
    ) {
      continue;
    }
    totals.set(
      row.sectorCode,
      (totals.get(row.sectorCode) ?? 0) + row.activeBusinessCount,
    );
  }

  return toSectorCompositionRows(totals);
}

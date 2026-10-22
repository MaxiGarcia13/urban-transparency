import type { MunicipalBusinessStats } from '@urban-transparency/shared';
import { compareNullableCountDesc } from './compare-nullable-count-desc';

export function sectorBreakdownForMunicipality(
  rows: readonly MunicipalBusinessStats[],
  municipalityCode: string,
  periodYear: number,
): MunicipalBusinessStats[] {
  return rows
    .filter(
      (row) =>
        row.municipalityCode === municipalityCode
        && row.periodYear === periodYear
        && row.sectorCode !== 'TOTAL'
        && row.sectorCode !== 'SERVICES',
    )
    .sort((a, b) => {
      const byCount = compareNullableCountDesc(
        a.activeBusinessCount,
        b.activeBusinessCount,
      );
      return byCount !== 0
        ? byCount
        : a.sectorCode.localeCompare(b.sectorCode);
    });
}

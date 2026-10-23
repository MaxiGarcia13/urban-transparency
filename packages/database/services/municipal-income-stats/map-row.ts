import type { MunicipalIncomeStats } from '@urban-transparency/shared';

export function mapRowToMunicipalIncomeStats(
  row: Record<string, unknown>,
): MunicipalIncomeStats {
  return {
    municipalityCode: String(row.municipalityCode),
    periodYear: Number(row.periodYear),
    meanNetIncomePerPerson:
      (row.meanNetIncomePerPerson as number | null) ?? null,
    meanNetIncomePerHousehold:
      (row.meanNetIncomePerHousehold as number | null) ?? null,
    sourceSystem: 'ine-adrh',
    fetchedAt: String(row.fetchedAt),
  };
}

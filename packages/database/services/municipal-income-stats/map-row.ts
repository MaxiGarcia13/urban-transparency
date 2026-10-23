import type { MunicipalIncomeStats } from '@urban-transparency/shared';

export function mapRowToMunicipalIncomeStats(
  row: Record<string, unknown>,
): MunicipalIncomeStats {
  return {
    municipalityCode: String(row.municipalityCode),
    periodYear: Number(row.periodYear),
    rentaNetaMediaPersona: (row.rentaNetaMediaPersona as number | null) ?? null,
    rentaNetaMediaHogar: (row.rentaNetaMediaHogar as number | null) ?? null,
    sourceSystem: 'ine-adrh',
    fetchedAt: String(row.fetchedAt),
  };
}

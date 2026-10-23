import type { MunicipalIncomeStats } from '@urban-transparency/shared';

import type { DatabaseClient } from '../client';

const UPSERT_MUNICIPAL_INCOME_STATS_SQL = `
INSERT INTO municipal_income_stats (
  municipality_code,
  period_year,
  renta_neta_media_persona,
  renta_neta_media_hogar,
  source_system,
  fetched_at
) VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(municipality_code, period_year) DO UPDATE SET
  renta_neta_media_persona = excluded.renta_neta_media_persona,
  renta_neta_media_hogar = excluded.renta_neta_media_hogar,
  source_system = excluded.source_system,
  fetched_at = excluded.fetched_at
`;

const UPSERT_BATCH_SIZE = 100;

function toUpsertArgs(row: MunicipalIncomeStats): unknown[] {
  return [
    row.municipalityCode,
    row.periodYear,
    row.rentaNetaMediaPersona,
    row.rentaNetaMediaHogar,
    row.sourceSystem,
    row.fetchedAt,
  ];
}

export async function upsertMunicipalIncomeStats(
  client: DatabaseClient,
  rows: MunicipalIncomeStats[],
): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  for (let offset = 0; offset < rows.length; offset += UPSERT_BATCH_SIZE) {
    const chunk = rows.slice(offset, offset + UPSERT_BATCH_SIZE);
    await client.batch(
      chunk.map((row) => ({
        sql: UPSERT_MUNICIPAL_INCOME_STATS_SQL,
        args: toUpsertArgs(row),
      })),
      'write',
    );
  }

  return rows.length;
}

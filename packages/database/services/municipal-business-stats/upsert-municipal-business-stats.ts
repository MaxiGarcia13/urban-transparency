import type { MunicipalBusinessStats } from '@urban-transparency/shared';

import type { DatabaseClient } from '../client';

const UPSERT_MUNICIPAL_BUSINESS_STATS_SQL = `
INSERT INTO municipal_business_stats (
  municipality_code,
  period_year,
  sector_code,
  active_business_count,
  source_system,
  fetched_at
) VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(municipality_code, period_year, sector_code) DO UPDATE SET
  active_business_count = excluded.active_business_count,
  source_system = excluded.source_system,
  fetched_at = excluded.fetched_at
`;

const UPSERT_BATCH_SIZE = 100;

function toUpsertArgs(row: MunicipalBusinessStats): unknown[] {
  return [
    row.municipalityCode,
    row.periodYear,
    row.sectorCode,
    row.activeBusinessCount,
    row.sourceSystem,
    row.fetchedAt,
  ];
}

export async function upsertMunicipalBusinessStats(
  client: DatabaseClient,
  rows: MunicipalBusinessStats[],
): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  for (let offset = 0; offset < rows.length; offset += UPSERT_BATCH_SIZE) {
    const chunk = rows.slice(offset, offset + UPSERT_BATCH_SIZE);
    await client.batch(
      chunk.map((row) => ({
        sql: UPSERT_MUNICIPAL_BUSINESS_STATS_SQL,
        args: toUpsertArgs(row),
      })),
      'write',
    );
  }

  return rows.length;
}

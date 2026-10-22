import type { MunicipalBusinessStats } from '@urban-transparency/shared';

import type { DatabaseClient } from '../client';
import { mapRowToMunicipalBusinessStats } from './map-row';
import {
  MUNICIPAL_BUSINESS_STATS_ORDER_BY_SQL,
  MUNICIPAL_BUSINESS_STATS_SELECT_SQL,
} from './select-sql';

const PROVINCE_CODE_PATTERN = /^\d{2}$/;

export async function listMunicipalBusinessStatsByProvinces(
  client: DatabaseClient,
  provinceCodes: readonly string[],
  periodYear?: number,
): Promise<MunicipalBusinessStats[]> {
  if (provinceCodes.length === 0) {
    throw new Error('At least one province code is required');
  }

  const uniqueProvinceCodes = [...new Set(provinceCodes)];
  for (const provinceCode of uniqueProvinceCodes) {
    if (!PROVINCE_CODE_PATTERN.test(provinceCode)) {
      throw new Error(`Invalid province code: ${provinceCode}`);
    }
  }

  const provinceClause = uniqueProvinceCodes
    .map(() => 'municipality_code LIKE ?')
    .join(' OR ');
  const args: unknown[] = uniqueProvinceCodes.map(
    (provinceCode) => `${provinceCode}%`,
  );

  let yearClause = '';
  if (periodYear != null) {
    if (!Number.isInteger(periodYear) || periodYear < 1900 || periodYear > 2100) {
      throw new Error(`Invalid period year: ${periodYear}`);
    }
    yearClause = ' AND period_year = ?';
    args.push(periodYear);
  }

  const sql = `
${MUNICIPAL_BUSINESS_STATS_SELECT_SQL}
WHERE (${provinceClause})${yearClause}
${MUNICIPAL_BUSINESS_STATS_ORDER_BY_SQL}
`;
  const rows = await client.all(sql, args);
  return rows.map((row) =>
    mapRowToMunicipalBusinessStats(row as Record<string, unknown>),
  );
}

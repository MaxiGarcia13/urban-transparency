import type { MunicipalIncomeStats } from '@urban-transparency/shared';

import type { DatabaseClient } from '../client';
import { mapRowToMunicipalIncomeStats } from './map-row';
import {
  MUNICIPAL_INCOME_STATS_ORDER_BY_SQL,
  MUNICIPAL_INCOME_STATS_SELECT_SQL,
} from './select-sql';

const PROVINCE_CODE_PATTERN = /^\d{2}$/;

export async function listMunicipalIncomeStatsByProvinces(
  client: DatabaseClient,
  provinceCodes: readonly string[],
  periodYear?: number,
): Promise<MunicipalIncomeStats[]> {
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
${MUNICIPAL_INCOME_STATS_SELECT_SQL}
WHERE (${provinceClause})${yearClause}
${MUNICIPAL_INCOME_STATS_ORDER_BY_SQL}
`;
  const rows = await client.all(sql, args);
  return rows.map((row) =>
    mapRowToMunicipalIncomeStats(row as Record<string, unknown>),
  );
}

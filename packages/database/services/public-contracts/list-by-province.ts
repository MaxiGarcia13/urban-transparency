import type { PublicContract } from '@urban-transparency/shared';

import type { DatabaseClient } from '../client';
import { mapRowToPublicContract } from './map-row';
import {
  PUBLIC_CONTRACT_ORDER_BY_SQL,
  PUBLIC_CONTRACT_SELECT_SQL,
} from './select-sql';

const PROVINCE_CODE_PATTERN = /^\d{2}$/;

export async function listPublicContractsByProvinces(
  client: DatabaseClient,
  provinceCodes: readonly string[],
): Promise<PublicContract[]> {
  if (provinceCodes.length === 0) {
    throw new Error('At least one province code is required');
  }

  const uniqueProvinceCodes = [...new Set(provinceCodes)];
  for (const provinceCode of uniqueProvinceCodes) {
    if (!PROVINCE_CODE_PATTERN.test(provinceCode)) {
      throw new Error(`Invalid province code: ${provinceCode}`);
    }
  }

  const whereClause = uniqueProvinceCodes
    .map(() => 'municipality_code LIKE ?')
    .join(' OR ');
  const sql = `
${PUBLIC_CONTRACT_SELECT_SQL}
WHERE ${whereClause}
${PUBLIC_CONTRACT_ORDER_BY_SQL}
`;
  const rows = await client.all(
    sql,
    uniqueProvinceCodes.map((provinceCode) => `${provinceCode}%`),
  );
  return rows.map((row) => mapRowToPublicContract(row as Record<string, unknown>));
}

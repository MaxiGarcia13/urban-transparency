import type { PublicContract } from '@urban-transparency/shared';

import type { DatabaseClient } from '../client';
import { mapRowToPublicContract } from './map-row';
import {
  PUBLIC_CONTRACT_ORDER_BY_SQL,
  PUBLIC_CONTRACT_SELECT_SQL,
} from './select-sql';

const LIST_BY_PROVINCE_SQL = `
${PUBLIC_CONTRACT_SELECT_SQL}
WHERE municipality_code LIKE ?
${PUBLIC_CONTRACT_ORDER_BY_SQL}
`;

const PROVINCE_CODE_PATTERN = /^\d{2}$/;

export async function listPublicContractsByProvince(
  client: DatabaseClient,
  provinceCode: string,
): Promise<PublicContract[]> {
  if (!PROVINCE_CODE_PATTERN.test(provinceCode)) {
    throw new Error(`Invalid province code: ${provinceCode}`);
  }

  const rows = await client.all(LIST_BY_PROVINCE_SQL, [`${provinceCode}%`]);
  return rows.map((row) => mapRowToPublicContract(row as Record<string, unknown>));
}

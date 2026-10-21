import type { PublicContract } from '@urban-transparency/shared';

import type { DatabaseClient } from '../client';
import { mapRowToPublicContract } from './map-row';
import {
  PUBLIC_CONTRACT_ORDER_BY_SQL,
  PUBLIC_CONTRACT_SELECT_SQL,
} from './select-sql';

const LIST_BY_MUNICIPALITY_SQL = `
${PUBLIC_CONTRACT_SELECT_SQL}
WHERE municipality_code = ?
${PUBLIC_CONTRACT_ORDER_BY_SQL}
`;

export async function listPublicContractsByMunicipality(
  client: DatabaseClient,
  municipalityCode: string,
): Promise<PublicContract[]> {
  const rows = await client.all(LIST_BY_MUNICIPALITY_SQL, [municipalityCode]);
  return rows.map((row) => mapRowToPublicContract(row as Record<string, unknown>));
}

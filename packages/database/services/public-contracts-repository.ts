import type { PublicContract } from '@urban-transparency/shared';

import type { DatabaseClient } from './client';

const UPSERT_PUBLIC_CONTRACT_SQL = `
INSERT INTO public_contracts (
  id,
  contract_folder_id,
  title,
  status,
  contracting_party_name,
  contracting_party_nif,
  awarded_amount_eur,
  awardee_name,
  awardee_nif,
  execution_city,
  nuts_code,
  awarded_at,
  detail_url,
  municipality_code,
  source_system,
  source_entry_updated_at,
  fetched_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  contract_folder_id = excluded.contract_folder_id,
  title = excluded.title,
  status = excluded.status,
  contracting_party_name = excluded.contracting_party_name,
  contracting_party_nif = excluded.contracting_party_nif,
  awarded_amount_eur = excluded.awarded_amount_eur,
  awardee_name = excluded.awardee_name,
  awardee_nif = excluded.awardee_nif,
  execution_city = excluded.execution_city,
  nuts_code = excluded.nuts_code,
  awarded_at = excluded.awarded_at,
  detail_url = excluded.detail_url,
  municipality_code = excluded.municipality_code,
  source_system = excluded.source_system,
  source_entry_updated_at = excluded.source_entry_updated_at,
  fetched_at = excluded.fetched_at
`;

const UPSERT_BATCH_SIZE = 50;

function toUpsertArgs(contract: PublicContract): unknown[] {
  return [
    contract.id,
    contract.contractFolderId,
    contract.title,
    contract.status,
    contract.contractingPartyName,
    contract.contractingPartyNif,
    contract.awardedAmountEur,
    contract.awardeeName,
    contract.awardeeNif,
    contract.executionCity,
    contract.nutsCode,
    contract.awardedAt,
    contract.detailUrl,
    contract.municipalityCode,
    contract.sourceSystem,
    contract.sourceEntryUpdatedAt,
    contract.fetchedAt,
  ];
}

/** Upsert public contracts in atomic batches. */
export async function upsertPublicContracts(
  client: DatabaseClient,
  contracts: PublicContract[],
): Promise<number> {
  if (contracts.length === 0) {
    return 0;
  }

  for (let offset = 0; offset < contracts.length; offset += UPSERT_BATCH_SIZE) {
    const chunk = contracts.slice(offset, offset + UPSERT_BATCH_SIZE);
    await client.batch(
      chunk.map((contract) => ({
        sql: UPSERT_PUBLIC_CONTRACT_SQL,
        args: toUpsertArgs(contract),
      })),
      'write',
    );
  }

  return contracts.length;
}

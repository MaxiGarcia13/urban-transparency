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
  neighborhood_id,
  execution_longitude,
  execution_latitude,
  source_system,
  source_entry_updated_at,
  fetched_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  neighborhood_id = excluded.neighborhood_id,
  execution_longitude = excluded.execution_longitude,
  execution_latitude = excluded.execution_latitude,
  source_system = excluded.source_system,
  source_entry_updated_at = excluded.source_entry_updated_at,
  fetched_at = excluded.fetched_at
`;

const LIST_BY_MUNICIPALITY_SQL = `
SELECT
  id,
  contract_folder_id AS contractFolderId,
  title,
  status,
  contracting_party_name AS contractingPartyName,
  contracting_party_nif AS contractingPartyNif,
  awarded_amount_eur AS awardedAmountEur,
  awardee_name AS awardeeName,
  awardee_nif AS awardeeNif,
  execution_city AS executionCity,
  nuts_code AS nutsCode,
  awarded_at AS awardedAt,
  detail_url AS detailUrl,
  municipality_code AS municipalityCode,
  neighborhood_id AS neighborhoodId,
  execution_longitude AS executionLongitude,
  execution_latitude AS executionLatitude,
  source_system AS sourceSystem,
  source_entry_updated_at AS sourceEntryUpdatedAt,
  fetched_at AS fetchedAt
FROM public_contracts
WHERE municipality_code = ?
ORDER BY awarded_at DESC NULLS LAST, fetched_at DESC
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
    contract.neighborhoodId,
    contract.executionLongitude,
    contract.executionLatitude,
    contract.sourceSystem,
    contract.sourceEntryUpdatedAt,
    contract.fetchedAt,
  ];
}

function mapRowToPublicContract(row: Record<string, unknown>): PublicContract {
  return {
    id: String(row.id),
    contractFolderId: (row.contractFolderId as string | null) ?? null,
    title: String(row.title),
    status: String(row.status),
    contractingPartyName: String(row.contractingPartyName),
    contractingPartyNif: (row.contractingPartyNif as string | null) ?? null,
    awardedAmountEur: (row.awardedAmountEur as number | null) ?? null,
    awardeeName: (row.awardeeName as string | null) ?? null,
    awardeeNif: (row.awardeeNif as string | null) ?? null,
    executionCity: (row.executionCity as string | null) ?? null,
    nutsCode: (row.nutsCode as string | null) ?? null,
    awardedAt: (row.awardedAt as string | null) ?? null,
    detailUrl: (row.detailUrl as string | null) ?? null,
    municipalityCode: (row.municipalityCode as string | null) ?? null,
    neighborhoodId: (row.neighborhoodId as string | null) ?? null,
    executionLongitude: (row.executionLongitude as number | null) ?? null,
    executionLatitude: (row.executionLatitude as number | null) ?? null,
    sourceSystem: 'placsp',
    sourceEntryUpdatedAt: (row.sourceEntryUpdatedAt as string | null) ?? null,
    fetchedAt: String(row.fetchedAt),
  };
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

/** List public contracts for a municipality (INE code). */
export async function listPublicContractsByMunicipality(
  client: DatabaseClient,
  municipalityCode: string,
): Promise<PublicContract[]> {
  const rows = await client.all(LIST_BY_MUNICIPALITY_SQL, [municipalityCode]);
  return rows.map((row) => mapRowToPublicContract(row as Record<string, unknown>));
}

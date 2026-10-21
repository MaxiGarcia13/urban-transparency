import type { PublicContract } from '@urban-transparency/shared';
import { parsePublicContractStatus } from '@urban-transparency/shared';

export function mapRowToPublicContract(
  row: Record<string, unknown>,
): PublicContract {
  return {
    id: String(row.id),
    title: String(row.title),
    status: parsePublicContractStatus(String(row.status)),
    contractingPartyName: String(row.contractingPartyName),
    contractingPartyNif: (row.contractingPartyNif as string | null) ?? null,
    awardedAmountEur: (row.awardedAmountEur as number | null) ?? null,
    awardeeName: (row.awardeeName as string | null) ?? null,
    awardeeNif: (row.awardeeNif as string | null) ?? null,
    executionCity: (row.executionCity as string | null) ?? null,
    postalCode: (row.postalCode as string | null) ?? null,
    executionAddressLine: (row.executionAddressLine as string | null) ?? null,
    nutsCode: (row.nutsCode as string | null) ?? null,
    awardedAt: (row.awardedAt as string | null) ?? null,
    detailUrl: (row.detailUrl as string | null) ?? null,
    municipalityCode: (row.municipalityCode as string | null) ?? null,
    neighborhoodId: (row.neighborhoodId as string | null) ?? null,
    executionLongitude: (row.executionLongitude as number | null) ?? null,
    executionLatitude: (row.executionLatitude as number | null) ?? null,
    sourceSystem: 'placsp',
    sourceEntryId: (row.sourceEntryId as string | null) ?? null,
    sourceEntryUpdatedAt: (row.sourceEntryUpdatedAt as string | null) ?? null,
    fetchedAt: String(row.fetchedAt),
  };
}

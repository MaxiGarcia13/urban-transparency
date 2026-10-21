export const PUBLIC_CONTRACT_STATUSES = [
  'PRE',
  'PUB',
  'EV',
  'ADJ',
  'RES',
  'ANUL',
] as const;

export type PublicContractStatus
  = | (typeof PUBLIC_CONTRACT_STATUSES)[number]
    | 'UNKNOWN';

export function parsePublicContractStatus(
  value: string | null | undefined,
): PublicContractStatus {
  if (
    value
    && (PUBLIC_CONTRACT_STATUSES as readonly string[]).includes(value)
  ) {
    return value as (typeof PUBLIC_CONTRACT_STATUSES)[number];
  }
  return 'UNKNOWN';
}

export interface PublicContract {
  id: string;
  contractFolderId: string | null;
  title: string;
  status: PublicContractStatus;
  contractingPartyName: string;
  contractingPartyNif: string | null;
  awardedAmountEur: number | null;
  awardeeName: string | null;
  awardeeNif: string | null;
  executionCity: string | null;
  postalCode: string | null;
  executionAddressLine: string | null;
  nutsCode: string | null;
  awardedAt: string | null;
  detailUrl: string | null;
  municipalityCode: string | null;
  neighborhoodId: string | null;
  executionLongitude: number | null;
  executionLatitude: number | null;
  sourceSystem: 'placsp';
  sourceEntryUpdatedAt: string | null;
  fetchedAt: string;
}

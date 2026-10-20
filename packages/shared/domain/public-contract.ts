/**
 * Public procurement record from PLACSP Atom / CODICE syndication.
 * Aligned with planned `public_contracts` columns; nulls mirror missing Atom fields.
 */
export interface PublicContract {
  id: string;
  contractFolderId: string | null;
  title: string;
  status: string;
  contractingPartyName: string;
  contractingPartyNif: string | null;
  awardedAmountEur: number | null;
  awardeeName: string | null;
  awardeeNif: string | null;
  executionCity: string | null;
  nutsCode: string | null;
  awardedAt: string | null;
  detailUrl: string | null;
  municipalityCode: string | null;
  sourceSystem: 'placsp';
  sourceEntryUpdatedAt: string | null;
  fetchedAt: string;
}

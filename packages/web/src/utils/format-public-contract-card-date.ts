import type { PublicContract } from '@urban-transparency/shared';
import { formatDateEs } from '@/utils/format-date';

export function formatPublicContractCardDate(
  contract: Pick<PublicContract, 'awardedAt' | 'sourceEntryUpdatedAt'>,
): string | null {
  if (contract.awardedAt) {
    const formatted = formatDateEs(contract.awardedAt);
    return formatted ? `Adjudicada el ${formatted}` : null;
  }

  if (contract.sourceEntryUpdatedAt) {
    const formatted = formatDateEs(contract.sourceEntryUpdatedAt);
    return formatted ? `Actualizado el ${formatted}` : null;
  }

  return null;
}

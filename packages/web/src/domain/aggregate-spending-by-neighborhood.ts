import type { PublicContractWithNeighborhood } from './public-contract-with-neighborhood';

export interface NeighborhoodSpending {
  neighborhoodId: string;
  contractCount: number;
  totalAwardedEur: number;
}

/** Sums awarded amounts and contract counts per neighborhoodId. */
export function aggregateSpendingByNeighborhood(
  contracts: readonly PublicContractWithNeighborhood[],
): Map<string, NeighborhoodSpending> {
  const byNeighborhood = new Map<string, NeighborhoodSpending>();

  for (const contract of contracts) {
    const amountEur = contract.awardedAmountEur ?? 0;
    const existing = byNeighborhood.get(contract.neighborhoodId);

    if (existing) {
      existing.contractCount += 1;
      existing.totalAwardedEur += amountEur;
      continue;
    }

    byNeighborhood.set(contract.neighborhoodId, {
      neighborhoodId: contract.neighborhoodId,
      contractCount: 1,
      totalAwardedEur: amountEur,
    });
  }

  return byNeighborhood;
}

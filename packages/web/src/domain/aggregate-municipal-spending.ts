import type { PublicContract } from '@urban-transparency/shared';

export interface MunicipalSpending {
  contractCount: number;
  totalAwardedEur: number;
}

export function aggregateMunicipalSpending(
  contracts: readonly PublicContract[],
): MunicipalSpending {
  let contractCount = 0;
  let totalAwardedEur = 0;

  for (const contract of contracts) {
    contractCount += 1;
    totalAwardedEur += contract.awardedAmountEur ?? 0;
  }

  return { contractCount, totalAwardedEur };
}

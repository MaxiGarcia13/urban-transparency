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

export function aggregateSpendingByMunicipality(
  contracts: readonly PublicContract[],
): Map<string, MunicipalSpending> {
  const byMunicipality = new Map<string, MunicipalSpending>();

  for (const contract of contracts) {
    const code = contract.municipalityCode;
    if (code == null) {
      continue;
    }
    const current = byMunicipality.get(code) ?? {
      contractCount: 0,
      totalAwardedEur: 0,
    };
    current.contractCount += 1;
    current.totalAwardedEur += contract.awardedAmountEur ?? 0;
    byMunicipality.set(code, current);
  }

  return byMunicipality;
}

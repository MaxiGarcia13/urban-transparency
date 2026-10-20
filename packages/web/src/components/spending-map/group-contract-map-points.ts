import type { PublicContract } from '@urban-transparency/shared';

export type ContractMapPoint = {
  id: string;
  title: string;
  awardedAmountEur: number;
  postalCode: string | null;
};

export type ContractMapCluster = {
  id: string;
  longitude: number;
  latitude: number;
  postalCode: string | null;
  contractCount: number;
  totalAwardedEur: number;
  contracts: ContractMapPoint[];
};

function coordinateKey(longitude: number, latitude: number): string {
  return `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
}

export function groupContractsByCoordinates(
  contracts: readonly PublicContract[],
): ContractMapCluster[] {
  const clustersByKey = new Map<string, ContractMapCluster>();

  for (const contract of contracts) {
    if (contract.executionLongitude == null || contract.executionLatitude == null) {
      continue;
    }

    const longitude = contract.executionLongitude;
    const latitude = contract.executionLatitude;
    const key = coordinateKey(longitude, latitude);
    const point: ContractMapPoint = {
      id: contract.id,
      title: contract.title,
      awardedAmountEur: contract.awardedAmountEur ?? 0,
      postalCode: contract.postalCode,
    };

    const existing = clustersByKey.get(key);
    if (existing) {
      existing.contracts.push(point);
      existing.contractCount += 1;
      existing.totalAwardedEur += point.awardedAmountEur;
      if (!existing.postalCode && point.postalCode) {
        existing.postalCode = point.postalCode;
      }
      continue;
    }

    clustersByKey.set(key, {
      id: key,
      longitude,
      latitude,
      postalCode: point.postalCode,
      contractCount: 1,
      totalAwardedEur: point.awardedAmountEur,
      contracts: [point],
    });
  }

  return [...clustersByKey.values()];
}

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
  hasKnownLocation: boolean;
  contractCount: number;
  totalAwardedEur: number;
  contracts: ContractMapPoint[];
};

export type MunicipalityMapCenter = {
  longitude: number;
  latitude: number;
};

function coordinateKey(longitude: number, latitude: number): string {
  return `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
}

export function groupContractsByCoordinates(
  contracts: readonly PublicContract[],
  fallbackCenter: MunicipalityMapCenter,
): ContractMapCluster[] {
  const clustersByKey = new Map<string, ContractMapCluster>();

  for (const contract of contracts) {
    const knownLongitude = contract.executionLongitude;
    const knownLatitude = contract.executionLatitude;
    const hasKnownLocation = knownLongitude != null && knownLatitude != null;
    const longitude = hasKnownLocation ? knownLongitude : fallbackCenter.longitude;
    const latitude = hasKnownLocation ? knownLatitude : fallbackCenter.latitude;
    // Keep unknown locations in their own cluster even if coords match the city center.
    const key = hasKnownLocation
      ? coordinateKey(longitude, latitude)
      : `unknown:${coordinateKey(longitude, latitude)}`;

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
      hasKnownLocation,
      contractCount: 1,
      totalAwardedEur: point.awardedAmountEur,
      contracts: [point],
    });
  }

  return [...clustersByKey.values()];
}

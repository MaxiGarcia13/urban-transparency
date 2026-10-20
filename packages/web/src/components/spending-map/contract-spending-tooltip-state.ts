import type { ContractMapPoint } from './group-contract-map-points';

export type ContractSpendingTooltipState = {
  contracts: ContractMapPoint[];
  contractCount: number;
  totalAwardedEur: number;
  postalCode: string | null;
  hasKnownLocation: boolean;
  x: number;
  y: number;
};

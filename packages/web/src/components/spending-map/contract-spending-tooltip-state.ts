import type { ContractMapPoint } from './group-contract-map-points';

export type ContractSpendingTooltipState = {
  contracts: ContractMapPoint[];
  contractCount: number;
  totalAwardedEur: number;
  postalCode: string | null;
  x: number;
  y: number;
};

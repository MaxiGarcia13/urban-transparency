import type { NeighborhoodSpendingFeatureProperties } from '@/domain/join-neighborhood-spending-features';

export type NeighborhoodSpendingTooltipState = Pick<
  NeighborhoodSpendingFeatureProperties,
  'name' | 'contractCount' | 'totalAwardedEur'
> & {
  x: number;
  y: number;
};

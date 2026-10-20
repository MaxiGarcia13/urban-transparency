import type { PublicContract } from '@urban-transparency/shared';

/** Fake-map join only; real PLACSP rows do not include neighborhoodId. */
export type PublicContractWithNeighborhood = PublicContract & {
  neighborhoodId: string;
};

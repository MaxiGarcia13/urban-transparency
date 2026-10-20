import type { PublicContract } from '@urban-transparency/shared';

/**
 * Fake-map fields only; real PLACSP rows do not include neighborhood or point coords.
 * `executionLongitude` / `executionLatitude` stand in for a future geo join.
 */
export type PublicContractWithNeighborhood = PublicContract & {
  neighborhoodId: string;
  executionLongitude: number;
  executionLatitude: number;
};

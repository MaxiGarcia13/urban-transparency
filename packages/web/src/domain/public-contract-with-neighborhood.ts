import type { PublicContract } from '@urban-transparency/shared';

/** Contract with neighborhood fields for the map demo / future geo-join. */
export type PublicContractWithNeighborhood = PublicContract & {
  neighborhoodId: string;
  executionLongitude: number;
  executionLatitude: number;
};

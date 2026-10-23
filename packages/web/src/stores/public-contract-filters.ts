import type { PublicContractFilters } from '@/domain/filter-public-contracts';
import { map } from 'nanostores';

export const $publicContractFilters = map<PublicContractFilters>({
  searchQuery: '',
  statuses: [],
  yearFrom: null,
  yearTo: null,
});

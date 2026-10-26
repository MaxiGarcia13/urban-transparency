import type { LocalEconomyFilters } from '@/domain/local-economy-filters';
import { map } from 'nanostores';
import { DEFAULT_LOCAL_ECONOMY_FILTERS } from '@/domain/local-economy-filters';

export const $localEconomyFilters = map<LocalEconomyFilters>({
  ...DEFAULT_LOCAL_ECONOMY_FILTERS,
});

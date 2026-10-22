import type { BusinessPowerFilters } from '@/domain/business-power-filters';
import { map } from 'nanostores';
import { DEFAULT_BUSINESS_POWER_FILTERS } from '@/domain/business-power-filters';

export const $businessPowerFilters = map<BusinessPowerFilters>({
  ...DEFAULT_BUSINESS_POWER_FILTERS,
});

import type { MapRegionUrlParams } from '@/domain/map-region-query';
import type { MetricViewUrlParams } from '@/domain/metric-view-query';
import type { PublicContractFiltersUrlParams } from '@/domain/public-contract-filters-query';
import { useUrlSearchParams } from '@vueuse/core';

export type AppUrlSearchParams
  = PublicContractFiltersUrlParams
    & MapRegionUrlParams
    & MetricViewUrlParams;

let sharedParams: AppUrlSearchParams | null = null;

export function useAppUrlSearchParams(): AppUrlSearchParams {
  if (!sharedParams) {
    sharedParams = useUrlSearchParams<AppUrlSearchParams>('history', {
      removeNullishValues: true,
      removeFalsyValues: true,
      writeMode: 'replace',
    });
  }
  return sharedParams;
}

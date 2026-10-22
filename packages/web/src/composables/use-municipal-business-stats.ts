import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { fetchMunicipalBusinessStatsByProvinces } from '@/services/fetch-business-stats';
import { useClientHydrated } from './use-client-hydrated';

export function useMunicipalBusinessStats(
  provinceCodes: MaybeRefOrGetter<readonly string[]>,
) {
  const hydrated = useClientHydrated();
  const query = useQuery({
    queryKey: computed(
      () => ['business-stats', [...toValue(provinceCodes)]] as const,
    ),
    queryFn: () =>
      fetchMunicipalBusinessStatsByProvinces(toValue(provinceCodes)),
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
  });

  const rows = computed(() =>
    hydrated.value ? (query.data.value ?? []) : [],
  );
  const isLoading = computed(
    () => !hydrated.value || query.isPending.value,
  );

  return {
    rows,
    isLoading,
    isError: computed(() => hydrated.value && query.isError.value),
  };
}

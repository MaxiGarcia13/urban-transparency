import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { fetchPublicContractsByProvinces } from '@/services/fetch-public-contracts';
import { useClientHydrated } from './use-client-hydrated';

export function usePublicContracts(
  provinceCodes: MaybeRefOrGetter<readonly string[]>,
) {
  const hydrated = useClientHydrated();
  const query = useQuery({
    queryKey: computed(
      () => ['public-contracts', [...toValue(provinceCodes)]] as const,
    ),
    queryFn: () => fetchPublicContractsByProvinces(toValue(provinceCodes)),
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
  });

  // Match SSR shell (empty/loading) on first paint; reveal shared cache after mount.
  return {
    contracts: computed(() =>
      hydrated.value ? (query.data.value ?? []) : [],
    ),
    isLoading: computed(() => !hydrated.value || query.isPending.value),
    isError: computed(() => hydrated.value && query.isError.value),
  };
}

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
    staleTime: 60 * 60_000, // treat as fresh for 1 h
    gcTime: 2 * 60 * 60_000, // keep unused cache for 2 h
  });

  // Keep SSR and first client paint identical (empty / pending) so Vue Query
  // cache does not diverge during hydration or ClientRouter swaps.
  const contracts = computed(() =>
    hydrated.value ? (query.data.value ?? []) : [],
  );
  const isLoading = computed(
    () => !hydrated.value || query.isPending.value,
  );

  return {
    contracts,
    isLoading,
    isError: computed(() => hydrated.value && query.isError.value),
  };
}

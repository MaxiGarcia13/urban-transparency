import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { fetchPublicContractsByProvinces } from '@/services/fetch-public-contracts';

export function usePublicContracts(
  provinceCodes: MaybeRefOrGetter<readonly string[]>,
) {
  const query = useQuery({
    queryKey: computed(
      () => ['public-contracts', [...toValue(provinceCodes)]] as const,
    ),
    queryFn: () => fetchPublicContractsByProvinces(toValue(provinceCodes)),
    staleTime: 60 * 60_000, // treat as fresh for 1 h
    gcTime: 2 * 60 * 60_000, // keep unused cache for 2 h
  });

  const contracts = computed(() => query.data.value ?? []);

  return {
    contracts,
    isLoading: query.isPending,
    isError: query.isError,
  };
}

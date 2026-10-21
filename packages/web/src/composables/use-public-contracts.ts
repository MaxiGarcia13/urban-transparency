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
  });

  const contracts = computed(() => query.data.value ?? []);

  return {
    contracts,
    isLoading: query.isPending,
    isError: query.isError,
  };
}

import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { fetchPublicContractsByProvince } from '@/services/fetch-public-contracts';

export function usePublicContracts(
  provinceCode: MaybeRefOrGetter<string>,
) {
  const query = useQuery({
    queryKey: computed(() => ['public-contracts', toValue(provinceCode)] as const),
    queryFn: () => fetchPublicContractsByProvince(toValue(provinceCode)),
  });

  const contracts = computed(() => query.data.value ?? []);

  return {
    contracts,
    isLoading: query.isPending,
    isError: query.isError,
  };
}

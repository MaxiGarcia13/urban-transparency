import type {
  SalaryIncomeFilters,
  SalaryIncomeMeasure,
} from '@/domain/salary-income-filters';
import { useStore } from '@nanostores/vue';
import { computed } from 'vue';
import { $salaryIncomeFilters } from '@/stores/salary-income-filters';
import { ensureMetricUrlStateSync } from '@/stores/sync-metric-url-state';

export function useSalaryIncomeFilters() {
  ensureMetricUrlStateSync();

  const store = useStore($salaryIncomeFilters);

  const filters = computed((): SalaryIncomeFilters => store.value);

  const periodYear = computed({
    get: () => filters.value.periodYear,
    set: (value: number | null) => {
      $salaryIncomeFilters.setKey('periodYear', value);
    },
  });

  const measure = computed({
    get: () => filters.value.measure,
    set: (value: SalaryIncomeMeasure) => {
      $salaryIncomeFilters.setKey('measure', value);
    },
  });

  return {
    filters,
    periodYear,
    measure,
  };
}

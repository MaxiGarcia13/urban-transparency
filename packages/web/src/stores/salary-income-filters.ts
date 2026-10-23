import type { SalaryIncomeFilters } from '@/domain/salary-income-filters';
import { map } from 'nanostores';
import { DEFAULT_SALARY_INCOME_FILTERS } from '@/domain/salary-income-filters';

export const $salaryIncomeFilters = map<SalaryIncomeFilters>({
  ...DEFAULT_SALARY_INCOME_FILTERS,
});

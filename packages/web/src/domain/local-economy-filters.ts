import type { DirceSectorCode } from '@urban-transparency/shared';
import type { SalaryIncomeMeasure } from './salary-income-filters';
import {
  BUSINESS_POWER_SECTOR_OPTIONS,
  DEFAULT_BUSINESS_POWER_FILTERS,
  dirceSectorLabel,
  isDirceSectorCode,
} from './business-power-filters';
import {
  DEFAULT_SALARY_INCOME_FILTERS,
  isSalaryIncomeMeasure,
  SALARY_INCOME_MEASURE_OPTIONS,
  salaryIncomeMeasureLabel,
} from './salary-income-filters';

export interface LocalEconomyFilters {
  periodYear: number | null;
  sectorCode: DirceSectorCode;
  measure: SalaryIncomeMeasure;
}

export const DEFAULT_LOCAL_ECONOMY_FILTERS: LocalEconomyFilters = {
  periodYear: null,
  sectorCode: DEFAULT_BUSINESS_POWER_FILTERS.sectorCode,
  measure: DEFAULT_SALARY_INCOME_FILTERS.measure,
};

export {
  dirceSectorLabel,
  isDirceSectorCode,
  isSalaryIncomeMeasure,
  SALARY_INCOME_MEASURE_OPTIONS as LOCAL_ECONOMY_MEASURE_OPTIONS,
  BUSINESS_POWER_SECTOR_OPTIONS as LOCAL_ECONOMY_SECTOR_OPTIONS,
  salaryIncomeMeasureLabel,
};

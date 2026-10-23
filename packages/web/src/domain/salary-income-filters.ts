export const SALARY_INCOME_MEASURES = ['person', 'household'] as const;

export type SalaryIncomeMeasure = (typeof SALARY_INCOME_MEASURES)[number];

export interface SalaryIncomeFilters {
  periodYear: number | null;
  measure: SalaryIncomeMeasure;
}

export const DEFAULT_SALARY_INCOME_FILTERS: SalaryIncomeFilters = {
  periodYear: null,
  measure: 'person',
};

export const SALARY_INCOME_MEASURE_OPTIONS: readonly {
  code: SalaryIncomeMeasure;
  label: string;
}[] = [
  { code: 'person', label: 'Renta neta media por persona' },
  { code: 'household', label: 'Renta neta media por hogar' },
] as const;

const SALARY_INCOME_MEASURE_SET = new Set<string>(SALARY_INCOME_MEASURES);

export function isSalaryIncomeMeasure(
  value: string,
): value is SalaryIncomeMeasure {
  return SALARY_INCOME_MEASURE_SET.has(value);
}

export function salaryIncomeMeasureLabel(
  measure: SalaryIncomeMeasure,
): string {
  return (
    SALARY_INCOME_MEASURE_OPTIONS.find((option) => option.code === measure)
      ?.label ?? measure
  );
}

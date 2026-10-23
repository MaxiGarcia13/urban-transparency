import type { MunicipalIncomeStats } from '@urban-transparency/shared';

export async function fetchMunicipalIncomeStatsByProvinces(
  provinceCodes: readonly string[],
): Promise<MunicipalIncomeStats[]> {
  if (provinceCodes.length === 0) {
    throw new Error('At least one province code is required');
  }

  const params = new URLSearchParams();
  for (const provinceCode of provinceCodes) {
    params.append('province', provinceCode);
  }

  const response = await fetch(`/api/income-stats?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load income stats');
  }
  return (await response.json()) as MunicipalIncomeStats[];
}

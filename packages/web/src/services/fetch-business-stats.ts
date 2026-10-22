import type { MunicipalBusinessStats } from '@urban-transparency/shared';

export async function fetchMunicipalBusinessStatsByProvinces(
  provinceCodes: readonly string[],
): Promise<MunicipalBusinessStats[]> {
  if (provinceCodes.length === 0) {
    throw new Error('At least one province code is required');
  }

  const params = new URLSearchParams();
  for (const provinceCode of provinceCodes) {
    params.append('province', provinceCode);
  }

  const response = await fetch(`/api/business-stats?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load business stats');
  }
  return (await response.json()) as MunicipalBusinessStats[];
}

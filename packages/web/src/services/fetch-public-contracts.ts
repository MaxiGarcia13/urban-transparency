import type { PublicContract } from '@urban-transparency/shared';

export async function fetchPublicContractsByProvinces(
  provinceCodes: readonly string[],
): Promise<PublicContract[]> {
  if (provinceCodes.length === 0) {
    throw new Error('At least one province code is required');
  }

  const params = new URLSearchParams();
  for (const provinceCode of provinceCodes) {
    params.append('province', provinceCode);
  }

  const response = await fetch(`/api/public-contracts?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load public contracts');
  }
  return (await response.json()) as PublicContract[];
}

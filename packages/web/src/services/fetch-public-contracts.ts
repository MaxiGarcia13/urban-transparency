import type { PublicContract } from '@urban-transparency/shared';

export async function fetchPublicContractsByProvince(
  provinceCode: string,
): Promise<PublicContract[]> {
  const response = await fetch(
    `/api/public-contracts?province=${encodeURIComponent(provinceCode)}`,
  );
  if (!response.ok) {
    throw new Error('Failed to load public contracts');
  }
  return (await response.json()) as PublicContract[];
}

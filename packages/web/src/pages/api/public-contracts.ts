import type { APIRoute } from 'astro';
import {
  createDatabaseClient,
  listPublicContractsByMunicipality,
  listPublicContractsByProvince,
} from '@urban-transparency/db';
import { SANTANDER_MUNICIPALITY_CODE } from '@/config/municipalities/santander';

export const GET: APIRoute = async ({ url }) => {
  const municipalityCode = url.searchParams.get('municipality');
  const provinceCode = url.searchParams.get('province');

  const client = createDatabaseClient();
  try {
    // municipality wins when both query params are present
    const contracts = municipalityCode
      ? await listPublicContractsByMunicipality(client, municipalityCode)
      : provinceCode
        ? await listPublicContractsByProvince(client, provinceCode)
        : await listPublicContractsByMunicipality(client, SANTANDER_MUNICIPALITY_CODE);

    return new Response(JSON.stringify(contracts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to list public contracts:', error);
    return new Response(JSON.stringify({ error: 'Failed to load public contracts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
};

import type { APIRoute } from 'astro';
import {
  createDatabaseClient,
  listPublicContractsByMunicipality,
} from '@urban-transparency/db';
import { SANTANDER_MUNICIPALITY_CODE } from '@/config/municipalities/santander';

export const GET: APIRoute = async ({ url }) => {
  const municipalityCode
    = url.searchParams.get('municipality') ?? SANTANDER_MUNICIPALITY_CODE;

  const client = createDatabaseClient();
  try {
    const contracts = await listPublicContractsByMunicipality(client, municipalityCode);
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

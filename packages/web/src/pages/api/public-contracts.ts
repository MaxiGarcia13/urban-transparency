import type { APIRoute } from 'astro';
import {
  createDatabaseClient,
  listPublicContractsByMunicipality,
  listPublicContractsByProvince,
} from '@urban-transparency/database';

export const GET: APIRoute = async ({ url }) => {
  const municipalityCode = url.searchParams.get('municipality');
  const provinceCode = url.searchParams.get('province');

  // municipality wins when both query params are present
  if (!municipalityCode && !provinceCode) {
    return new Response(
      JSON.stringify({ error: 'Missing municipality or province query parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const client = createDatabaseClient();
  try {
    const contracts = municipalityCode
      ? await listPublicContractsByMunicipality(client, municipalityCode)
      : await listPublicContractsByProvince(client, provinceCode!);

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

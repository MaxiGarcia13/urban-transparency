import type { APIRoute } from 'astro';
import {
  createDatabaseClient,
  listMunicipalBusinessStatsByProvinces,
} from '@urban-transparency/database';

export const GET: APIRoute = async ({ url }) => {
  const provinceCodes = url.searchParams.getAll('province');
  const yearParam = url.searchParams.get('year');

  if (provinceCodes.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Missing province query parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  let periodYear: number | undefined;
  if (yearParam != null && yearParam.trim() !== '') {
    const parsed = Number(yearParam);
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
      return new Response(
        JSON.stringify({ error: 'Invalid year query parameter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    periodYear = parsed;
  }

  const client = createDatabaseClient();
  try {
    const rows = await listMunicipalBusinessStatsByProvinces(
      client,
      provinceCodes,
      periodYear,
    );

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to list municipal business stats:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to load business stats' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } finally {
    await client.close();
  }
};

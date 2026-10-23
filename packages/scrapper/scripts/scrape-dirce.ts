import process from 'node:process';
import {
  createDatabaseClient,
  upsertMunicipalBusinessStats,
} from '@urban-transparency/database';
import { listMunicipalitiesByProvinceCodes } from '@urban-transparency/shared';

import { parseDirceCsv } from '../domain/parse-dirce-csv';
import { fetchDirceTable4721Csv } from '../services/dirce-csv-client';

const PROVINCE_CODE_PATTERN = /^\d{2}$/;

interface CliOptions {
  provinceCodes: string[];
}

function parseCliOptions(argv: string[]): CliOptions {
  const provinceCodes: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--' || arg == null) {
      continue;
    }
    if (arg === '--province') {
      const provinceCode = argv[index + 1];
      if (!provinceCode || !PROVINCE_CODE_PATTERN.test(provinceCode)) {
        throw new Error(
          `Invalid --province value: ${argv[index + 1] ?? '(missing)'}`,
        );
      }
      provinceCodes.push(provinceCode);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (provinceCodes.length === 0) {
    throw new Error('Provide one or more --province <2-digit INE codes>');
  }

  return { provinceCodes };
}

async function scrapeDirce(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const municipalities = listMunicipalitiesByProvinceCodes(options.provinceCodes);
  if (municipalities.length === 0) {
    throw new Error(
      `No municipalities found for provinces: ${options.provinceCodes.join(', ')}`,
    );
  }

  const municipalityCodes = new Set(
    municipalities.map((municipality) => municipality.id),
  );

  console.log(
    `Downloading DIRCE table 4721 CSV for provinces: ${options.provinceCodes.join(', ')}`,
  );
  const csvText = await fetchDirceTable4721Csv();
  const fetchedAt = new Date().toISOString();
  const parsedRows = parseDirceCsv(csvText, {
    provinceCodes: options.provinceCodes,
    fetchedAt,
  });

  const rows = parsedRows.filter((row) =>
    municipalityCodes.has(row.municipalityCode),
  );

  const unknownMunicipalityCount = parsedRows.length - rows.length;
  if (unknownMunicipalityCount > 0) {
    console.warn(
      `Skipped ${unknownMunicipalityCount} rows with municipality codes missing from spain.json`,
    );
  }

  console.log(
    `Parsed ${rows.length} municipal business-stat rows (${municipalities.length} municipalities in scope)`,
  );

  const client = createDatabaseClient();
  try {
    const upserted = await upsertMunicipalBusinessStats(client, rows);
    console.log(`Upserted ${upserted} municipal business-stat rows`);
  } finally {
    await client.close();
  }
}

scrapeDirce().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

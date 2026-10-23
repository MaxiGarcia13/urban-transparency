import type { MunicipalIncomeStats } from '@urban-transparency/shared';
import process from 'node:process';
import {
  createDatabaseClient,
  upsertMunicipalIncomeStats,
} from '@urban-transparency/database';
import { listMunicipalitiesByProvinceCodes } from '@urban-transparency/shared';

import { parseAdrhCsv } from '../domain/parse-adrh-csv';
import { fetchAdrhRentaMediaCsv } from '../services/adrh-csv-client';
import { delay } from '../utils/delay';

const PROVINCE_CODE_PATTERN = /^\d{2}$/;
const DEFAULT_PROVINCE_DELAY_MS = 1000;

interface CliOptions {
  provinceCodes: string[];
  delayMs: number;
}

function parseCliOptions(argv: string[]): CliOptions {
  const provinceCodes: string[] = [];
  let delayMs = DEFAULT_PROVINCE_DELAY_MS;

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
    if (arg === '--delay-ms') {
      const raw = argv[index + 1];
      const parsed = Number(raw);
      if (!raw || !Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Invalid --delay-ms value: ${raw ?? '(missing)'}`);
      }
      delayMs = parsed;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (provinceCodes.length === 0) {
    throw new Error('Provide one or more --province <2-digit INE codes>');
  }

  return { provinceCodes, delayMs };
}

async function scrapeAdrh(): Promise<void> {
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

  const uniqueProvinceCodes = [...new Set(options.provinceCodes)];
  const fetchedAt = new Date().toISOString();
  const allRows: MunicipalIncomeStats[] = [];

  for (let index = 0; index < uniqueProvinceCodes.length; index += 1) {
    const provinceCode = uniqueProvinceCodes[index];
    if (provinceCode == null) {
      continue;
    }

    if (index > 0 && options.delayMs > 0) {
      await delay(options.delayMs);
    }

    console.log(`Downloading ADRH renta-media CSV for province ${provinceCode}`);
    const { tableId, csvText } = await fetchAdrhRentaMediaCsv(provinceCode);
    console.log(`Resolved table ${tableId} for province ${provinceCode}`);

    const parsedRows = parseAdrhCsv(csvText, {
      provinceCodes: [provinceCode],
      fetchedAt,
    });
    allRows.push(...parsedRows);
  }

  const rows = allRows.filter((row) =>
    municipalityCodes.has(row.municipalityCode),
  );
  const unknownMunicipalityCount = allRows.length - rows.length;
  if (unknownMunicipalityCount > 0) {
    console.warn(
      `Skipped ${unknownMunicipalityCount} rows with municipality codes missing from spain.json`,
    );
  }

  console.log(
    `Parsed ${rows.length} municipal income-stat rows (${municipalities.length} municipalities in scope)`,
  );

  const client = createDatabaseClient();
  try {
    const upserted = await upsertMunicipalIncomeStats(client, rows);
    console.log(`Upserted ${upserted} municipal income-stat rows`);
  } finally {
    await client.close();
  }
}

scrapeAdrh().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

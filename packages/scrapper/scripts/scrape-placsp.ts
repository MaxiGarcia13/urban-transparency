import type { Municipality, PublicContract } from '@urban-transparency/shared';

import process from 'node:process';
import {
  createDatabaseClient,
  upsertPublicContracts,
} from '@urban-transparency/db';
import {
  listMunicipalitiesByProvinceCode,
  requireMunicipalityByCode,
} from '@urban-transparency/shared';

import { geocodeContractLocation } from '../domain/geocode-contract-location';
import {
  applyMunicipalityCode,
  buildMunicipalityNameIndex,
  findMatchingMunicipality,
} from '../domain/match-municipality-contract';
import { parsePlacspAtomFeed } from '../domain/parse-placsp-atom-feed';
import {
  fetchPlacspAtomPage,
  getPlacspAtomFeedUrl,
} from '../services/placsp-atom-client';
import { delay } from '../utils/delay';

const DEFAULT_MUNICIPALITY_CODE = '39075';
const DEFAULT_REQUEST_DELAY_MS = 1_500;
const DEFAULT_MAX_PAGES = 5;

interface CliOptions {
  municipalityCode: string | null;
  provinceCode: string | null;
  maxPages: number;
  delayMs: number;
}

function parseCliOptions(argv: string[]): CliOptions {
  let municipalityCode: string | null = null;
  let provinceCode: string | null = null;
  let maxPages = DEFAULT_MAX_PAGES;
  let delayMs = DEFAULT_REQUEST_DELAY_MS;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') {
      continue;
    }
    if (arg === '--municipality') {
      municipalityCode = argv[index + 1] ?? municipalityCode;
      index += 1;
      continue;
    }
    if (arg === '--province') {
      provinceCode = argv[index + 1] ?? provinceCode;
      index += 1;
      continue;
    }
    if (arg === '--max-pages') {
      const parsed = Number(argv[index + 1]);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new Error(`Invalid --max-pages value: ${argv[index + 1]}`);
      }
      maxPages = Math.floor(parsed);
      index += 1;
      continue;
    }
    if (arg === '--delay-ms') {
      const parsed = Number(argv[index + 1]);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Invalid --delay-ms value: ${argv[index + 1]}`);
      }
      delayMs = Math.floor(parsed);
      index += 1;
    }
  }

  if (!municipalityCode && !provinceCode) {
    municipalityCode = DEFAULT_MUNICIPALITY_CODE;
  }

  return { municipalityCode, provinceCode, maxPages, delayMs };
}

function resolveMunicipalities(options: CliOptions): Municipality[] {
  // --municipality wins when both flags are present
  if (options.municipalityCode) {
    return [requireMunicipalityByCode(options.municipalityCode)];
  }

  if (!options.provinceCode) {
    throw new Error('Provide --municipality <ineCode> or --province <2-digit>');
  }

  const municipalities = listMunicipalitiesByProvinceCode(options.provinceCode);
  if (municipalities.length === 0) {
    throw new Error(`No municipalities found for province: ${options.provinceCode}`);
  }

  return municipalities;
}

async function scrapePlacsp(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const municipalities = resolveMunicipalities(options);
  const municipalitiesByCode = new Map(
    municipalities.map((municipality) => [municipality.id, municipality]),
  );
  const municipalitiesByNormalizedName = buildMunicipalityNameIndex(municipalities);
  const fetchedAt = new Date().toISOString();
  const matchedContracts: PublicContract[] = [];

  let pageUrl: string | null = getPlacspAtomFeedUrl();
  let pagesFetched = 0;
  let entriesSeen = 0;

  if (options.municipalityCode) {
    const municipality = municipalities[0]!;
    console.log(
      `Scraping PLACSP for ${municipality.name} (${municipality.id})`,
    );
  } else {
    console.log(
      `Scraping PLACSP for province ${options.provinceCode} (${municipalities.length} municipalities)`,
    );
  }

  while (pageUrl && pagesFetched < options.maxPages) {
    if (pagesFetched > 0 && options.delayMs > 0) {
      console.log(`Waiting ${options.delayMs}ms before next request…`);
      await delay(options.delayMs);
    }

    pagesFetched += 1;
    console.log(`Fetching Atom page ${pagesFetched}/${options.maxPages}: ${pageUrl}`);

    const xml = await fetchPlacspAtomPage(pageUrl);
    const { contracts, nextPageUrl } = parsePlacspAtomFeed(xml, fetchedAt);
    entriesSeen += contracts.length;

    for (const contract of contracts) {
      const municipality = findMatchingMunicipality(
        contract,
        municipalitiesByNormalizedName,
      );
      if (!municipality) {
        continue;
      }
      matchedContracts.push(applyMunicipalityCode(contract, municipality.id));
    }

    pageUrl = nextPageUrl;
  }

  console.log(`Geocoding ${matchedContracts.length} matched contracts…`);
  const geocodedContracts: PublicContract[] = [];
  for (const contract of matchedContracts) {
    const municipality = municipalitiesByCode.get(contract.municipalityCode ?? '');
    if (!municipality) {
      throw new Error(
        `Matched contract missing municipality in scope: ${contract.id} (${contract.municipalityCode})`,
      );
    }
    geocodedContracts.push(await geocodeContractLocation(contract, municipality));
  }

  const withPostalCode = geocodedContracts.filter((contract) => contract.postalCode).length;
  const municipalityCodes = new Set(
    geocodedContracts
      .map((contract) => contract.municipalityCode)
      .filter((code): code is string => Boolean(code)),
  );

  const client = createDatabaseClient();
  try {
    const upserted = await upsertPublicContracts(client, geocodedContracts);
    console.log(
      `PLACSP scrape done: pages=${pagesFetched} entries=${entriesSeen} matched=${matchedContracts.length} municipalities=${municipalityCodes.size} withPostalCode=${withPostalCode} upserted=${upserted}`,
    );
  } finally {
    await client.close();
  }
}

scrapePlacsp().catch((error: unknown) => {
  console.error('PLACSP scrape failed:', error);
  process.exitCode = 1;
});

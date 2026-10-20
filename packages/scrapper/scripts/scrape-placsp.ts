import type { PublicContract } from '@urban-transparency/shared';

import process from 'node:process';
import {
  createDatabaseClient,
  upsertPublicContracts,
} from '@urban-transparency/db';

import {
  getMunicipalityPlacspFilter,
  SANTANDER_MUNICIPALITY_CODE,
} from '../config/municipalities';
import {
  applyMunicipalityCode,
  matchesMunicipalityContract,
} from '../domain/match-municipality-contract';
import { parsePlacspAtomFeed } from '../domain/parse-placsp-atom-feed';
import {
  fetchPlacspAtomPage,
  getPlacspAtomFeedUrl,
} from '../services/placsp-atom-client';
import { delay } from '../utils/delay';

const DEFAULT_REQUEST_DELAY_MS = 1_500;
const DEFAULT_MAX_PAGES = 5;

interface CliOptions {
  municipalityCode: string;
  maxPages: number;
  delayMs: number;
}

function parseCliOptions(argv: string[]): CliOptions {
  let municipalityCode = SANTANDER_MUNICIPALITY_CODE;
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

  return { municipalityCode, maxPages, delayMs };
}

async function scrapePlacsp(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const filter = getMunicipalityPlacspFilter(options.municipalityCode);
  const fetchedAt = new Date().toISOString();
  const matchedContracts: PublicContract[] = [];

  let pageUrl: string | null = getPlacspAtomFeedUrl();
  let pagesFetched = 0;
  let entriesSeen = 0;

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
      if (!matchesMunicipalityContract(contract, filter)) {
        continue;
      }
      matchedContracts.push(applyMunicipalityCode(contract, filter.municipalityCode));
    }

    pageUrl = nextPageUrl;
  }

  const client = createDatabaseClient();
  try {
    const upserted = await upsertPublicContracts(client, matchedContracts);
    console.log(
      `PLACSP scrape done: pages=${pagesFetched} entries=${entriesSeen} matched=${matchedContracts.length} upserted=${upserted}`,
    );
  } finally {
    await client.close();
  }
}

scrapePlacsp().catch((error: unknown) => {
  console.error('PLACSP scrape failed:', error);
  process.exitCode = 1;
});

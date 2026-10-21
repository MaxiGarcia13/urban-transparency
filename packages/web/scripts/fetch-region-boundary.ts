import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import packageJson from '../package.json' with { type: 'json' };

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = `${packageJson.name}/${packageJson.version}`;
const PROVINCE_CODE_PATTERN = /^\d{2}$/;
const REGION_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const REGIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/config/regions',
);

interface CliOptions {
  regionId: string;
  name: string;
  query: string;
  provinceCodes: string[];
}

interface NominatimSearchResult {
  display_name?: string;
  geojson?: {
    type: string;
    coordinates: unknown;
  };
}

interface RegionBoundaryFeatureCollection {
  type: 'FeatureCollection';
  features: [
    {
      type: 'Feature';
      properties: {
        name: string;
        provinceCodes: string[];
        source: 'OpenStreetMap Nominatim';
        license: 'ODbL 1.0';
      };
      geometry: {
        type: string;
        coordinates: unknown;
      };
    },
  ];
}

function parseCliOptions(argv: string[]): CliOptions {
  let regionId: string | null = null;
  let name: string | null = null;
  let query: string | null = null;
  const provinceCodes: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') {
      continue;
    }
    if (arg === '--id') {
      regionId = argv[index + 1] ?? regionId;
      index += 1;
      continue;
    }
    if (arg === '--name') {
      name = argv[index + 1] ?? name;
      index += 1;
      continue;
    }
    if (arg === '--query') {
      query = argv[index + 1] ?? query;
      index += 1;
      continue;
    }
    if (arg === '--province') {
      const provinceCode = argv[index + 1];
      if (provinceCode) {
        provinceCodes.push(provinceCode);
      }
      index += 1;
    }
  }

  if (!regionId || !name || !query || provinceCodes.length === 0) {
    throw new Error(
      'Usage: fetch-region-boundary --id <kebab-id> --name <label> --query <nominatim> --province <2-digit> [--province …]',
    );
  }

  if (!REGION_ID_PATTERN.test(regionId)) {
    throw new Error(`Invalid region id: ${regionId}`);
  }

  const uniqueProvinceCodes = [...new Set(provinceCodes)];
  for (const provinceCode of uniqueProvinceCodes) {
    if (!PROVINCE_CODE_PATTERN.test(provinceCode)) {
      throw new Error(`Invalid province code: ${provinceCode}`);
    }
  }

  return {
    regionId,
    name,
    query,
    provinceCodes: uniqueProvinceCodes,
  };
}

async function fetchNominatimAdminBoundary(
  query: string,
): Promise<NonNullable<NominatimSearchResult['geojson']>> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'es');

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status} ${response.statusText}`);
  }

  const results = (await response.json()) as NominatimSearchResult[];
  const geometry = results[0]?.geojson;
  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
    throw new Error(`No admin polygon found for query: ${query}`);
  }

  console.log(`Matched: ${results[0]?.display_name ?? query}`);
  return geometry;
}

function buildFeatureCollection(
  options: CliOptions,
  geometry: NonNullable<NominatimSearchResult['geojson']>,
): RegionBoundaryFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: options.name,
          provinceCodes: options.provinceCodes,
          source: 'OpenStreetMap Nominatim',
          license: 'ODbL 1.0',
        },
        geometry,
      },
    ],
  };
}

async function writeBoundaryFile(
  regionId: string,
  featureCollection: RegionBoundaryFeatureCollection,
): Promise<string> {
  await mkdir(REGIONS_DIR, { recursive: true });
  const outputPath = path.join(REGIONS_DIR, `${regionId}-boundary.json`);
  await writeFile(
    outputPath,
    `${JSON.stringify(featureCollection)}\n`,
    'utf8',
  );
  return outputPath;
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  console.log(
    `Fetching Nominatim boundary for ${options.name} (${options.provinceCodes.join(', ')})…`,
  );

  const geometry = await fetchNominatimAdminBoundary(options.query);
  const featureCollection = buildFeatureCollection(options, geometry);
  const outputPath = await writeBoundaryFile(options.regionId, featureCollection);
  console.log(`Wrote ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error('Failed to fetch region boundary:', error);
  process.exitCode = 1;
});

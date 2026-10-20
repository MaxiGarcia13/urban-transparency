import packageJson from '../package.json' with { type: 'json' };
import { delay } from '../utils/delay';

export type GeocodeCoordinates = {
  longitude: number;
  latitude: number;
};

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = `${packageJson.name}/${packageJson.version}`;
const MIN_REQUEST_GAP_MS = 1_100;

const geocodeCache = new Map<string, GeocodeCoordinates | null>();
let lastRequestAt = 0;

type NominatimSearchResult = {
  lat?: string;
  lon?: string;
};

/** Geocode a free-text place query via Nominatim (cached, rate-limited). */
export async function geocodePlaceQuery(
  query: string,
): Promise<GeocodeCoordinates | null> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return null;
  }

  if (geocodeCache.has(normalizedQuery)) {
    return geocodeCache.get(normalizedQuery) ?? null;
  }

  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_REQUEST_GAP_MS) {
    await delay(MIN_REQUEST_GAP_MS - elapsed);
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', normalizedQuery);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'es');

  lastRequestAt = Date.now();
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    geocodeCache.set(normalizedQuery, null);
    return null;
  }

  const results = (await response.json()) as NominatimSearchResult[];
  const first = results[0];
  const latitude = Number(first?.lat);
  const longitude = Number(first?.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    geocodeCache.set(normalizedQuery, null);
    return null;
  }

  const coordinates = { latitude, longitude };
  geocodeCache.set(normalizedQuery, coordinates);
  return coordinates;
}

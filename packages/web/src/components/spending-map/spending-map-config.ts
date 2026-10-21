import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { cantabriaRegion } from '@/config/regions/cantabria';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

export const CARTO_DARK_STYLE
  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const REGION_FALLBACK_CENTER = {
  longitude: cantabriaRegion.center[0],
  latitude: cantabriaRegion.center[1],
};

export const BOUNDS_SYNC_DEBOUNCE_MS = 75;

export const FOCUS_MIN_ZOOM = 14;

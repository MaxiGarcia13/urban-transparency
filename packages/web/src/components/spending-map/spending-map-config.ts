import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

export const CARTO_DARK_STYLE
  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const BOUNDS_SYNC_DEBOUNCE_MS = 75;

export const FOCUS_MIN_ZOOM = 14;

export const REGION_BOUNDARY_SOURCE_ID = 'region-boundary';
export const REGION_BOUNDARY_FILL_LAYER_ID = 'region-boundary-fill';
export const REGION_BOUNDARY_LINE_LAYER_ID = 'region-boundary-line';

export const REGION_BOUNDARY_FILL_COLOR = 'rgba(251, 146, 60, 0.08)';
export const REGION_BOUNDARY_LINE_COLOR = '#fb923c';
export const REGION_BOUNDARY_LINE_WIDTH = 1.5;

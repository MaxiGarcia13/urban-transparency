/// <reference types="astro/client" />

declare module '*.geojson' {
  const value: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      properties?: {
        neighborhoodId?: string;
        name?: string;
      } | null;
      geometry?: {
        type: string;
        coordinates: number[][][];
      } | null;
    }>;
  };
  export default value;
}

declare module 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url' {
  const workerUrl: string;
  export default workerUrl;
}

import type { Ref } from 'vue';
import { ref, watch } from 'vue';
import { CANTABRIA_REGION_ID, MAP_REGIONS } from '@/config/regions';
import {
  MAP_REGION_QUERY_KEY,
  parseMapRegionQuery,
  serializeMapRegionQuery,
} from '@/domain/map-region-query';
import { useAppUrlSearchParams } from './use-app-url-search-params';

const KNOWN_REGION_IDS = MAP_REGIONS.map((region) => region.id);

let sharedRegionId: Ref<string> | null = null;

export function useMapRegion(
  defaultRegionId: string = CANTABRIA_REGION_ID,
) {
  const params = useAppUrlSearchParams();

  if (!sharedRegionId) {
    sharedRegionId = ref(
      parseMapRegionQuery(params, KNOWN_REGION_IDS, defaultRegionId),
    );

    watch(sharedRegionId, (nextRegionId) => {
      const serialized = serializeMapRegionQuery(
        nextRegionId,
        KNOWN_REGION_IDS,
        defaultRegionId,
      );
      params[MAP_REGION_QUERY_KEY] = serialized.region ?? null;
    });
  }

  return { regionId: sharedRegionId };
}

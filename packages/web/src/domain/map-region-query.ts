export const MAP_REGION_QUERY_KEY = 'region' as const;

export interface MapRegionUrlParams {
  [MAP_REGION_QUERY_KEY]?: string | string[] | null;
}

function firstParamValue(
  value: string | string[] | null | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }
  return value?.trim() ?? '';
}

export function parseMapRegionQuery(
  params: MapRegionUrlParams,
  knownRegionIds: readonly string[],
  defaultRegionId: string,
): string {
  const regionId = firstParamValue(params[MAP_REGION_QUERY_KEY]);
  if (!regionId || !knownRegionIds.includes(regionId)) {
    return defaultRegionId;
  }
  return regionId;
}

export function parseMapRegionIdFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
  knownRegionIds: readonly string[],
  defaultRegionId: string,
): string {
  return parseMapRegionQuery(
    { [MAP_REGION_QUERY_KEY]: searchParams.get(MAP_REGION_QUERY_KEY) },
    knownRegionIds,
    defaultRegionId,
  );
}

export function serializeMapRegionQuery(
  regionId: string,
  knownRegionIds: readonly string[],
  defaultRegionId: string,
): { region?: string } {
  if (
    !regionId
    || regionId === defaultRegionId
    || !knownRegionIds.includes(regionId)
  ) {
    return {};
  }
  return { region: regionId };
}

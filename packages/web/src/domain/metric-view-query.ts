import type { MetricView } from '@/config/metrics';

export const METRIC_VIEW_QUERY_KEY = 'view' as const;

export interface MetricViewUrlParams {
  [METRIC_VIEW_QUERY_KEY]?: string | string[] | null;
}

function firstParamValue(
  value: string | string[] | null | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }
  return value?.trim() ?? '';
}

export function parseMetricViewQuery(
  params: MetricViewUrlParams,
  defaultView: MetricView,
  supportsMap: boolean,
): MetricView {
  const raw = firstParamValue(params[METRIC_VIEW_QUERY_KEY]);
  if (raw === 'list') {
    return 'list';
  }
  if (raw === 'map' && supportsMap) {
    return 'map';
  }
  return defaultView;
}

export function parseMetricViewFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
  defaultView: MetricView,
  supportsMap: boolean,
): MetricView {
  return parseMetricViewQuery(
    { [METRIC_VIEW_QUERY_KEY]: searchParams.get(METRIC_VIEW_QUERY_KEY) },
    defaultView,
    supportsMap,
  );
}

export function serializeMetricViewQuery(
  view: MetricView,
  defaultView: MetricView,
): { view?: string } {
  if (view === defaultView) {
    return {};
  }
  return { view };
}

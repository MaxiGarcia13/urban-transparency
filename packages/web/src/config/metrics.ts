export const METRIC_IDS = ['public-spending', 'business-power'] as const;

export type MetricId = (typeof METRIC_IDS)[number];

export type MetricView = 'list' | 'map';

export interface MetricDefinition {
  id: MetricId;
  path: string;
  navLabel: string;
  titleHighlight: string;
  titleHighlightClass: string;
  defaultView: MetricView;
  supportsMap: boolean;
}

export const METRICS: readonly MetricDefinition[] = [
  {
    id: 'public-spending',
    path: '/',
    navLabel: 'Gasto público',
    titleHighlight: 'gasto público',
    titleHighlightClass: 'text-orange-400',
    defaultView: 'map',
    supportsMap: true,
  },
  {
    id: 'business-power',
    path: '/business-power',
    navLabel: 'Poder empresarial',
    titleHighlight: 'actividad empresarial',
    titleHighlightClass: 'text-teal-400',
    defaultView: 'list',
    supportsMap: false,
  },
] as const;

export function getMetricById(metricId: MetricId): MetricDefinition {
  const metric = METRICS.find((entry) => entry.id === metricId);
  if (!metric) {
    throw new Error(`Unknown metric: ${metricId}`);
  }
  return metric;
}

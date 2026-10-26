export const METRIC_IDS = [
  'public-spending',
  'local-economy',
] as const;

export type MetricId = (typeof METRIC_IDS)[number];

export type MetricView = 'list' | 'map';

export interface MetricDefinition {
  id: MetricId;
  path: string;
  navLabel: string;
  titleLead: string;
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
    titleLead: '¿Dónde va el',
    titleHighlight: 'gasto público',
    titleHighlightClass: 'text-orange-400',
    defaultView: 'map',
    supportsMap: true,
  },
  {
    id: 'local-economy',
    path: '/local-economy',
    navLabel: 'Economía local',
    titleLead: '¿Cómo se relacionan',
    titleHighlight: 'empresas y renta',
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

export function metricIdFromPath(pathname: string): MetricId {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/local-economy') {
    return 'local-economy';
  }
  return 'public-spending';
}

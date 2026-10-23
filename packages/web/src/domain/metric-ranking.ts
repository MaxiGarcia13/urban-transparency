export interface MetricTrendPoint {
  year: number;
  value: number;
}

export interface MetricRankingRow {
  id: string;
  label: string;
  value: number | null;
  share: number | null;
  /** Relative gap vs a baseline (e.g. provincial mean), as a ratio. */
  deltaVsBaseline?: number | null;
}

export const METRIC_TOP_RANKING_LIMIT = 15;

export const MUNICIPAL_BUSINESS_STATS_SELECT_SQL = `
SELECT
  municipality_code AS municipalityCode,
  period_year AS periodYear,
  sector_code AS sectorCode,
  active_business_count AS activeBusinessCount,
  source_system AS sourceSystem,
  fetched_at AS fetchedAt
FROM municipal_business_stats
`;

export const MUNICIPAL_BUSINESS_STATS_ORDER_BY_SQL = `
ORDER BY period_year DESC, municipality_code ASC, sector_code ASC
`;

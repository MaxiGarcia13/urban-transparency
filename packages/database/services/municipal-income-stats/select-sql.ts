export const MUNICIPAL_INCOME_STATS_SELECT_SQL = `
SELECT
  municipality_code AS municipalityCode,
  period_year AS periodYear,
  renta_neta_media_persona AS rentaNetaMediaPersona,
  renta_neta_media_hogar AS rentaNetaMediaHogar,
  source_system AS sourceSystem,
  fetched_at AS fetchedAt
FROM municipal_income_stats
`;

export const MUNICIPAL_INCOME_STATS_ORDER_BY_SQL = `
ORDER BY period_year DESC, municipality_code ASC
`;

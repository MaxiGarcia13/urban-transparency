export const MUNICIPAL_INCOME_STATS_SELECT_SQL = `
SELECT
  municipality_code AS municipalityCode,
  period_year AS periodYear,
  mean_net_income_per_person AS meanNetIncomePerPerson,
  mean_net_income_per_household AS meanNetIncomePerHousehold,
  source_system AS sourceSystem,
  fetched_at AS fetchedAt
FROM municipal_income_stats
`;

export const MUNICIPAL_INCOME_STATS_ORDER_BY_SQL = `
ORDER BY period_year DESC, municipality_code ASC
`;

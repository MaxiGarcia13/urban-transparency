CREATE TABLE IF NOT EXISTS municipal_income_stats (
  municipality_code TEXT NOT NULL,
  period_year INTEGER NOT NULL,
  renta_neta_media_persona REAL,
  renta_neta_media_hogar REAL,
  source_system TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  PRIMARY KEY (municipality_code, period_year)
);

CREATE INDEX IF NOT EXISTS municipal_income_stats_period_year_idx
  ON municipal_income_stats (period_year);

CREATE INDEX IF NOT EXISTS municipal_income_stats_municipality_code_idx
  ON municipal_income_stats (municipality_code);

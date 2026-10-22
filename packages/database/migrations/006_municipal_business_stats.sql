CREATE TABLE IF NOT EXISTS municipal_business_stats (
  municipality_code TEXT NOT NULL,
  period_year INTEGER NOT NULL,
  sector_code TEXT NOT NULL,
  active_business_count INTEGER,
  source_system TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  PRIMARY KEY (municipality_code, period_year, sector_code)
);

CREATE INDEX IF NOT EXISTS municipal_business_stats_period_year_idx
  ON municipal_business_stats (period_year);

CREATE INDEX IF NOT EXISTS municipal_business_stats_municipality_code_idx
  ON municipal_business_stats (municipality_code);

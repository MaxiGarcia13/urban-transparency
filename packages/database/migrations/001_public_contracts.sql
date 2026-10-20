CREATE TABLE IF NOT EXISTS public_contracts (
  id TEXT PRIMARY KEY NOT NULL,
  contract_folder_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  contracting_party_name TEXT NOT NULL,
  contracting_party_nif TEXT,
  awarded_amount_eur REAL,
  awardee_name TEXT,
  awardee_nif TEXT,
  execution_city TEXT,
  nuts_code TEXT,
  awarded_at TEXT,
  detail_url TEXT,
  municipality_code TEXT,
  source_system TEXT NOT NULL,
  source_entry_updated_at TEXT,
  fetched_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS public_contracts_municipality_code_idx
  ON public_contracts (municipality_code);

CREATE INDEX IF NOT EXISTS public_contracts_nuts_code_idx
  ON public_contracts (nuts_code);

CREATE INDEX IF NOT EXISTS public_contracts_awarded_at_idx
  ON public_contracts (awarded_at);

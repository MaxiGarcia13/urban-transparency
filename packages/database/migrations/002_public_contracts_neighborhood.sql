ALTER TABLE public_contracts ADD COLUMN neighborhood_id TEXT;
ALTER TABLE public_contracts ADD COLUMN execution_longitude REAL;
ALTER TABLE public_contracts ADD COLUMN execution_latitude REAL;

CREATE INDEX IF NOT EXISTS public_contracts_neighborhood_id_idx
  ON public_contracts (neighborhood_id);

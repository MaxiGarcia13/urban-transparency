ALTER TABLE public_contracts ADD COLUMN postal_code TEXT;
ALTER TABLE public_contracts ADD COLUMN execution_address_line TEXT;

CREATE INDEX IF NOT EXISTS public_contracts_postal_code_idx
  ON public_contracts (postal_code);

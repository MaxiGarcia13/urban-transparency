ALTER TABLE public_contracts ADD COLUMN source_entry_id TEXT;

UPDATE public_contracts
SET source_entry_id = id
WHERE source_entry_id IS NULL;

DELETE FROM public_contracts
WHERE rowid IN (
  SELECT p.rowid
  FROM public_contracts AS p
  INNER JOIN (
    SELECT contract_folder_id, MIN(rowid) AS keep_rowid
    FROM public_contracts
    WHERE contract_folder_id IS NOT NULL
      AND contract_folder_id != ''
    GROUP BY contract_folder_id
    HAVING COUNT(*) > 1
  ) AS duplicates
    ON p.contract_folder_id = duplicates.contract_folder_id
  WHERE p.rowid != duplicates.keep_rowid
);

UPDATE public_contracts
SET id = contract_folder_id
WHERE contract_folder_id IS NOT NULL
  AND contract_folder_id != ''
  AND id LIKE 'https://%';

CREATE UNIQUE INDEX IF NOT EXISTS public_contracts_source_entry_id_uidx
  ON public_contracts (source_entry_id)
  WHERE source_entry_id IS NOT NULL;

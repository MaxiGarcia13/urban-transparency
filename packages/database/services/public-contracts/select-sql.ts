export const PUBLIC_CONTRACT_SELECT_SQL = `
SELECT
  id,
  title,
  status,
  contracting_party_name AS contractingPartyName,
  contracting_party_nif AS contractingPartyNif,
  awarded_amount_eur AS awardedAmountEur,
  awardee_name AS awardeeName,
  awardee_nif AS awardeeNif,
  execution_city AS executionCity,
  postal_code AS postalCode,
  execution_address_line AS executionAddressLine,
  nuts_code AS nutsCode,
  awarded_at AS awardedAt,
  detail_url AS detailUrl,
  municipality_code AS municipalityCode,
  neighborhood_id AS neighborhoodId,
  execution_longitude AS executionLongitude,
  execution_latitude AS executionLatitude,
  source_system AS sourceSystem,
  source_entry_id AS sourceEntryId,
  source_entry_updated_at AS sourceEntryUpdatedAt,
  fetched_at AS fetchedAt
FROM public_contracts
`;

export const PUBLIC_CONTRACT_ORDER_BY_SQL
  = 'ORDER BY awarded_at DESC NULLS LAST, fetched_at DESC';

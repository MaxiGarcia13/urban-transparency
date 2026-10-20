import type { Municipality, PublicContract } from '@urban-transparency/shared';

import { geocodePlaceQuery } from '../services/geocode-nominatim';

function buildGeocodeQuery(contract: PublicContract, municipality: Municipality): string | null {
  const parts = [
    contract.executionAddressLine,
    contract.postalCode,
    contract.executionCity ?? municipality.name,
    'Spain',
  ].filter((part): part is string => Boolean(part && part.trim()));

  if (!contract.postalCode && !contract.executionAddressLine) {
    return null;
  }

  return parts.join(', ');
}

/**
 * Fill execution coordinates from postal code / address via Nominatim.
 * Falls back to municipality centroid when no postal/address detail exists.
 */
export async function geocodeContractLocation(
  contract: PublicContract,
  municipality: Municipality,
): Promise<PublicContract> {
  if (contract.executionLongitude != null && contract.executionLatitude != null) {
    return contract;
  }

  const query = buildGeocodeQuery(contract, municipality);
  if (!query) {
    return {
      ...contract,
      executionLongitude: municipality.longitude,
      executionLatitude: municipality.latitude,
    };
  }

  const coordinates = await geocodePlaceQuery(query);
  if (!coordinates) {
    return {
      ...contract,
      executionLongitude: municipality.longitude,
      executionLatitude: municipality.latitude,
    };
  }

  return {
    ...contract,
    executionLongitude: coordinates.longitude,
    executionLatitude: coordinates.latitude,
  };
}

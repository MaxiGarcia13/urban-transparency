import type { PublicContractWithNeighborhood } from './public-contract-with-neighborhood';

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('es');
}

/** Returns neighborhood ids matching name or related contract title/awardee. */
export function matchNeighborhoodsBySearch(
  searchQuery: string,
  neighborhoods: readonly { id: string; name: string }[],
  contracts: readonly PublicContractWithNeighborhood[],
): Set<string> | null {
  const normalizedQuery = normalizeSearchText(searchQuery);

  if (!normalizedQuery) {
    return null;
  }

  const matchedIds = new Set<string>();

  for (const neighborhood of neighborhoods) {
    if (normalizeSearchText(neighborhood.name).includes(normalizedQuery)) {
      matchedIds.add(neighborhood.id);
    }
  }

  for (const contract of contracts) {
    const title = normalizeSearchText(contract.title);
    const awardee = normalizeSearchText(contract.awardeeName ?? '');

    if (title.includes(normalizedQuery) || awardee.includes(normalizedQuery)) {
      matchedIds.add(contract.neighborhoodId);
    }
  }

  return matchedIds;
}

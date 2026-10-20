import type { PublicContract } from '@urban-transparency/shared';

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('es');
}

/** Filter contracts by title or awardee name. Empty query returns all. */
export function matchContractsBySearch(
  searchQuery: string,
  contracts: readonly PublicContract[],
): PublicContract[] {
  const normalizedQuery = normalizeSearchText(searchQuery);

  if (!normalizedQuery) {
    return [...contracts];
  }

  return contracts.filter((contract) => {
    const title = normalizeSearchText(contract.title);
    const awardee = normalizeSearchText(contract.awardeeName ?? '');
    return title.includes(normalizedQuery) || awardee.includes(normalizedQuery);
  });
}

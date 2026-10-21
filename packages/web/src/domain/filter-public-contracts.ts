import type { PublicContract, PublicContractStatus } from '@urban-transparency/shared';
import { PUBLIC_CONTRACT_STATUSES } from '@urban-transparency/shared';

export const FILTERABLE_PUBLIC_CONTRACT_STATUSES = [
  ...PUBLIC_CONTRACT_STATUSES,
  'UNKNOWN',
] as const satisfies readonly PublicContractStatus[];

export interface PublicContractFilters {
  searchQuery: string;
  statuses: readonly PublicContractStatus[];
  yearFrom: number | null;
  yearTo: number | null;
}

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('es');
}

function normalizeNif(value: string): string {
  return normalizeSearchText(value).replace(/[\s.-]/g, '');
}

export function contractAwardedYear(
  contract: Pick<PublicContract, 'awardedAt'>,
): number | null {
  if (!contract.awardedAt) {
    return null;
  }

  const yearPrefix = /^(\d{4})/.exec(contract.awardedAt);
  if (yearPrefix) {
    return Number(yearPrefix[1]);
  }

  const date = new Date(contract.awardedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.getFullYear();
}

export function availableContractYears(
  contracts: readonly Pick<PublicContract, 'awardedAt'>[],
): number[] {
  const years = new Set<number>();
  for (const contract of contracts) {
    const year = contractAwardedYear(contract);
    if (year != null) {
      years.add(year);
    }
  }
  return [...years].sort((a, b) => a - b);
}

function matchesSearch(
  contract: PublicContract,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const haystacks = [
    normalizeSearchText(contract.title),
    normalizeSearchText(contract.awardeeName ?? ''),
    normalizeSearchText(contract.contractingPartyName),
    normalizeNif(contract.awardeeNif ?? ''),
    normalizeNif(contract.contractingPartyNif ?? ''),
  ];
  const nifQuery = normalizeNif(normalizedQuery);

  return haystacks.some(
    (haystack) =>
      haystack.includes(normalizedQuery)
      || (nifQuery.length > 0 && haystack.includes(nifQuery)),
  );
}

function matchesStatus(
  contract: PublicContract,
  statuses: readonly PublicContractStatus[],
): boolean {
  if (statuses.length === 0) {
    return true;
  }
  return statuses.includes(contract.status);
}

function matchesYearRange(
  contract: PublicContract,
  yearFrom: number | null,
  yearTo: number | null,
): boolean {
  if (yearFrom == null && yearTo == null) {
    return true;
  }

  const year = contractAwardedYear(contract);
  if (year == null) {
    return false;
  }
  if (yearFrom != null && year < yearFrom) {
    return false;
  }
  if (yearTo != null && year > yearTo) {
    return false;
  }
  return true;
}

export function filterPublicContracts(
  contracts: readonly PublicContract[],
  filters: PublicContractFilters,
): PublicContract[] {
  const normalizedQuery = normalizeSearchText(filters.searchQuery);

  return contracts.filter(
    (contract) =>
      matchesSearch(contract, normalizedQuery)
      && matchesStatus(contract, filters.statuses)
      && matchesYearRange(contract, filters.yearFrom, filters.yearTo),
  );
}

export function countActivePublicContractFilters(
  filters: PublicContractFilters,
): number {
  let count = 0;
  if (normalizeSearchText(filters.searchQuery)) {
    count += 1;
  }
  if (filters.statuses.length > 0) {
    count += 1;
  }
  if (filters.yearFrom != null) {
    count += 1;
  }
  if (filters.yearTo != null) {
    count += 1;
  }
  return count;
}

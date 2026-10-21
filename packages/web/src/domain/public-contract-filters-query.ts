import type { PublicContractStatus } from '@urban-transparency/shared';
import type { PublicContractFilters } from './filter-public-contracts';
import { FILTERABLE_PUBLIC_CONTRACT_STATUSES } from './filter-public-contracts';

export const PUBLIC_CONTRACT_FILTER_QUERY_KEYS = {
  search: 'q',
  status: 'status',
  yearFrom: 'yearFrom',
  yearTo: 'yearTo',
} as const;

export interface PublicContractFiltersQuery {
  q?: string;
  status?: string;
  yearFrom?: string;
  yearTo?: string;
}

export type PublicContractFiltersUrlParams = {
  [K in (typeof PUBLIC_CONTRACT_FILTER_QUERY_KEYS)[keyof typeof PUBLIC_CONTRACT_FILTER_QUERY_KEYS]]?:
    | string
    | string[]
    | null;
};

const FILTERABLE_STATUS_SET = new Set<string>(FILTERABLE_PUBLIC_CONTRACT_STATUSES);

function firstParamValue(
  value: string | string[] | null | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }
  return value?.trim() ?? '';
}

function parseYearParam(
  value: string | string[] | null | undefined,
): number | null {
  const raw = firstParamValue(value);
  if (!raw) {
    return null;
  }
  const year = Number(raw);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return null;
  }
  return year;
}

function parseStatusParam(
  value: string | string[] | null | undefined,
): PublicContractStatus[] {
  const raw = Array.isArray(value) ? value.join(',') : (value ?? '');
  if (!raw.trim()) {
    return [];
  }

  const seen = new Set<PublicContractStatus>();
  const statuses: PublicContractStatus[] = [];
  for (const part of raw.split(',')) {
    const status = part.trim();
    if (!FILTERABLE_STATUS_SET.has(status)) {
      continue;
    }
    const typed = status as PublicContractStatus;
    if (seen.has(typed)) {
      continue;
    }
    seen.add(typed);
    statuses.push(typed);
  }
  return statuses;
}

export function parsePublicContractFiltersQuery(
  params: PublicContractFiltersUrlParams,
): PublicContractFilters {
  let yearFrom = parseYearParam(params[PUBLIC_CONTRACT_FILTER_QUERY_KEYS.yearFrom]);
  let yearTo = parseYearParam(params[PUBLIC_CONTRACT_FILTER_QUERY_KEYS.yearTo]);

  if (yearFrom != null && yearTo != null && yearFrom > yearTo) {
    [yearFrom, yearTo] = [yearTo, yearFrom];
  }

  return {
    searchQuery: firstParamValue(params[PUBLIC_CONTRACT_FILTER_QUERY_KEYS.search]),
    statuses: parseStatusParam(params[PUBLIC_CONTRACT_FILTER_QUERY_KEYS.status]),
    yearFrom,
    yearTo,
  };
}

export function serializePublicContractFiltersQuery(
  filters: PublicContractFilters,
): PublicContractFiltersQuery {
  const query: PublicContractFiltersQuery = {};
  const searchQuery = filters.searchQuery.trim();
  if (searchQuery) {
    query.q = searchQuery;
  }
  if (filters.statuses.length > 0) {
    query.status = filters.statuses.join(',');
  }
  if (filters.yearFrom != null) {
    query.yearFrom = String(filters.yearFrom);
  }
  if (filters.yearTo != null) {
    query.yearTo = String(filters.yearTo);
  }
  return query;
}

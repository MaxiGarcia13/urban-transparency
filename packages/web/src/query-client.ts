import { QueryClient } from '@tanstack/vue-query';

const QUERY_CLIENT_OPTIONS = {
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
} as const;

type QueryClientGlobal = typeof globalThis & {
  __urbanClarityQueryClient?: QueryClient;
};

export function makeQueryClient(): QueryClient {
  return new QueryClient(QUERY_CLIENT_OPTIONS);
}

export function getQueryClient(): QueryClient {
  if (import.meta.env.SSR) {
    return makeQueryClient();
  }
  const globalForQuery = globalThis as QueryClientGlobal;
  globalForQuery.__urbanClarityQueryClient ??= makeQueryClient();
  return globalForQuery.__urbanClarityQueryClient;
}

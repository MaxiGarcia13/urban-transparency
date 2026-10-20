import type { Connection } from '@tursodatabase/serverless';
import process from 'node:process';
import { connect } from '@tursodatabase/serverless';

export type DatabaseClient = Connection;

/** Connect to Turso using `TURSO_URL` / `TURSO_AUTH_TOKEN` (load via `--env-file`). */
export function createDatabaseClient(): DatabaseClient {
  const url = process.env.TURSO_URL;
  if (!url) {
    throw new Error('TURSO_URL is required');
  }

  return connect({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

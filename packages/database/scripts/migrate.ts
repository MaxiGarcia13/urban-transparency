import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { createDatabaseClient } from '../services/client';

const packageDir = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(packageDir, '../migrations/001_public_contracts.sql');

async function migrate(): Promise<void> {
  const sql = await readFile(migrationPath, 'utf8');
  const client = createDatabaseClient();

  try {
    await client.exec(sql);
    console.log('Applied migration: 001_public_contracts.sql');
  } finally {
    await client.close();
  }
}

migrate().catch((error: unknown) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});

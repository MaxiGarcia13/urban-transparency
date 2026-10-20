import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { createDatabaseClient } from '../services/client';

const packageDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(packageDir, '../migrations');

async function migrate(): Promise<void> {
  const migrationFiles = (await readdir(migrationsDir))
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();

  const client = createDatabaseClient();

  try {
    await client.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);

    for (const fileName of migrationFiles) {
      const alreadyApplied = await client.get(
        'SELECT id FROM schema_migrations WHERE id = ?',
        [fileName],
      );
      if (alreadyApplied) {
        console.log(`Skipped migration (already applied): ${fileName}`);
        continue;
      }

      const sql = await readFile(join(migrationsDir, fileName), 'utf8');
      await client.exec(sql);
      await client.run(
        'INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)',
        [fileName, new Date().toISOString()],
      );
      console.log(`Applied migration: ${fileName}`);
    }
  } finally {
    await client.close();
  }
}

migrate().catch((error: unknown) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});

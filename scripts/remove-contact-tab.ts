import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { config as loadEnv } from 'dotenv';

const { Client } = pg;

const DEFAULT_DB_URL = 'postgresql://postgres:Msj.116159@localhost:5432/portal?schema=public';

/**
 * Contacts are stored in the `contacts` table (one row per phone entry,
 * grouped by `tab`). Editing `public/data/contacts.yaml` has no effect on a
 * running site — that file is only read by `scripts/migrate-yaml-to-db.ts`.
 * This script removes a whole tab (e.g. the HAG phone table) from the database.
 */
function loadDatabaseUrl(): string {
  // Same precedence as Next.js: .env.local wins over .env, and a real
  // environment variable (Docker, ssh, CI) always wins over both.
  for (const file of ['.env.local', '.env']) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      loadEnv({ path: envPath, override: false, quiet: true });
    }
  }
  return process.env.DATABASE_URL || DEFAULT_DB_URL;
}

interface Options {
  tab?: string;
  like: boolean;
  dryRun: boolean;
  list: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { like: false, dryRun: false, list: false };
  for (const arg of argv) {
    if (arg === '--like') options.like = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--list') options.list = true;
    else if (!arg.startsWith('-') && options.tab === undefined) options.tab = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function usage(): string {
  return [
    'Usage: pnpm db:remove-contact-tab <tab> [--like] [--dry-run]',
    '       pnpm db:remove-contact-tab --list',
    '',
    '  <tab>       Exact value of the contacts.tab column to delete (e.g. tab2)',
    '  --like      Treat <tab> as a pattern matched with SQL ILIKE (e.g. هاگ)',
    '  --dry-run   Only report the matching rows, delete nothing',
    '  --list      List every tab currently stored in the contacts table',
  ].join('\n');
}

async function listTabs(client: pg.Client): Promise<void> {
  const { rows } = await client.query<{ tab: string; count: string }>(
    'SELECT tab, COUNT(*)::text AS count FROM contacts GROUP BY tab ORDER BY tab'
  );
  if (rows.length === 0) {
    console.log('The contacts table is empty.');
    return;
  }
  console.log('Tabs currently stored in the contacts table:');
  for (const row of rows) {
    console.log(`  • "${row.tab}" → ${row.count} row(s)`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.list && options.tab === undefined) {
    console.error(usage());
    process.exit(1);
  }

  const client = new Client({ connectionString: loadDatabaseUrl() });
  await client.connect();

  try {
    if (options.list) {
      await listTabs(client);
      return;
    }

    const tab = options.tab as string;
    const where = options.like ? 'tab ILIKE $1' : 'tab = $1';
    const value = options.like ? `%${tab}%` : tab;

    const matched = await client.query<{ id: number; tab: string; unit: string; name: string }>(
      `SELECT id, tab, unit, name FROM contacts WHERE ${where} ORDER BY id`,
      [value]
    );

    if (matched.rows.length === 0) {
      console.log(`No contact rows match "${tab}". Nothing to delete.\n`);
      await listTabs(client);
      return;
    }

    console.log(`${matched.rows.length} row(s) match "${tab}":`);
    for (const row of matched.rows) {
      console.log(`  • [${row.id}] ${row.tab} | ${row.unit} | ${row.name}`);
    }

    if (options.dryRun) {
      console.log('\nDry run: nothing was deleted. Re-run without --dry-run to delete these rows.');
      return;
    }

    const deleted = await client.query(`DELETE FROM contacts WHERE ${where}`, [value]);
    console.log(`\n✓ Deleted ${deleted.rowCount ?? 0} row(s).\n`);
    await listTabs(client);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('✗ Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});

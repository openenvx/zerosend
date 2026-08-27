#!/usr/bin/env bun

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.join(import.meta.dirname, '..');
const wranglerConfigPath = path.join(repoRoot, 'wrangler.jsonc');
const remoteConfigPath = path.join(repoRoot, '.wrangler', 'd1-remote.jsonc');

interface D1DatabaseConfig {
  binding: string;
  database_name: string;
  database_id?: string;
  migrations_dir?: string;
}

interface WranglerConfig {
  name?: string;
  d1_databases?: D1DatabaseConfig[];
}

interface D1ListEntry {
  name: string;
  uuid: string;
}

function parseJsonc(text: string): unknown {
  const withoutComments = text.replaceAll(/^\s*\/\/.*$/gm, '');
  const withoutTrailingCommas = withoutComments.replaceAll(
    /,(\s*[}\]])/g,
    '$1'
  );

  return JSON.parse(withoutTrailingCommas);
}

function getD1Database(config: WranglerConfig): D1DatabaseConfig {
  const database = config.d1_databases?.find(
    (entry) => entry.binding === 'DB' || entry.database_name === 'zerosend'
  );

  if (!database) {
    throw new Error(
      `No D1 database named zerosend (binding DB) in ${wranglerConfigPath}`
    );
  }

  return database;
}

function parseD1List(stdout: string): D1ListEntry[] {
  const start = stdout.indexOf('[');
  if (start === -1) {
    throw new Error(`Unexpected wrangler d1 list output:\n${stdout}`);
  }

  const parsed: unknown = JSON.parse(stdout.slice(start));
  if (!Array.isArray(parsed)) {
    throw new TypeError('wrangler d1 list --json did not return an array');
  }

  return parsed.filter((entry: unknown): entry is D1ListEntry => {
    if (typeof entry !== 'object' || entry === null) {
      return false;
    }

    const record = entry as { name?: unknown; uuid?: unknown };
    return typeof record.name === 'string' && typeof record.uuid === 'string';
  });
}

async function runWrangler(
  args: string[],
  options: { capture: boolean }
): Promise<string> {
  const process = Bun.spawn(['bunx', 'wrangler', ...args], {
    cwd: repoRoot,
    stderr: 'inherit',
    stdin: 'inherit',
    stdout: options.capture ? 'pipe' : 'inherit',
  });
  const exitCode = await process.exited;

  if (exitCode !== 0) {
    throw new Error(`wrangler ${args.join(' ')} failed with exit ${exitCode}`);
  }

  if (!options.capture) {
    return '';
  }

  return await new Response(process.stdout).text();
}

async function resolveDatabaseId(database: D1DatabaseConfig): Promise<string> {
  if (database.database_id) {
    return database.database_id;
  }

  const stdout = await runWrangler(['d1', 'list', '--json'], { capture: true });
  const match = parseD1List(stdout).find(
    (entry) => entry.name === database.database_name
  );

  if (!match) {
    throw new Error(
      `No remote D1 database named "${database.database_name}". Deploy the Worker once so Cloudflare can provision it, then retry.`
    );
  }

  return match.uuid;
}

async function main(): Promise<void> {
  const config = parseJsonc(
    await readFile(wranglerConfigPath, 'utf-8')
  ) as WranglerConfig;
  const database = getD1Database(config);
  const databaseId = await resolveDatabaseId(database);

  await mkdir(path.dirname(remoteConfigPath), { recursive: true });
  await writeFile(
    remoteConfigPath,
    `${JSON.stringify(
      {
        d1_databases: [
          {
            binding: database.binding,
            database_id: databaseId,
            database_name: database.database_name,
            migrations_dir: '../packages/db/src/migrations',
          },
        ],
        name: config.name ?? 'zerosend',
      },
      null,
      2
    )}\n`
  );

  console.log(
    `Applying remote D1 migrations to ${database.database_name} (${databaseId})`
  );
  await runWrangler(
    [
      'd1',
      'migrations',
      'apply',
      database.binding,
      '--remote',
      '--config',
      remoteConfigPath,
    ],
    { capture: false }
  );
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}

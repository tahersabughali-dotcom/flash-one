/**
 * Apply repository canonical migrations from zero onto a disposable
 * local Postgres only. Refuses non-local hosts.
 *
 * Usage (PowerShell):
 *   $env:FLASH_ONE_REPLAY_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
 *   node scripts/replay-canonical-migrations.mjs
 *
 * Requires a local disposable database. Does not touch Development or Production.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const url = process.env.FLASH_ONE_REPLAY_DATABASE_URL?.trim() ?? "";
if (!url) {
  console.error("FLASH_ONE_REPLAY_DATABASE_URL is required.");
  console.error("Refusing to run. This script never uses the connected Development database.");
  process.exit(2);
}

let parsed;
try {
  parsed = new URL(url);
} catch {
  console.error("FLASH_ONE_REPLAY_DATABASE_URL is not a valid URL.");
  process.exit(2);
}

const host = parsed.hostname.toLowerCase();
if (host !== "127.0.0.1" && host !== "localhost") {
  console.error(`Refusing non-local host: ${host}`);
  process.exit(2);
}

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No canonical migration files found.");
  process.exit(1);
}

console.log(`Applying ${files.length} canonical migrations to local ${host}.`);

for (const file of files) {
  const full = path.join(migrationsDir, file);
  console.log(`apply ${file}`);
  const result = spawnSync("psql", [url, "-v", "ON_ERROR_STOP=1", "-f", full], {
    stdio: "inherit",
  });
  if (result.error && result.error.code === "ENOENT") {
    console.error("psql is not installed. Install local Postgres client tools, or use Docker + `npx supabase db reset --local`.");
    process.exit(2);
  }
  if (result.status !== 0) {
    console.error(`Failed on ${file}`);
    process.exit(result.status ?? 1);
  }
}

console.log("Canonical replay finished.");

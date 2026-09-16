/**
 * F-MIG-001 isolated empty-database replay of canonical repository migrations.
 *
 * Uses PGlite (in-process PostgreSQL) — NOT linked Development.
 * Bootstraps minimal Auth/Storage/role stubs equivalent to an empty Supabase project.
 *
 * Usage: node scripts/f-mig-001/replay-canonical.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const migrationsDir = path.join(root, "supabase", "migrations");
const outDir = path.join(root, "docs", "f-mig-001");

const BOOTSTRAP_SQL = `
create schema if not exists auth;
create schema if not exists storage;
create schema if not exists extensions;

-- Empty Supabase projects provide pgcrypto; PGlite uses uuid-ossp + stubs.
create extension if not exists "uuid-ossp";

create or replace function public.gen_random_uuid()
returns uuid
language sql
volatile
as $$ select uuid_generate_v4() $$;

-- Minimal pgcrypto-compatible stubs for migration-time DDL/seed paths.
create or replace function public.gen_random_bytes(n integer)
returns bytea
language plpgsql
volatile
as $$
declare
  result bytea := ''::bytea;
  chunk bytea;
  remaining integer := n;
begin
  if n < 0 then
    raise exception 'gen_random_bytes: n must be >= 0';
  end if;
  while remaining > 0 loop
    chunk := decode(md5(random()::text || clock_timestamp()::text || remaining::text), 'hex');
    if remaining >= 16 then
      result := result || chunk;
      remaining := remaining - 16;
    else
      result := result || substring(chunk from 1 for remaining);
      remaining := 0;
    end if;
  end loop;
  return result;
end;
$$;

create or replace function public.digest(data bytea, type text)
returns bytea
language sql
immutable
as $$
  select decode(md5(data), 'hex')
$$;

create or replace function public.digest(data text, type text)
returns bytea
language sql
immutable
as $$
  select decode(md5(convert_to(data, 'UTF8')), 'hex')
$$;

-- Roles present on Supabase (no-op if already exist)
do $$ begin
  create role anon nologin;
exception when duplicate_object then null;
end $$;
do $$ begin
  create role authenticated nologin;
exception when duplicate_object then null;
end $$;
do $$ begin
  create role service_role nologin bypassrls;
exception when duplicate_object then null;
end $$;
do $$ begin
  create role authenticator nologin;
exception when duplicate_object then null;
end $$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema storage to anon, authenticated, service_role;

create table if not exists auth.users (
  id uuid primary key,
  email text,
  created_at timestamptz not null default now()
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon');
$$;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  metadata jsonb,
  path_tokens text[] generated always as (string_to_array(name, '/')) stored
);

alter table storage.objects enable row level security;

create or replace function storage.foldername(name text)
returns text[]
language sql
immutable
as $$
  select string_to_array(name, '/');
$$;

create or replace function storage.filename(name text)
returns text
language sql
immutable
as $$
  select (string_to_array(name, '/'))[array_length(string_to_array(name, '/'), 1)];
$$;

create or replace function storage.extension(name text)
returns text
language sql
immutable
as $$
  select reverse(split_part(reverse(storage.filename(name)), '.', 1));
$$;
`;

function listMigrations() {
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

async function fingerprint(db) {
  const tables = await db.query(`
    select c.relname as name,
           c.relrowsecurity as rls,
           c.relforcerowsecurity as force_rls
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by 1
  `);

  const columns = await db.query(`
    select table_name, column_name, data_type, udt_name, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public'
    order by table_name, ordinal_position
  `);

  const constraints = await db.query(`
    select tc.table_name, tc.constraint_type, tc.constraint_name
    from information_schema.table_constraints tc
    where tc.table_schema = 'public'
    order by 1, 2, 3
  `);

  const indexes = await db.query(`
    select tablename, indexname
    from pg_indexes
    where schemaname = 'public'
    order by 1, 2
  `);

  const policies = await db.query(`
    select schemaname, tablename, policyname, cmd, roles::text as roles
    from pg_policies
    where schemaname in ('public', 'storage')
    order by 1, 2, 3
  `);

  const functions = await db.query(`
    select p.proname as name,
           pg_get_function_identity_arguments(p.oid) as args,
           p.prosecdef as security_definer,
           p.proconfig as config
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
    order by 1, 2
  `);

  const triggers = await db.query(`
    select c.relname as table_name, t.tgname as trigger_name
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and not t.tgisinternal
    order by 1, 2
  `);

  const buckets = await db.query(`
    select id, name, public from storage.buckets order by id
  `);

  return {
    table_count: tables.rows.length,
    rls_on: tables.rows.filter((r) => r.rls).length,
    force_rls: tables.rows.filter((r) => r.force_rls).length,
    policy_count: policies.rows.length,
    function_count: functions.rows.length,
    security_definer_count: functions.rows.filter((r) => r.security_definer).length,
    trigger_count: triggers.rows.length,
    column_count: columns.rows.length,
    constraint_count: constraints.rows.length,
    index_count: indexes.rows.length,
    tables: tables.rows,
    columns: columns.rows,
    constraints: constraints.rows,
    indexes: indexes.rows,
    policies: policies.rows,
    functions: functions.rows,
    triggers: triggers.rows,
    buckets: buckets.rows,
  };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const files = listMigrations();
  const results = [];
  // uuid-ossp + pgcrypto-compatible stubs stand in for empty-Supabase builtins.
  // Migration files are not rewritten on disk; only the in-memory apply path
  // skips unavailable `create extension pgcrypto` (control file absent in PGlite).
  const db = new PGlite({ extensions: { uuid_ossp } });

  await db.exec(BOOTSTRAP_SQL);

  for (const file of files) {
    const full = path.join(migrationsDir, file);
    let sql = fs.readFileSync(full, "utf8");
    sql = sql.replace(
      /create\s+extension\s+if\s+not\s+exists\s+pgcrypto\s*;/gi,
      "-- pgcrypto: provided by empty Supabase / PGlite stubs (see BOOTSTRAP_SQL)\n"
    );
    const started = Date.now();
    try {
      await db.exec(sql);
      results.push({
        file,
        status: "ok",
        ms: Date.now() - started,
      });
      console.log(`OK  ${file}`);
    } catch (err) {
      const message = err?.message ?? String(err);
      results.push({
        file,
        status: "FAIL",
        ms: Date.now() - started,
        error: message,
      });
      console.error(`FAIL ${file}`);
      console.error(message);
      fs.writeFileSync(
        path.join(outDir, "replay-results.json"),
        JSON.stringify({ ok: false, results }, null, 2)
      );
      process.exitCode = 1;
      return;
    }
  }

  const fp = await fingerprint(db);
  const payload = {
    ok: true,
    environment: "pglite-isolated-empty",
    from_empty: true,
    migration_count: files.length,
    results,
    fingerprint: {
      table_count: fp.table_count,
      rls_on: fp.rls_on,
      force_rls: fp.force_rls,
      policy_count: fp.policy_count,
      function_count: fp.function_count,
      security_definer_count: fp.security_definer_count,
      trigger_count: fp.trigger_count,
      column_count: fp.column_count,
      constraint_count: fp.constraint_count,
      index_count: fp.index_count,
      tables: fp.tables.map((t) => t.name),
      buckets: fp.buckets,
    },
    detail: fp,
  };

  fs.writeFileSync(
    path.join(outDir, "replay-results.json"),
    JSON.stringify(payload, null, 2)
  );
  fs.writeFileSync(
    path.join(outDir, "replay-fingerprint.json"),
    JSON.stringify(payload.fingerprint, null, 2)
  );
  console.log(
    JSON.stringify(
      {
        ok: true,
        tables: fp.table_count,
        rls: fp.rls_on,
        force: fp.force_rls,
        policies: fp.policy_count,
        functions: fp.function_count,
        secdef: fp.security_definer_count,
        triggers: fp.trigger_count,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

/**
 * Generates supabase/phase2.sql — the Phase 2 schema + RLS + seed file.
 *
 * The seed rows are serialised from the ACTUAL src/data modules (never
 * hand-copied), so the database starts out byte-identical to the local
 * content the site already renders. Run with:
 *
 *   node scripts/gen-seed.mjs
 *
 * (Node >= 22.6 strips the TypeScript types from the data modules.)
 * The script verifies its own output: every JSON literal it emits is
 * parsed back and deep-compared against the source object.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { register } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve the data modules' extensionless imports ('./profile').
register('./ts-resolve-hook.mjs', import.meta.url);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const { profile, profileCards } = await import(join(root, 'src/data/profile.ts'));
const { projects } = await import(join(root, 'src/data/projects.ts'));
const { skills } = await import(join(root, 'src/data/skills.ts'));
const { gallery } = await import(join(root, 'src/data/gallery.ts'));
const { digitalWorld } = await import(join(root, 'src/data/achievements.ts'));
const { socialLinks } = await import(join(root, 'src/data/links.ts'));
const { settings } = await import(join(root, 'src/data/settings.ts'));

/** key -> value stored in site_content (mirrors src/content.tsx). */
const rows = {
  profile: { profile, cards: profileCards },
  projects,
  skills,
  gallery,
  achievements: digitalWorld,
  links: socialLinks,
  settings,
};

const DDL = `-- =====================================================================
-- LIMON identity site — Phase 2 backend (Supabase)
-- ---------------------------------------------------------------------
-- Paste this whole file into the Supabase SQL editor and run it once.
-- It is safe to re-run: tables/policies use IF EXISTS guards and the
-- seed rows use ON CONFLICT DO NOTHING (live admin edits are kept).
--
-- Tables:
--   public.site_content  — one jsonb row per content module
--                          (profile, projects, skills, gallery,
--                          achievements, links, settings). Publicly
--                          readable; writable only by admins
--                          (public.is_admin()).
--   public.site_messages — contact-form inbox. Anyone may INSERT a
--                          length-checked message; only admins may
--                          read / update / delete.
-- =====================================================================

-- ---------------------------------------------------------------------
-- site_content
-- ---------------------------------------------------------------------
create table if not exists public.site_content (
  "key"       text primary key,
  "value"     jsonb not null,
  "updatedAt" bigint not null
);

alter table public.site_content enable row level security;

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "site_content_admin_insert" on public.site_content;
create policy "site_content_admin_insert"
  on public.site_content
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "site_content_admin_update" on public.site_content;
create policy "site_content_admin_update"
  on public.site_content
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_content_admin_delete" on public.site_content;
create policy "site_content_admin_delete"
  on public.site_content
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- site_messages (contact-form inbox)
-- ---------------------------------------------------------------------
create table if not exists public.site_messages (
  "id"        text primary key,
  "name"      text not null,
  "email"     text not null,
  "message"   text not null,
  "read"      boolean not null default false,
  "createdAt" bigint not null
);

alter table public.site_messages enable row level security;

grant insert on public.site_messages to anon, authenticated;
grant select, update, delete on public.site_messages to authenticated;

drop policy if exists "site_messages_public_insert" on public.site_messages;
create policy "site_messages_public_insert"
  on public.site_messages
  for insert
  to anon, authenticated
  with check (
    char_length("name") between 1 and 80
    and char_length("email") between 3 and 120
    and char_length("message") between 1 and 2000
  );

drop policy if exists "site_messages_admin_select" on public.site_messages;
create policy "site_messages_admin_select"
  on public.site_messages
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "site_messages_admin_update" on public.site_messages;
create policy "site_messages_admin_update"
  on public.site_messages
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_messages_admin_delete" on public.site_messages;
create policy "site_messages_admin_delete"
  on public.site_messages
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- Seed: initial site_content rows, serialised from src/data/*.
-- ON CONFLICT DO NOTHING — re-running never overwrites admin edits.
-- ---------------------------------------------------------------------
`;

/** Escape a JS value as a single-quoted SQL jsonb literal. */
function sqlJson(value) {
  const json = JSON.stringify(value);
  // With standard_conforming_strings on (the Postgres default), a
  // backslash inside a '...' literal is a literal backslash, which
  // would corrupt JSON escape sequences. The site content contains
  // none — fail loudly rather than emit bad SQL if that ever changes.
  if (json.includes('\\')) {
    throw new Error('Serialised content contains a backslash; switch sqlJson to dollar-quoting.');
  }
  return `'${json.replace(/'/g, "''")}'::jsonb`;
}

const seedLines = Object.entries(rows).map(
  ([key, value]) => `  ('${key}', ${sqlJson(value)}, (extract(epoch from now()) * 1000)::bigint)`,
);
const seed = `insert into public.site_content ("key", "value", "updatedAt") values\n${seedLines.join(',\n')}\non conflict ("key") do nothing;\n`;

const sql = DDL + seed;

// --- self-verification: parse every emitted literal back and compare.
for (const [key, value] of Object.entries(rows)) {
  const json = JSON.stringify(value);
  const literal = sqlJson(value);
  const roundTripped = JSON.parse(literal.slice(1, -"'::jsonb".length).replace(/''/g, "'"));
  if (JSON.stringify(roundTripped) !== json) {
    throw new Error(`Seed round-trip mismatch for key "${key}"`);
  }
  console.log(`seed ok: ${key} (${json.length} bytes)`);
}

mkdirSync(join(root, 'supabase'), { recursive: true });
const out = join(root, 'supabase/phase2.sql');
writeFileSync(out, sql);
console.log(`wrote ${out} (${sql.length} bytes)`);

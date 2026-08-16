-- ============================================================================
--  Al Ramsat — Talent Dashboard
--  Supabase schema: shared workspace persistence
-- ----------------------------------------------------------------------------
--  Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
--  It is idempotent: running it again is safe.
--
--  What it creates
--    public.workspace         one row per workspace; holds the shared state blob
--    public.workspace_audit   append-only trail of who saved what, and when
--    workspace_guard()        server-side stale-write guard (optimistic locking)
--    RLS + policies           row level security is ENABLED on both tables
-- ============================================================================


-- ============================================================================
--  1. TABLES
-- ============================================================================

-- The shared workspace. In normal use there is exactly one row,
-- keyed 'alramsat-main' (see SUPABASE_CONFIG.workspaceKey in the dashboard).
create table if not exists public.workspace (
  workspace_key  text        primary key,
  workspace_data jsonb       not null default '{}'::jsonb,
  version        integer     not null default 0,
  updated_at     timestamptz not null default now(),
  updated_by     text,
  created_at     timestamptz not null default now()
);

comment on table  public.workspace                is 'Shared dashboard workspace: screening statuses, filters, scoring weights and the refresh log.';
comment on column public.workspace.version        is 'Monotonic counter. Every successful save increments it by 1. Used for optimistic concurrency control.';
comment on column public.workspace.updated_by     is 'Supabase Auth email when signed in, otherwise a random per-browser device label.';
comment on column public.workspace.workspace_data is 'Opaque JSON written by the dashboard. Candidate records are NOT stored here by default — the Google Sheet remains the source of truth for them.';

-- Append-only audit trail. Never holds workspace contents, only metadata.
create table if not exists public.workspace_audit (
  id                bigint generated always as identity primary key,
  workspace_key     text        not null,
  action            text        not null,
  user_id           uuid,
  actor             text,
  workspace_version integer,
  created_at        timestamptz not null default now()
);

comment on table public.workspace_audit is 'Who saved the workspace, when, and to which version. Metadata only — no candidate data.';

create index if not exists workspace_audit_key_time_idx
  on public.workspace_audit (workspace_key, created_at desc);

create index if not exists workspace_updated_at_idx
  on public.workspace (updated_at desc);


-- ============================================================================
--  2. SERVER-SIDE STALE-WRITE GUARD
-- ----------------------------------------------------------------------------
--  The browser already refuses to save over a newer version, but two browsers
--  can still read the same version and race. This trigger closes that window:
--  an UPDATE whose incoming version is not strictly greater than the stored
--  version is rejected. The client maps this error onto its "another user
--  updated the workspace" message.
-- ============================================================================

create or replace function public.workspace_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.version <= old.version then
    raise exception
      'stale write: incoming version % is not newer than stored version %',
      new.version, old.version
      using errcode = '40001';   -- serialization_failure
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists workspace_guard_trg on public.workspace;
create trigger workspace_guard_trg
  before update on public.workspace
  for each row execute function public.workspace_guard();


-- ============================================================================
--  3. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
--  RLS is ENABLED on both tables. It is never disabled to "make things work".
--  The dashboard uses only the publishable (anon) key, which is safe to ship
--  in the browser; the service_role key must never appear in the HTML.
-- ============================================================================

alter table public.workspace       enable row level security;
alter table public.workspace_audit enable row level security;


-- ----------------------------------------------------------------------------
--  STAGE 1 — CURRENT POLICY SET  ("shared link" mode)
-- ----------------------------------------------------------------------------
--  ⚠ TEMPORARY AND DELIBERATE. Anyone holding the publishable key can read and
--    write the single workspace row. This matches how the dashboard is used
--    today: an internal, unlisted link shared inside the recruitment team, with
--    no login screen.
--
--  What this DOES protect:
--    · No table other than `workspace` / `workspace_audit` is reachable.
--    · Audit rows cannot be edited or deleted by the browser key.
--    · The stale-write trigger prevents silent overwrites.
--    · No candidate records are stored in the cloud by default.
--
--  What this does NOT protect:
--    · Anyone who obtains the page URL obtains the publishable key, and can
--      therefore read and overwrite the shared screening statuses.
--
--  ⇒ BEFORE PRODUCTION / BEFORE THE LINK LEAVES THE TEAM: run STAGE 2 below.
-- ----------------------------------------------------------------------------

drop policy if exists ws_anon_select on public.workspace;
drop policy if exists ws_anon_insert on public.workspace;
drop policy if exists ws_anon_update on public.workspace;
drop policy if exists ws_anon_delete on public.workspace;
drop policy if exists wsa_anon_insert on public.workspace_audit;
drop policy if exists wsa_anon_select on public.workspace_audit;

create policy ws_anon_select on public.workspace
  for select to anon, authenticated
  using (true);

create policy ws_anon_insert on public.workspace
  for insert to anon, authenticated
  with check (workspace_key = 'alramsat-main');

create policy ws_anon_update on public.workspace
  for update to anon, authenticated
  using (workspace_key = 'alramsat-main')
  with check (workspace_key = 'alramsat-main');

create policy ws_anon_delete on public.workspace
  for delete to anon, authenticated
  using (workspace_key = 'alramsat-main');

-- Audit is append-only from the browser: insert and read, never update/delete.
create policy wsa_anon_insert on public.workspace_audit
  for insert to anon, authenticated
  with check (workspace_key = 'alramsat-main');

create policy wsa_anon_select on public.workspace_audit
  for select to anon, authenticated
  using (true);


-- ----------------------------------------------------------------------------
--  STAGE 2 — PRODUCTION POLICY SET  (login required)
-- ----------------------------------------------------------------------------
--  Enable Supabase Auth (Dashboard → Authentication), invite the recruitment
--  team, then uncomment and run everything below. It revokes anonymous access
--  entirely; only signed-in users can read or write the workspace.
--  The dashboard needs no code change — supabase-js sends the session token
--  automatically once a user is signed in.
-- ----------------------------------------------------------------------------

-- drop policy if exists ws_anon_select  on public.workspace;
-- drop policy if exists ws_anon_insert  on public.workspace;
-- drop policy if exists ws_anon_update  on public.workspace;
-- drop policy if exists ws_anon_delete  on public.workspace;
-- drop policy if exists wsa_anon_insert on public.workspace_audit;
-- drop policy if exists wsa_anon_select on public.workspace_audit;
--
-- create policy ws_auth_select on public.workspace
--   for select to authenticated using (true);
-- create policy ws_auth_insert on public.workspace
--   for insert to authenticated with check (workspace_key = 'alramsat-main');
-- create policy ws_auth_update on public.workspace
--   for update to authenticated
--   using (workspace_key = 'alramsat-main')
--   with check (workspace_key = 'alramsat-main');
-- -- Deleting the shared workspace stays an admin action (SQL editor only):
-- --   no delete policy is granted to `authenticated`.
-- create policy wsa_auth_insert on public.workspace_audit
--   for insert to authenticated with check (workspace_key = 'alramsat-main');
-- create policy wsa_auth_select on public.workspace_audit
--   for select to authenticated using (true);


-- ============================================================================
--  4. REALTIME
-- ----------------------------------------------------------------------------
--  Lets an open dashboard learn that someone else saved a newer version.
--  The dashboard only shows a banner — it never auto-overwrites local work.
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename  = 'workspace'
  ) then
    alter publication supabase_realtime add table public.workspace;
  end if;
end $$;

-- Realtime needs the full row on UPDATE so the version is readable by subscribers.
alter table public.workspace replica identity full;


-- ============================================================================
--  5. VERIFY
-- ============================================================================
--  select workspace_key, version, updated_by, updated_at from public.workspace;
--  select actor, workspace_version, created_at from public.workspace_audit
--    order by created_at desc limit 20;

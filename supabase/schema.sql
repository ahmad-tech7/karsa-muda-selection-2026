create extension if not exists pgcrypto;

-- ============================================
-- ENUM STATUS PESERTA
-- ============================================

do $$
begin
  create type participant_status as enum (
    'BELUM_DIUMUMKAN',
    'LOLOS',
    'TIDAK_LOLOS',
    'DAFTAR_TUNGGU',
    'LOLOS_TAHAP_BERIKUTNYA',
    'FINALIS',
    'TERPILIH',
    'TIDAK_TERPILIH'
  );
exception
  when duplicate_object then null;
end $$;


do $$
begin
  create type stage_status as enum (
    'AKAN_DATANG',
    'BERLANGSUNG',
    'SELESAI'
  );
exception
  when duplicate_object then null;
end $$;


-- ============================================
-- TABLE PESERTA
-- ============================================

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  participant_number text
    unique
    not null,

  class text not null,

  status participant_status
    not null
    default 'BELUM_DIUMUMKAN',

  stage text
    not null
    default 'Pendaftaran',

  message text,

  is_published boolean
    not null
    default false,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================
-- ADMIN PROFILE
-- ============================================

create table if not exists public.admin_profiles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  email text not null,

  display_name text,

  role text
    not null
    default 'admin',

  created_at timestamptz
    not null
    default now()
);


-- ============================================
-- TIMELINE
-- ============================================

create table if not exists public.selection_stages (
  id uuid primary key default gen_random_uuid(),

  order_number integer
    not null,

  name text not null,

  description text,

  date date,

  status stage_status
    not null
    default 'AKAN_DATANG',

  created_at timestamptz
    not null
    default now()
);


-- ============================================
-- PENGUMUMAN
-- ============================================

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  content text not null,

  is_published boolean
    not null
    default false,

  published_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================
-- ACTIVITY LOG
-- ============================================

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),

  admin_id uuid
    references auth.users(id)
    on delete set null,

  action text not null,

  target_type text,

  target_id uuid,

  description text,

  created_at timestamptz
    not null
    default now()
);


-- ============================================
-- UPDATED_AT FUNCTION
-- ============================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();

  return new;
end;
$$;


drop trigger if exists participants_updated_at
on public.participants;

create trigger participants_updated_at
before update on public.participants
for each row
execute function public.set_updated_at();


drop trigger if exists announcements_updated_at
on public.announcements;

create trigger announcements_updated_at
before update on public.announcements
for each row
execute function public.set_updated_at();


-- ============================================
-- ADMIN CHECK FUNCTION
-- ============================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
  );
$$;


-- ============================================
-- ENABLE RLS
-- ============================================

alter table public.participants
enable row level security;

alter table public.admin_profiles
enable row level security;

alter table public.selection_stages
enable row level security;

alter table public.announcements
enable row level security;

alter table public.activity_logs
enable row level security;


-- ============================================
-- PESERTA
-- ============================================

drop policy if exists
"public_can_view_published_participants"
on public.participants;

create policy
"public_can_view_published_participants"

on public.participants

for select

to anon, authenticated

using (
  is_published = true
);


drop policy if exists
"admins_can_view_all_participants"
on public.participants;

create policy
"admins_can_view_all_participants"

on public.participants

for select

to authenticated

using (
  public.is_admin()
);


drop policy if exists
"admins_can_insert_participants"
on public.participants;

create policy
"admins_can_insert_participants"

on public.participants

for insert

to authenticated

with check (
  public.is_admin()
);


drop policy if exists
"admins_can_update_participants"
on public.participants;

create policy
"admins_can_update_participants"

on public.participants

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


drop policy if exists
"admins_can_delete_participants"
on public.participants;

create policy
"admins_can_delete_participants"

on public.participants

for delete

to authenticated

using (
  public.is_admin()
);


-- ============================================
-- ADMIN PROFILE
-- ============================================

drop policy if exists
"admins_can_view_admin_profiles"
on public.admin_profiles;

create policy
"admins_can_view_admin_profiles"

on public.admin_profiles

for select

to authenticated

using (
  user_id = auth.uid()
  or public.is_admin()
);


-- ============================================
-- TIMELINE
-- ============================================

drop policy if exists
"public_can_view_timeline"
on public.selection_stages;

create policy
"public_can_view_timeline"

on public.selection_stages

for select

to anon, authenticated

using (true);


drop policy if exists
"admins_can_insert_timeline"
on public.selection_stages;

create policy
"admins_can_insert_timeline"

on public.selection_stages

for insert

to authenticated

with check (
  public.is_admin()
);


drop policy if exists
"admins_can_update_timeline"
on public.selection_stages;

create policy
"admins_can_update_timeline"

on public.selection_stages

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


-- ============================================
-- ANNOUNCEMENTS
-- ============================================

drop policy if exists
"public_can_view_published_announcements"
on public.announcements;

create policy
"public_can_view_published_announcements"

on public.announcements

for select

to anon, authenticated

using (
  is_published = true
);


drop policy if exists
"admins_can_view_all_announcements"
on public.announcements;

create policy
"admins_can_view_all_announcements"

on public.announcements

for select

to authenticated

using (
  public.is_admin()
);


drop policy if exists
"admins_can_insert_announcements"
on public.announcements;

create policy
"admins_can_insert_announcements"

on public.announcements

for insert

to authenticated

with check (
  public.is_admin()
);


drop policy if exists
"admins_can_update_announcements"
on public.announcements;

create policy
"admins_can_update_announcements"

on public.announcements

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


drop policy if exists
"admins_can_delete_announcements"
on public.announcements;

create policy
"admins_can_delete_announcements"

on public.announcements

for delete

to authenticated

using (
  public.is_admin()
);


-- ============================================
-- ACTIVITY LOG
-- ============================================

drop policy if exists
"admins_can_view_activity_logs"
on public.activity_logs;

create policy
"admins_can_view_activity_logs"

on public.activity_logs

for select

to authenticated

using (
  public.is_admin()
);


drop policy if exists
"admins_can_insert_activity_logs"
on public.activity_logs;

create policy
"admins_can_insert_activity_logs"

on public.activity_logs

for insert

to authenticated

with check (
  public.is_admin()
);

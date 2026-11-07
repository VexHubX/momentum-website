-- VEXHUB database schema. Run in Supabase SQL Editor as project owner.
-- Never disable RLS or use a service-role key in browser code.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  description text not null check (char_length(description) between 1 and 500),
  category text not null check (char_length(category) between 1 and 40),
  tags text[] not null default '{}',
  code text not null check (char_length(code) between 1 and 100000),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists scripts_published_updated_idx on public.scripts (is_published, updated_at desc);
create or replace function public.vexhub_set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists vexhub_scripts_updated_at on public.scripts;
create trigger vexhub_scripts_updated_at before update on public.scripts for each row execute function public.vexhub_set_updated_at();
alter table public.admin_users enable row level security;
alter table public.scripts enable row level security;
drop policy if exists "Admins can read own membership" on public.admin_users;
create policy "Admins can read own membership" on public.admin_users for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Anyone can read published scripts" on public.scripts;
create policy "Anyone can read published scripts" on public.scripts for select to anon, authenticated using (is_published = true);
drop policy if exists "Admins can read all scripts" on public.scripts;
create policy "Admins can read all scripts" on public.scripts for select to authenticated using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
drop policy if exists "Admins can insert scripts" on public.scripts;
create policy "Admins can insert scripts" on public.scripts for insert to authenticated with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
drop policy if exists "Admins can update scripts" on public.scripts;
create policy "Admins can update scripts" on public.scripts for update to authenticated using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
drop policy if exists "Admins can delete scripts" on public.scripts;
create policy "Admins can delete scripts" on public.scripts for delete to authenticated using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
-- Do not create browser write policies on admin_users. Manage allowlist through trusted owner access.

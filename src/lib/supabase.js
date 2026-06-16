import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Copy .env.example to .env.local and fill in your credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
  ============================================================
  SUPABASE SETUP SQL — run this in Supabase SQL Editor
  Dashboard → SQL Editor → New query → paste → Run
  ============================================================

  -- ── 1. TICKETS TABLE ──────────────────────────────────────────
  create table if not exists public.tickets (
    id                uuid primary key default gen_random_uuid(),
    ticket_number     text unique not null,
    staff_name        text not null,
    department        text not null,
    contact           text,
    category          text not null,
    description       text not null,
    priority          text not null default 'Normal' check (priority in ('Normal','Urgent')),
    status            text not null default 'Open' check (status in ('Open','In Progress','Resolved')),
    assigned_to       uuid references auth.users(id),
    assigned_to_name  text,
    resolution_note   text,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
  );

  -- Auto-update updated_at
  create or replace function update_updated_at()
  returns trigger as $$
  begin new.updated_at = now(); return new; end;
  $$ language plpgsql;

  drop trigger if exists tickets_updated_at on public.tickets;
  create trigger tickets_updated_at
    before update on public.tickets
    for each row execute function update_updated_at();

  -- Auto-generate ticket numbers KH-0001, KH-0002...
  create sequence if not exists ticket_seq start 1;

  create or replace function generate_ticket_number()
  returns trigger as $$
  begin
    new.ticket_number := 'KH-' || lpad(nextval('ticket_seq')::text, 4, '0');
    return new;
  end;
  $$ language plpgsql;

  drop trigger if exists tickets_number on public.tickets;
  create trigger tickets_number
    before insert on public.tickets
    for each row execute function generate_ticket_number();

  -- ── 2. IT USERS TABLE ──────────────────────────────────────────
  create table if not exists public.it_users (
    id            uuid primary key references auth.users(id),
    name          text not null,
    display_name  text,
    role          text not null default 'technician' check (role in ('technician','admin')),
    avatar_url    text,
    created_at    timestamptz not null default now()
  );

  -- Add columns if upgrading from earlier version
  alter table public.it_users add column if not exists display_name text;
  alter table public.it_users add column if not exists avatar_url   text;
  alter table public.tickets  add column if not exists assigned_to_name text;

  -- ── 3. ROW LEVEL SECURITY ───────────────────────────────────────
  alter table public.tickets  enable row level security;
  alter table public.it_users enable row level security;

  -- Tickets: anyone can insert and read (staff submit without login)
  drop policy if exists "Anyone can submit a ticket" on public.tickets;
  create policy "Anyone can submit a ticket"
    on public.tickets for insert with check (true);

  drop policy if exists "Anyone can read tickets" on public.tickets;
  create policy "Anyone can read tickets"
    on public.tickets for select using (true);

  -- Tickets: only IT staff can update
  drop policy if exists "IT staff can update tickets" on public.tickets;
  create policy "IT staff can update tickets"
    on public.tickets for update using (auth.role() = 'authenticated');

  -- IT users: read own profile
  drop policy if exists "IT users can read own profile" on public.it_users;
  create policy "IT users can read own profile"
    on public.it_users for select using (true);

  -- IT users: update own profile only
  drop policy if exists "IT users can update own profile" on public.it_users;
  create policy "IT users can update own profile"
    on public.it_users for update using (auth.uid() = id);

  -- ── 4. STORAGE BUCKET FOR AVATARS ──────────────────────────────
  -- Run this separately in SQL Editor:

  insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

  drop policy if exists "Avatar images are publicly accessible" on storage.objects;
  create policy "Avatar images are publicly accessible"
    on storage.objects for select using (bucket_id = 'avatars');

  drop policy if exists "IT staff can upload avatars" on storage.objects;
  create policy "IT staff can upload avatars"
    on storage.objects for insert
    with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

  drop policy if exists "IT staff can update their avatar" on storage.objects;
  create policy "IT staff can update their avatar"
    on storage.objects for update
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

  -- ── 5. AFTER CREATING AN IT STAFF ACCOUNT IN AUTH ──────────────
  -- Go to Authentication → Users → Add user, then run:
  --
  -- insert into public.it_users (id, name, display_name, role)
  -- values ('<paste-uuid-here>', 'Full Name', 'Display Name', 'admin');
  --
  -- Use 'technician' for regular IT staff.
  ============================================================
*/

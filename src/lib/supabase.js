import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Copy .env.example to .env.local and fill in your credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
  ============================================================
  SUPABASE SETUP — run this SQL in your Supabase SQL editor
  Dashboard → SQL Editor → New query → paste → Run
  ============================================================

  -- 1. TICKETS TABLE (public — no auth needed to submit)
  create table public.tickets (
    id            uuid primary key default gen_random_uuid(),
    ticket_number text unique not null,
    staff_name    text not null,
    department    text not null,
    contact       text,
    category      text not null,
    description   text not null,
    priority      text not null default 'Normal' check (priority in ('Normal','Urgent')),
    status        text not null default 'Open' check (status in ('Open','In Progress','Resolved')),
    assigned_to   uuid references auth.users(id),
    resolution_note text,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
  );

  -- Auto-update updated_at on row change
  create or replace function update_updated_at()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$ language plpgsql;

  create trigger tickets_updated_at
    before update on public.tickets
    for each row execute function update_updated_at();

  -- Auto-generate ticket numbers like KH-0042
  create sequence ticket_seq start 1;

  create or replace function generate_ticket_number()
  returns trigger as $$
  begin
    new.ticket_number := 'KH-' || lpad(nextval('ticket_seq')::text, 4, '0');
    return new;
  end;
  $$ language plpgsql;

  create trigger tickets_number
    before insert on public.tickets
    for each row execute function generate_ticket_number();

  -- 2. ROW LEVEL SECURITY
  alter table public.tickets enable row level security;

  -- Anyone can insert (staff submit without login)
  create policy "Anyone can submit a ticket"
    on public.tickets for insert
    with check (true);

  -- Anyone can read their own ticket by ticket_number (for tracking)
  create policy "Anyone can read tickets"
    on public.tickets for select
    using (true);

  -- Only authenticated users (IT staff) can update
  create policy "IT staff can update tickets"
    on public.tickets for update
    using (auth.role() = 'authenticated');

  -- 3. IT USERS TABLE (roles)
  create table public.it_users (
    id    uuid primary key references auth.users(id),
    name  text not null,
    role  text not null default 'technician' check (role in ('technician','admin'))
  );

  alter table public.it_users enable row level security;

  create policy "IT users can read own profile"
    on public.it_users for select
    using (auth.uid() = id);

  -- 4. After creating IT staff in Supabase Auth dashboard,
  --    insert their profile:
  --    insert into public.it_users (id, name, role)
  --    values ('<auth-user-uuid>', 'Your Name', 'admin');

  ============================================================
*/

-- Exécuter dans Supabase SQL Editor

create table if not exists proposals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users not null,
  public_token    uuid unique default gen_random_uuid(),
  title           text not null,
  client_name     text not null,
  client_email    text,
  amount          numeric(10,2) not null,
  currency        text default 'EUR',
  status          text default 'draft' check (status in ('draft','sent','signed','paid')),
  content         jsonb,
  signature_data  text,
  stripe_session_id text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Enable Row Level Security
alter table proposals enable row level security;

-- Owner can do everything on their proposals
create policy "Owner full access"
  on proposals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Anyone can read a proposal by its public_token (for public page)
create policy "Public read by token"
  on proposals
  for select
  using (true);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger proposals_updated_at
  before update on proposals
  for each row execute function update_updated_at();

-- FitVerse waitlist table.
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,   -- unique => duplicate signups fail with 23505
  source      text default 'website',
  ip_hash     text,                   -- salted SHA-256, never the raw IP
  created_at  timestamptz not null default now()
);

-- Case-insensitive uniqueness safety net. The API lowercases emails before
-- insert, but this stops Foo@x.com slipping past if anything ever writes direct.
create unique index if not exists waitlist_email_lower_idx
  on public.waitlist (lower(email));

-- Lock the table down: the API talks to it with the service_role key, which
-- bypasses RLS. With RLS on and no policies, the public anon key can neither
-- read nor write it — so nobody can scrape your signup list from the browser.
alter table public.waitlist enable row level security;

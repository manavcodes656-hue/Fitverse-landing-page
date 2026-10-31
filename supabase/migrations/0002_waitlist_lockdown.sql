-- Lock down public.waitlist. Safe to run more than once.
--
-- The API talks to this table only with the service_role key, which bypasses
-- row level security. Everything below makes sure the public anon and
-- authenticated roles can do nothing at all with it.
--
-- To apply: Supabase Dashboard -> SQL Editor -> New query -> paste this file ->
-- Run. (Or, with the Supabase CLI linked to your project: `supabase db push`.)
--
-- If the unique index fails with "could not create unique index", two rows
-- already share an email that differs only by case. Delete or merge the
-- duplicates, then run this file again.

-- 1. Row level security on, with no public policies.
alter table public.waitlist enable row level security;

-- Remove any policy that was added by hand in the dashboard.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'waitlist' loop
    execute format('drop policy %I on public.waitlist', p.policyname);
  end loop;
end $$;

-- 2. No direct table privileges for the browser-facing roles.
revoke all on table public.waitlist from anon, authenticated;

-- 3. One signup per email, whatever its capitalisation.
create unique index if not exists waitlist_email_lower_idx
  on public.waitlist (lower(email));

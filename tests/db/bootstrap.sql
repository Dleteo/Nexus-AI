-- Disposable CI database only. This is NOT a production Supabase bootstrap.
-- Recreate the minimum Supabase Auth surface required by our migrations.
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid()
returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to authenticated;
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on auth.users to service_role;
alter default privileges in schema public grant all on tables to service_role;
grant execute on function auth.uid() to authenticated;

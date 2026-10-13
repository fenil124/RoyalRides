-- ==============================================================================
-- ROYALRIDES TRAVELS - SUPABASE REALTIME PUBLICATIONS MIGRATION
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor) to enable
-- live automatic synchronization across all public and admin views.
-- ==============================================================================

-- 1. SET REPLICA IDENTITY FULL
-- Guarantees that UPDATE and DELETE payloads contain complete record fields
alter table if exists public.cars replica identity full;
alter table if exists public.routes replica identity full;
alter table if exists public.route_prices replica identity full;
alter table if exists public.destinations replica identity full;
alter table if exists public.reviews replica identity full;
alter table if exists public.homepage_sections replica identity full;
alter table if exists public.site_settings replica identity full;
alter table if exists public.inquiries replica identity full;

-- 2. ADD ALL TABLES TO supabase_realtime PUBLICATION
-- Safely adds tables only if not already member of the publication
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'cars',
    'routes',
    'route_prices',
    'destinations',
    'reviews',
    'homepage_sections',
    'site_settings',
    'inquiries'
  ])
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
      raise notice 'Added table % to supabase_realtime publication', tbl;
    else
      raise notice 'Table % is already in supabase_realtime publication', tbl;
    end if;
  end loop;
end;
$$;

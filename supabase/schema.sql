-- ==============================================================================
-- ROYALRIDES TRAVELS - CANONICAL DATABASE SCHEMA & SECURITY MIGRATION
-- File: supabase/01_schema_and_policies.sql
-- 
-- Description:
--   Primary canonical migration for RoyalRides Travels. Sets up all database
--   extensions, tables, constraints, foreign keys, triggers, strict role-based
--   Row Level Security (RLS) policies, storage bucket policies, and Realtime publications.
--
-- Execution:
--   Run this file FIRST in Supabase SQL Editor (Dashboard > SQL Editor) on fresh
--   or existing production databases. Idempotent and safe to rerun.
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (Linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text default 'Customer',
  avatar_url text,
  role text not null default 'customer' check (role in ('admin', 'customer', 'staff')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure default and constraints on existing instances
alter table public.profiles alter column role set default 'customer';

-- Secure Auth Signup Trigger:
-- Automatically provisions a profile row on signup with default role 'customer'.
-- NEVER assigns 'admin' automatically. Administrator roles must be provisioned explicitly.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'customer' -- SECURE: New users are always standard customers
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Secure Helper Function: Check if the calling user is an authorized administrator
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 3. CARS (Agency Fleet)
create table if not exists public.cars (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  car_type text not null, -- MPV, Sedan, Luxury Van, SUV
  seating_capacity text not null, -- e.g. "7+1 Seating", "4+1 Seating"
  image_url text not null,
  hero_image_url text,
  is_active boolean default true,
  is_hero_featured boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cars add column if not exists hero_image_url text;

-- 4. ROUTES (Fixed Price & Intercity Routes)
create table if not exists public.routes (
  id uuid primary key default uuid_generate_v4(),
  origin text not null,
  destination text not null,
  image_url text,
  is_active boolean default true,
  is_featured boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. ROUTE PRICES (Vehicle-specific pricing per route)
create table if not exists public.route_prices (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid not null references public.routes(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  price numeric(10,2), -- Nullable: when null, shows "Get a Quote"
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_route_car unique (route_id, car_id)
);

-- 6. DESTINATIONS
create table if not exists public.destinations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  image_url text not null,
  is_published boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. REVIEWS
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  review_text text not null,
  avatar_url text,
  is_published boolean default true,
  is_demo boolean default false,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. INQUIRIES
create table if not exists public.inquiries (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  phone text not null,
  pickup_location text not null,
  destination text not null,
  travel_date date not null,
  travel_time text,
  car_name text,
  car_id uuid references public.cars(id) on delete set null,
  passengers integer default 1,
  trip_type text default 'one-way' check (trip_type in ('one-way', 'round-trip')),
  message text,
  status text default 'New' check (status in ('New', 'Contacted', 'Quotation Given', 'Confirmed', 'Completed', 'Cancelled')),
  internal_notes text,
  agreed_price numeric(10,2),
  source text default 'website' check (source in ('website', 'phone', 'whatsapp')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. SITE SETTINGS
create table if not exists public.site_settings (
  id text primary key default 'default',
  agency_name text default 'RoyalRides Travels',
  tagline text default 'Comfortable Rides for Every Journey',
  phone text default '+91 98765 43210',
  whatsapp text default '+91 98765 43210',
  email text default 'contact@royalridestravels.com',
  address text default 'Ring Road, Surat, Gujarat 395002',
  logo_url text,
  facebook_url text,
  instagram_url text,
  youtube_url text,
  cta_text text default 'Book Your Ride',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. HOMEPAGE SECTIONS CONTENT
create table if not exists public.homepage_sections (
  id text primary key,
  title text,
  subtitle text,
  badge text,
  body text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11. INDEXES FOR QUERY & RLS PERFORMANCE
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_inquiries_travel_date on public.inquiries(travel_date desc);
create index if not exists idx_inquiries_created_at on public.inquiries(created_at desc);
create index if not exists idx_cars_display_order on public.cars(display_order);
create index if not exists idx_routes_display_order on public.routes(display_order);
create index if not exists idx_destinations_display_order on public.destinations(display_order);
create index if not exists idx_reviews_display_order on public.reviews(display_order);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.routes enable row level security;
alter table public.route_prices enable row level security;
alter table public.destinations enable row level security;
alter table public.reviews enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.homepage_sections enable row level security;

-- Drop legacy/broad policies
drop policy if exists "Public can view active cars" on public.cars;
drop policy if exists "Admins can view all cars" on public.cars;
drop policy if exists "Admins full access cars" on public.cars;
drop policy if exists "Admins can insert cars" on public.cars;
drop policy if exists "Admins can update cars" on public.cars;
drop policy if exists "Admins can delete cars" on public.cars;

drop policy if exists "Public can view active routes" on public.routes;
drop policy if exists "Admins can view all routes" on public.routes;
drop policy if exists "Admins full access routes" on public.routes;
drop policy if exists "Admins can insert routes" on public.routes;
drop policy if exists "Admins can update routes" on public.routes;
drop policy if exists "Admins can delete routes" on public.routes;

drop policy if exists "Public can view route prices" on public.route_prices;
drop policy if exists "Admins full access route_prices" on public.route_prices;
drop policy if exists "Admins can insert route prices" on public.route_prices;
drop policy if exists "Admins can update route prices" on public.route_prices;
drop policy if exists "Admins can delete route prices" on public.route_prices;

drop policy if exists "Public can view published destinations" on public.destinations;
drop policy if exists "Admins can view all destinations" on public.destinations;
drop policy if exists "Admins full access destinations" on public.destinations;
drop policy if exists "Admins can insert destinations" on public.destinations;
drop policy if exists "Admins can update destinations" on public.destinations;
drop policy if exists "Admins can delete destinations" on public.destinations;

drop policy if exists "Public can view published reviews" on public.reviews;
drop policy if exists "Admins can view all reviews" on public.reviews;
drop policy if exists "Admins full access reviews" on public.reviews;
drop policy if exists "Admins can insert reviews" on public.reviews;
drop policy if exists "Admins can update reviews" on public.reviews;
drop policy if exists "Admins can delete reviews" on public.reviews;

drop policy if exists "Public can view site settings" on public.site_settings;
drop policy if exists "Admins full access site_settings" on public.site_settings;
drop policy if exists "Admins can update site settings" on public.site_settings;

drop policy if exists "Public can view homepage sections" on public.homepage_sections;
drop policy if exists "Admins full access homepage_sections" on public.homepage_sections;
drop policy if exists "Admins can update homepage sections" on public.homepage_sections;

drop policy if exists "Public can insert inquiries" on public.inquiries;
drop policy if exists "Public can submit inquiries" on public.inquiries;
drop policy if exists "Admins full access inquiries" on public.inquiries;
drop policy if exists "Admins can view all inquiries" on public.inquiries;
drop policy if exists "Admins can insert inquiries" on public.inquiries;
drop policy if exists "Admins can update inquiries" on public.inquiries;
drop policy if exists "Admins can delete inquiries" on public.inquiries;

drop policy if exists "Admins full access profiles" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins manage all profiles" on public.profiles;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Users can view only their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- Users can update only their own profile (name, avatar), but CANNOT elevate their own role
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (role = 'customer' or public.is_admin())
  );

-- Administrators can view and manage all profiles
create policy "Admins manage all profiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- B. PUBLIC BROWSABLE CONTENT POLICIES (Cars, Routes, Prices, Destinations, Reviews, Content)
-- ------------------------------------------------------------------------------
-- Cars
create policy "Public can view active cars"
  on public.cars
  for select
  using (is_active = true);

create policy "Admins can view all cars"
  on public.cars
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert cars"
  on public.cars
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update cars"
  on public.cars
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete cars"
  on public.cars
  for delete
  to authenticated
  using (public.is_admin());

-- Routes
create policy "Public can view active routes"
  on public.routes
  for select
  using (is_active = true);

create policy "Admins can view all routes"
  on public.routes
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert routes"
  on public.routes
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update routes"
  on public.routes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete routes"
  on public.routes
  for delete
  to authenticated
  using (public.is_admin());

-- Route Prices
create policy "Public can view route prices"
  on public.route_prices
  for select
  using (true);

create policy "Admins can insert route prices"
  on public.route_prices
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update route prices"
  on public.route_prices
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete route prices"
  on public.route_prices
  for delete
  to authenticated
  using (public.is_admin());

-- Destinations
create policy "Public can view published destinations"
  on public.destinations
  for select
  using (is_published = true);

create policy "Admins can view all destinations"
  on public.destinations
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert destinations"
  on public.destinations
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update destinations"
  on public.destinations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete destinations"
  on public.destinations
  for delete
  to authenticated
  using (public.is_admin());

-- Reviews
create policy "Public can view published reviews"
  on public.reviews
  for select
  using (is_published = true);

create policy "Admins can view all reviews"
  on public.reviews
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert reviews"
  on public.reviews
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update reviews"
  on public.reviews
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete reviews"
  on public.reviews
  for delete
  to authenticated
  using (public.is_admin());

-- Site Settings
create policy "Public can view site settings"
  on public.site_settings
  for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Homepage Sections
create policy "Public can view homepage sections"
  on public.homepage_sections
  for select
  using (true);

create policy "Admins can update homepage sections"
  on public.homepage_sections
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- C. CUSTOMER INQUIRIES POLICIES (Protected Customer Data)
-- ------------------------------------------------------------------------------
-- Public visitors can submit an inquiry:
-- - status must be 'New'
-- - internal staff notes MUST be null
-- - agreed price MUST be null
create policy "Public can submit inquiries"
  on public.inquiries
  for insert
  with check (
    status = 'New'
    and internal_notes is null
    and agreed_price is null
  );

-- PUBLIC SELECT IS INTENTIONALLY OMITTED:
-- Public visitors have ZERO read access to inquiries.

-- Only verified administrators can view, update, delete, or manage inquiries
create policy "Admins can view all inquiries"
  on public.inquiries
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update inquiries"
  on public.inquiries
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete inquiries"
  on public.inquiries
  for delete
  to authenticated
  using (public.is_admin());

create policy "Admins can insert inquiries"
  on public.inquiries
  for insert
  to authenticated
  with check (public.is_admin());

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (travel-assets)
-- ==============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'travel-assets',
  'travel-assets',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

drop policy if exists "Public Access travel-assets" on storage.objects;
drop policy if exists "Public can view travel-assets" on storage.objects;
create policy "Public can view travel-assets"
  on storage.objects
  for select
  using (bucket_id = 'travel-assets');

drop policy if exists "Admin Upload travel-assets" on storage.objects;
drop policy if exists "Admins can upload travel-assets" on storage.objects;
create policy "Admins can upload travel-assets"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'travel-assets' and public.is_admin());

drop policy if exists "Admin Update travel-assets" on storage.objects;
drop policy if exists "Admins can update travel-assets" on storage.objects;
create policy "Admins can update travel-assets"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'travel-assets' and public.is_admin())
  with check (bucket_id = 'travel-assets' and public.is_admin());

drop policy if exists "Admin Delete travel-assets" on storage.objects;
drop policy if exists "Admins can delete travel-assets" on storage.objects;
create policy "Admins can delete travel-assets"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'travel-assets' and public.is_admin());

-- ==============================================================================
-- REALTIME CONFIGURATION
-- ==============================================================================

alter table public.cars replica identity full;
alter table public.routes replica identity full;
alter table public.route_prices replica identity full;
alter table public.destinations replica identity full;
alter table public.reviews replica identity full;
alter table public.homepage_sections replica identity full;
alter table public.site_settings replica identity full;
alter table public.inquiries replica identity full;

-- Safe idempotent addition to supabase_realtime publication
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
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
      raise notice 'Added table % to supabase_realtime publication', tbl;
    end if;
  end loop;
end;
$$;

-- 8. REFRESH SCHEMA CACHE
-- Informs PostgREST to reload its cache so all newly created tables/columns are live immediately
notify pgrst, 'reload schema';

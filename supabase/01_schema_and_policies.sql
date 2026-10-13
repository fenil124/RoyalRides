-- ==============================================================================
-- ROYALRIDES TRAVELS - SUPABASE COMPREHENSIVE SCHEMA & SECURITY SETUP
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (Linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text default 'Admin',
  avatar_url text,
  role text default 'admin',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to automatically create a profile record when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', 'Admin'), 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

-- Ensure column exists if table was previously created
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

-- Drop existing policies if re-running
drop policy if exists "Public can view active cars" on public.cars;
drop policy if exists "Public can view active routes" on public.routes;
drop policy if exists "Public can view route prices" on public.route_prices;
drop policy if exists "Public can view published destinations" on public.destinations;
drop policy if exists "Public can view published reviews" on public.reviews;
drop policy if exists "Public can view site settings" on public.site_settings;
drop policy if exists "Public can view homepage sections" on public.homepage_sections;
drop policy if exists "Public can insert inquiries" on public.inquiries;

drop policy if exists "Admins full access profiles" on public.profiles;
drop policy if exists "Admins full access cars" on public.cars;
drop policy if exists "Admins full access routes" on public.routes;
drop policy if exists "Admins full access route_prices" on public.route_prices;
drop policy if exists "Admins full access destinations" on public.destinations;
drop policy if exists "Admins full access reviews" on public.reviews;
drop policy if exists "Admins full access inquiries" on public.inquiries;
drop policy if exists "Admins full access site_settings" on public.site_settings;
drop policy if exists "Admins full access homepage_sections" on public.homepage_sections;

-- Public read policies
create policy "Public can view active cars" on public.cars for select using (is_active = true);
create policy "Public can view active routes" on public.routes for select using (is_active = true);
create policy "Public can view route prices" on public.route_prices for select using (true);
create policy "Public can view published destinations" on public.destinations for select using (is_published = true);
create policy "Public can view published reviews" on public.reviews for select using (is_published = true);
create policy "Public can view site settings" on public.site_settings for select using (true);
create policy "Public can view homepage sections" on public.homepage_sections for select using (true);

-- Public inquiry submission policy
create policy "Public can insert inquiries" on public.inquiries for insert with check (status = 'New');

-- Authenticated Admin full CRUD policies
create policy "Admins full access profiles" on public.profiles for all to authenticated using (true) with check (true);
create policy "Admins full access cars" on public.cars for all to authenticated using (true) with check (true);
create policy "Admins full access routes" on public.routes for all to authenticated using (true) with check (true);
create policy "Admins full access route_prices" on public.route_prices for all to authenticated using (true) with check (true);
create policy "Admins full access destinations" on public.destinations for all to authenticated using (true) with check (true);
create policy "Admins full access reviews" on public.reviews for all to authenticated using (true) with check (true);
create policy "Admins full access inquiries" on public.inquiries for all to authenticated using (true) with check (true);
create policy "Admins full access site_settings" on public.site_settings for all to authenticated using (true) with check (true);
create policy "Admins full access homepage_sections" on public.homepage_sections for all to authenticated using (true) with check (true);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (for car photos and destination assets)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('travel-assets', 'travel-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public Access travel-assets" on storage.objects;
create policy "Public Access travel-assets" on storage.objects for select
using (bucket_id = 'travel-assets');

drop policy if exists "Admin Upload travel-assets" on storage.objects;
create policy "Admin Upload travel-assets" on storage.objects for insert to authenticated
with check (bucket_id = 'travel-assets');

drop policy if exists "Admin Update travel-assets" on storage.objects;
create policy "Admin Update travel-assets" on storage.objects for update to authenticated
using (bucket_id = 'travel-assets');

drop policy if exists "Admin Delete travel-assets" on storage.objects;
create policy "Admin Delete travel-assets" on storage.objects for delete to authenticated
using (bucket_id = 'travel-assets');

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

-- Add all tables to supabase_realtime publication
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array['cars', 'routes', 'route_prices', 'destinations', 'reviews', 'homepage_sections', 'site_settings', 'inquiries'])
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end;
$$;

-- Performance indexes
create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_inquiries_travel_date on public.inquiries(travel_date desc);
create index if not exists idx_inquiries_created_at on public.inquiries(created_at desc);
create index if not exists idx_cars_display_order on public.cars(display_order);
create index if not exists idx_routes_display_order on public.routes(display_order);

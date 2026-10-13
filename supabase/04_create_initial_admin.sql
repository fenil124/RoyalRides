-- ==============================================================================
-- ROYALRIDES TRAVELS - SECURE INITIAL ADMIN PROVISIONING SCRIPT
-- File: supabase/04_create_initial_admin.sql
--
-- Description:
--   Securely provisions or promotes an administrator account in Supabase.
--   Per requirements:
--     1. Standard user signups are NEVER granted 'admin' by default.
--     2. Administrators must be explicitly promoted or provisioned.
--
-- How to Use:
--   Option A (Recommended): Create the user in Supabase Dashboard > Authentication > Users,
--   then run Part 1 below to assign the admin role.
--
--   Option B: Run the automated block in Part 2 below to provision both the
--   auth credentials and admin profile in one transaction.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- OPTION A: PROMOTE AN EXISTING AUTH USER TO ADMIN
-- Run this after creating the user in Supabase Dashboard > Authentication > Users:
-- ------------------------------------------------------------------------------

-- Step 1: Update the user's role to 'admin' in public.profiles
update public.profiles
set
  role = 'admin',
  full_name = coalesce(nullif(full_name, 'Customer'), 'RoyalRides Administrator'),
  updated_at = now()
where email = 'admin@royalrides.com'; -- Replace with your desired admin email

-- ------------------------------------------------------------------------------
-- OPTION B: DIRECT SQL PROVISIONING (Idempotent, Safe)
-- Run this if you want to create the admin user directly via the SQL Editor.
-- NOTE: Change the password to a strong production secret before running!
-- ------------------------------------------------------------------------------

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_admin_email text := 'admin@royalrides.com'; -- Desired Admin Email
  v_admin_pwd   text := 'RoyalRides@Secure2026!'; -- Change to your secure password!
  v_admin_name  text := 'RoyalRides Administrator';
  v_user_id     uuid;
begin
  -- Check if user already exists in auth.users
  select id into v_user_id from auth.users where email = v_admin_email;

  if v_user_id is null then
    -- Generate new deterministic or random UUID for admin
    v_user_id := gen_random_uuid();

    -- Insert into auth.users with confirmed email
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token
    ) values (
      '00000000-0000-0000-0000-000000000000'::uuid,
      v_user_id,
      'authenticated',
      'authenticated',
      v_admin_email,
      extensions.crypt(v_admin_pwd, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_admin_name),
      now(),
      now(),
      ''
    );

    -- Insert into auth.identities
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_admin_email),
      'email',
      v_admin_email,
      now(),
      now(),
      now()
    );

    raise notice 'Created new admin user in auth.users with ID: %', v_user_id;
  else
    raise notice 'Admin user % already exists in auth.users with ID: %', v_admin_email, v_user_id;
  end if;

  -- Ensure public.profiles entry exists and has role 'admin'
  insert into public.profiles (id, email, full_name, role, updated_at)
  values (v_user_id, v_admin_email, v_admin_name, 'admin', now())
  on conflict (id) do update set
    role = 'admin',
    full_name = v_admin_name,
    updated_at = now();

  raise notice 'Successfully granted role "admin" to %', v_admin_email;
end;
$$;

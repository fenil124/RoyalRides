import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  if (
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.VITE_DEMO_MODE === 'true'
  ) {
    return false;
  }
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseUrl.includes('placeholder-project') &&
    !supabaseKey.includes('placeholder')
  );
};

export const serverSupabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

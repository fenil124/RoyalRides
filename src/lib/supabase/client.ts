import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = () => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return false;
  }
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseUrl.includes('placeholder-project') &&
    !supabaseKey.includes('placeholder')
  );
};

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(supabaseUrl, supabaseKey);
  return browserClient;
}

export const supabase = isSupabaseConfigured() ? createClient() : null;

import { createBrowserClient } from '@supabase/ssr';

const getEnv = (key: string, nextKey?: string): string => {
  const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  return (
    metaEnv[key] ||
    (nextKey ? metaEnv[nextKey] : '') ||
    procEnv[key] ||
    (nextKey ? procEnv[nextKey] : '') ||
    ''
  );
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey =
  getEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
  getEnv('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = () => {
  const isDemo = getEnv('VITE_DEMO_MODE', 'NEXT_PUBLIC_DEMO_MODE') === 'true';
  if (isDemo) {
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

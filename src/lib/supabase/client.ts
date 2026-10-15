import { createBrowserClient } from '@supabase/ssr';

const getCleanEnv = (key: string, nextKey?: string): string => {
  const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {}) as Record<string, string | undefined>;
  const procEnv = (typeof process !== 'undefined' && process.env ? process.env : {}) as Record<string, string | undefined>;

  const raw =
    metaEnv[key] ||
    (nextKey ? metaEnv[nextKey] : undefined) ||
    procEnv[key] ||
    (nextKey ? procEnv[nextKey] : undefined) ||
    '';

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (
      trimmed.length >= 2 &&
      ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))
    ) {
      return trimmed.slice(1, -1).trim();
    }
    return trimmed;
  }
  return '';
};

const supabaseUrl = getCleanEnv('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey =
  getCleanEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
  getCleanEnv('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = () => {
  const isDemo = getCleanEnv('VITE_DEMO_MODE', 'NEXT_PUBLIC_DEMO_MODE') === 'true';
  if (isDemo) {
    return false;
  }
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }
  // Must be a valid HTTP or HTTPS URL
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    return false;
  }
  return (
    !supabaseUrl.includes('placeholder-project') &&
    !supabaseKey.includes('placeholder')
  );
};

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (browserClient) return browserClient;
  try {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey);
    return browserClient;
  } catch (err) {
    console.warn('Supabase browser client initialization warning:', err);
    return null;
  }
}

export const supabase = isSupabaseConfigured() ? createClient() : null;

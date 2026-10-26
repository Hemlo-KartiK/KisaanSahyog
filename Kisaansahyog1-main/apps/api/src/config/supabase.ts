import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY
)?.trim();

const isPlaceholder = (val?: string) =>
  !val ||
  val.includes('your-project') ||
  val.includes('your-anon-key') ||
  val.includes('your-service-role-key') ||
  !val.startsWith('http');

let supabase: SupabaseClient | null = null;

if (
  supabaseUrl &&
  supabaseServiceKey &&
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseServiceKey)
) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    supabase = null;
  }
}

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error(
      'Supabase credentials missing or unconfigured. Set valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in apps/api/.env',
    );
  }
  return supabase;
};

export const getSupabaseClientSafe = (): SupabaseClient | null => supabase;

export const isSupabaseConfigured = (): boolean => Boolean(supabase);

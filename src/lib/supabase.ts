import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for the LIMON identity site (Phase 2).
 *
 * The site shares the existing MeetBook Supabase project. Only the
 * public-safe publishable key ships in the bundle — all writes are
 * gated server-side by RLS (public.is_admin() / insert checks), so
 * this key can never do more than a visitor could do by hand.
 *
 * This module is always loaded via dynamic import() so supabase-js
 * stays out of the public first-load bundle.
 */
const SUPABASE_URL = 'https://ouyuijpxhhvtnxnvavza.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-hldx2wyXfAjxFLAZf4sHA_uu72VfTn';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return client;
}

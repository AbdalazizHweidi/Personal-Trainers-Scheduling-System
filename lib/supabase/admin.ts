import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * ADMIN-ONLY Supabase client — uses the service role key, which bypasses
 * Row Level Security entirely.
 *
 * ⚠️ Server-only. Never import into a Client Component, never expose
 * SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix.
 *
 * Why it exists now: without a real session, the anon-key client can't
 * satisfy is_admin() in our RLS policies, so every admin query would
 * return empty. This unblocks admin work immediately, and stays the
 * right client to use even after auth lands — just make sure every
 * route that imports it is actually gated by getCurrentUser() below.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
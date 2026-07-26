import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Configure it in .env.local and the deployment environment."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Configure this server-only variable in .env.local and Vercel."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function createPrivilegedClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient();
  }

  return createServerClient();
}
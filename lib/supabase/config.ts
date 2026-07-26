export function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Configure it in .env.local and the deployment environment."
    );
  }

  return supabaseUrl;
}

export function getSupabasePublishableKey() {
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Configure it in .env.local and the deployment environment."
    );
  }

  return publishableKey;
}

export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const url = new URL(siteUrl);
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(
      "Invalid NEXT_PUBLIC_SITE_URL. Configure it with a full URL such as http://localhost:3000."
    );
  }
}
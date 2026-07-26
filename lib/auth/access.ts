import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "client" | "admin";

export type AuthProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
};

function isAppRole(value: unknown): value is AppRole {
  return value === "client" || value === "admin";
}

export async function getAuthenticatedUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, user: null, profile: null as AuthProfile | null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !isAppRole(profile.role)) {
    return { supabase, user, profile: null as AuthProfile | null };
  }

  return {
    supabase,
    user,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role,
    },
  };
}

export async function requireAdminAccess() {
  const { user, profile } = await getAuthenticatedUserAndProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (!profile) {
    redirect("/auth/login?error=profile_missing");
  }

  if (profile.role === "client") {
    redirect("/dashboard");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return { user, profile };
}

export async function requireDashboardAccess() {
  const { user, profile } = await getAuthenticatedUserAndProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (!profile) {
    redirect("/auth/login?error=profile_missing");
  }

  if (profile.role !== "client" && profile.role !== "admin") {
    redirect("/auth/login?error=profile_invalid");
  }

  return { user, profile };
}
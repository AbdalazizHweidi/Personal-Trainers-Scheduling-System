import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  full_name: string;
  email: string;
  role: "client" | "admin";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return {
    id: user.id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role as "client" | "admin",
  };
}
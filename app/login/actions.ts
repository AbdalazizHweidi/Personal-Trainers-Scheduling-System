"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectTo)}`
    );
  }

  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "Could not create account")}&tab=signup`
    );
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user!.id,
    full_name: fullName,
    email,
    role: "client",
  });

  if (profileError) {
    redirect(
      `/login?error=${encodeURIComponent("Account created, but profile setup failed. Contact support.")}&tab=signup`
    );
  }

  redirect(redirectTo);
}
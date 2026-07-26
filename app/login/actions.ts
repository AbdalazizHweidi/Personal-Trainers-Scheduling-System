"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const requestedRedirect = formData.get("redirect") as string | null;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "Invalid credentials")}&redirect=${encodeURIComponent(
        requestedRedirect ?? "/dashboard"
      )}&email=${encodeURIComponent(email)}`
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user!.id)
    .single();

  // Admins always land on the admin dashboard, regardless of a stale ?redirect= param
  if (profile?.role === "admin") {
    redirect("/admin");
  }

  redirect(requestedRedirect || "/dashboard");
}

export async function signup(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const preserved = `&tab=signup&fullName=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`;

  if (password !== confirmPassword) {
    redirect(`/login?error=${encodeURIComponent("Passwords don't match.")}${preserved}`);
  }

  const supabase = await createClient();

  // Profile creation is handled by a DB trigger (handle_new_user) on auth.users insert —
  // NOT done here, since RLS can reject a client-side insert before the session is live
  // (e.g. when email confirmation is required and no session exists yet post-signup).
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}${preserved}`);
  }

  if (!data.user) {
    redirect(
      `/login?error=${encodeURIComponent("Something went wrong creating your account. Please try again.")}${preserved}`
    );
  }

  // With email confirmation enabled, signUp() does not return an active session —
  // send them to log in after confirming, rather than assuming they're authenticated.
  if (!data.session) {
    redirect(
      `/login?tab=login&message=${encodeURIComponent(
        "Check your email to confirm your account, then log in."
      )}&email=${encodeURIComponent(email)}`
    );
  }

  // Email confirmation is disabled on this project — session exists immediately.
  redirect("/dashboard");
}
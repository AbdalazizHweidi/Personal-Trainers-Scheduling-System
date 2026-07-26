"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { forbidden, redirect } from "next/navigation";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function buildSignupPreservedParams(fullName: string, email: string) {
  return `tab=signup&fullName=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`;
}

export async function login(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const requestedRedirect = formData.get("redirect") as string | null;
  const safeRedirect = getSafeRedirectPath(requestedRedirect, "/dashboard");

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password are required.")}&email=${encodeURIComponent(email)}`);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "Invalid credentials")}&redirect=${encodeURIComponent(
        safeRedirect
      )}&email=${encodeURIComponent(email)}`
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user!.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirect(
      `/login?error=${encodeURIComponent(
        "Your account is missing a profile. Ask an administrator to run the auth profile restore SQL."
      )}&email=${encodeURIComponent(email)}`
    );
  }

  if (profile.role !== "client" && profile.role !== "admin") {
    await supabase.auth.signOut();
    forbidden();
  }

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  redirect(safeRedirect === "/admin" ? "/dashboard" : safeRedirect);
}

export async function signup(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const preserved = buildSignupPreservedParams(fullName, email);

  if (!fullName || !email || !password || !confirmPassword) {
    redirect(`/login?error=${encodeURIComponent("All signup fields are required.")}&${preserved}`);
  }

  if (!email.includes("@")) {
    redirect(`/login?error=${encodeURIComponent("Enter a valid email address.")}&${preserved}`);
  }

  if (password.length < 8) {
    redirect(`/login?error=${encodeURIComponent("Password must be at least 8 characters.")}&${preserved}`);
  }

  if (password !== confirmPassword) {
    redirect(`/login?error=${encodeURIComponent("Passwords don't match.")}&${preserved}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    const safeMessage = error.status === 429 ? "Too many signup attempts. Please wait and try again." : error.message;
    redirect(`/login?error=${encodeURIComponent(safeMessage)}&${preserved}`);
  }

  if (!data.user) {
    redirect(
      `/login?error=${encodeURIComponent("Something went wrong creating your account. Please try again.")}&${preserved}`
    );
  }

  if (!data.session) {
    redirect(
      `/login?tab=login&error=${encodeURIComponent(
        "Check your email to confirm your account, then log in."
      )}&email=${encodeURIComponent(email)}`
    );
  }

  redirect("/dashboard");
}
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function signOutAndRedirect(request: Request) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.redirect(new URL("/auth/login?error=logout_failed", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/auth/login", request.url), { status: 303 });
}

export async function GET(request: Request) {
  return signOutAndRedirect(request);
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}
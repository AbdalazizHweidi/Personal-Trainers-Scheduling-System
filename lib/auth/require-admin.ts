import { NextResponse } from "next/server";
import { getAuthenticatedUserAndProfile } from "@/lib/auth/access";

export async function requireAdmin() {
  const { user, profile } = await getAuthenticatedUserAndProfile();

  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!profile) {
    return { user: null, response: NextResponse.json({ error: "Profile missing" }, { status: 401 }) };
  }

  if (profile.role !== "admin") {
    return { user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return {
    user: {
      id: user.id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role,
    },
    response: null as null,
  };
}
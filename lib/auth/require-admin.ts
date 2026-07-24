import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null as null };
}
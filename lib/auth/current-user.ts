import { getAuthenticatedUserAndProfile } from "@/lib/auth/access";

export type CurrentUser = {
  id: string;
  full_name: string;
  email: string;
  role: "client" | "admin";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { user, profile } = await getAuthenticatedUserAndProfile();

  if (!user || !profile) return null;

  return {
    id: user.id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role as "client" | "admin",
  };
}
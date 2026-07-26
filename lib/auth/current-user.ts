/**
 * TEMPORARY mock — replace once real authentication is wired up.
 *
 * Swap this for a real session lookup (Supabase Auth's getUser() +
 * a `profiles` row fetch). Every component below consumes this through
 * the CurrentUser type, so the swap should only touch this file.
 */
export type CurrentUser = {
  id: string;
  full_name: string;
  role: "client" | "admin";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // TODO(auth): replace with real session lookup once teammate's work lands.
  return {
    id: "00000000-0000-0000-0000-000000000000",
    full_name: "Admin (mock)",
    role: "admin",
  };
}
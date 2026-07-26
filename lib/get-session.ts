import { getAuthenticatedUserAndProfile } from "@/lib/auth/access"
import type { Profile } from "@/lib/types"

export async function getSession() {
  const { user, profile } = await getAuthenticatedUserAndProfile()

  return { user, profile: (profile as Profile) ?? null }
}

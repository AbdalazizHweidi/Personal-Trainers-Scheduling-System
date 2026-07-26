import { type NextRequest } from "next/server";
import { handleAuthConfirmation } from "@/lib/auth/confirm";

export async function GET(request: NextRequest) {
  return handleAuthConfirmation(request);
}
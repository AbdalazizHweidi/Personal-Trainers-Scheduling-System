import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServicesByTrainer } from "@/lib/queries/services";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const supabase = createAdminClient();
  const services = await getServicesByTrainer(supabase, Number(id));
  return NextResponse.json({ services });
}
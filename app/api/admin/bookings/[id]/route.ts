import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const { status } = await req.json();
  const supabase = createAdminClient();

  // Triggers sync_slot_status(), which reopens the linked availability slot
  // automatically on cancellation — no manual slot update needed here.
  const { error } = await supabase.from("bookings").update({ status }).eq("id", Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
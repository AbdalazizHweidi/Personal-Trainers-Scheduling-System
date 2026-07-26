import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createPrivilegedClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const { status } = await req.json();
  const supabase = await createPrivilegedClient();

  const { error } = await supabase.from("availability_slots").update({ status }).eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const supabase = await createPrivilegedClient();

  const { error } = await supabase
    .from("availability_slots")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
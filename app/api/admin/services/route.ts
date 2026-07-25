import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const supabase = createAdminClient();

  const { error } = await supabase.from("services").insert({
    trainer_id: body.trainer_id,
    name: body.name,
    type: body.type,
    duration_minutes: body.duration_minutes,
    price: body.price,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
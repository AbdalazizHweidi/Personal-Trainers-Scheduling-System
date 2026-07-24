import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const supabase = createAdminClient();

  const { error } = await supabase.from("availability_slots").insert({
    trainer_id: body.trainer_id,
    slot_date: body.slot_date,
    start_time: body.start_time,
    end_time: body.end_time,
    status: "open",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
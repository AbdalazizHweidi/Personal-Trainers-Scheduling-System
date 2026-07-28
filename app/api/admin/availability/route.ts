import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();

  if (
    !body.trainer_id ||
    !body.slot_date ||
    !body.start_time ||
    !body.end_time
  ) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }
  
  if (body.start_time >= body.end_time) {
    return NextResponse.json(
      { error: "End time must be after start time." },
      { status: 400 }
    );
  }
  const today = new Date().toISOString().split("T")[0];

  if (body.slot_date < today) {
    return NextResponse.json(
      { error: "Cannot create availability in the past." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Prevent overlapping slots for the same trainer and date.
  const { data: overlapping, error: checkError } = await supabase
    .from("availability_slots")
    .select("id")
    .eq("trainer_id", body.trainer_id)
    .eq("slot_date", body.slot_date)
    .is("deleted_at", null)
    .lt("start_time", body.end_time)
    .gt("end_time", body.start_time);

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 400 });
  }
  if (overlapping && overlapping.length > 0) {
    return NextResponse.json(
      { error: "This trainer already has an overlapping slot." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("availability_slots").insert({
    trainer_id: body.trainer_id,
    slot_date: body.slot_date,
    start_time: body.start_time,
    end_time: body.end_time,
    status: "open",
    is_recurring: Boolean(body.is_recurring),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { client_id, trainer_id, service_id, slot_id } = await req.json();
  if (!client_id || !trainer_id || !service_id || !slot_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: slot, error: slotError } = await supabase
    .from("availability_slots")
    .select("id, trainer_id, slot_date, start_time, end_time, status")
    .eq("id", slot_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (slotError) return NextResponse.json({ error: slotError.message }, { status: 400 });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  if (slot.trainer_id !== trainer_id) {
    return NextResponse.json({ error: "Slot does not belong to this trainer" }, { status: 400 });
  }
  if (slot.status !== "open") {
    return NextResponse.json({ error: "This slot is no longer open" }, { status: 409 });
  }

  // Insert triggers sync_slot_status — marks the slot "booked" automatically.
  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      client_id,
      trainer_id,
      service_id,
      slot_id,
      session_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  return NextResponse.json({ booking }, { status: 201 });
}
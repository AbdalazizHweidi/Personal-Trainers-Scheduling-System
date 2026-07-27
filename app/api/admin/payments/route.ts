import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { booking_id, amount, method, cardholder_name } = await req.json();
  if (!booking_id || !amount || !method) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("id", booking_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 400 });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status !== "pending") {
    return NextResponse.json({ error: `This booking is "${booking.status}", not awaiting payment.` }, { status: 409 });
  }

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("booking_id", booking_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingPayment) {
    return NextResponse.json({ error: "This booking already has a payment recorded." }, { status: 409 });
  }

  const { error: insertError } = await supabase.from("payments").insert({
    booking_id,
    amount,
    method,
    cardholder_name: cardholder_name || null, // only meaningful for card_in_person
    status: "success",
    paid_at: new Date().toISOString(),
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const { error: updateError } = await supabase.from("bookings").update({ status: "confirmed" }).eq("id", booking_id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
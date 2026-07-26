import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const bookingId = Number(id);
  if (Number.isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const { refund } = await req.json();
  const supabase = createAdminClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("id", bookingId)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (!["pending", "confirmed"].includes(booking.status)) {
    return NextResponse.json({ error: `This booking is already "${booking.status}".` }, { status: 409 });
  }

  // Trigger already reopens the linked availability slot on this status change.
  const { error: updateError } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  if (refund) {
    const { data: payment, error: payFetchError } = await supabase
      .from("payments")
      .select("id, status, refunded")
      .eq("booking_id", bookingId)
      .is("deleted_at", null)
      .maybeSingle();

    if (payFetchError) return NextResponse.json({ error: payFetchError.message }, { status: 400 });

    if (payment && payment.status === "success" && !payment.refunded) {
      const { error: refundError } = await supabase.from("payments").update({ refunded: true }).eq("id", payment.id);
      if (refundError) return NextResponse.json({ error: refundError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
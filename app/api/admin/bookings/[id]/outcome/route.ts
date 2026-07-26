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

  const { outcome } = await req.json();
  if (!["completed", "no_show"].includes(outcome)) {
    return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, session_date, start_time")
    .eq("id", bookingId)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (booking.status !== "confirmed") {
    return NextResponse.json(
      { error: `Only confirmed bookings can be marked. This one is "${booking.status}".` },
      { status: 409 }
    );
  }

  const sessionStart = new Date(`${booking.session_date}T${booking.start_time}`);
  if (sessionStart.getTime() > Date.now()) {
    return NextResponse.json({ error: "This session hasn't happened yet." }, { status: 409 });
  }

  const { error: updateError } = await supabase.from("bookings").update({ status: outcome }).eq("id", bookingId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
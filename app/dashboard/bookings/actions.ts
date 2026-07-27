"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingForOwner, cancelBookingWrite } from "@/lib/queries/bookings";
import { isCancelled } from "@/lib/queries/client-data";
import { sendBookingCancelledEmail } from "@/lib/email/send";
import { revalidatePath } from "next/cache";

function hoursUntil(sessionDate: string, startTime: string): number {
  const sessionDateTime = new Date(`${sessionDate}T${startTime}`);
  return (sessionDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
}

export async function cancelBooking(bookingId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false as const, error: "You must be logged in." };

  const booking = await getBookingForOwner(supabase, bookingId, user.id);
  if (!booking) return { success: false as const, error: "Booking not found." };

  const hoursLeft = hoursUntil(booking.session_date, booking.start_time);
  if (isCancelled(booking.status) || booking.status === "completed" || hoursLeft <= 0) {
    return {
      success: false as const,
      error: "This session has already started or ended and can no longer be cancelled.",
    };
  }

  const refund = hoursLeft >= 24;

  const payment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments;

  try {
    await cancelBookingWrite(supabase, {
      bookingId,
      slotId: booking.slot_id,
      paymentId: payment?.id ?? null,
      refund,
    });

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const trainerName = (booking.trainers as any)?.full_name ?? "your trainer";
    const serviceName = (booking.services as any)?.name ?? "your session";
    const price = payment?.amount ?? 0;

    if (user.email) {
      await sendBookingCancelledEmail(user.email, {
        clientName: profileRow?.full_name ?? "there",
        trainerName,
        serviceName,
        sessionDate: booking.session_date,
        startTime: booking.start_time,
        refunded: refund,
        price,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");

    return { success: true as const, refunded: refund };
  } catch (err) {
    console.error("CANCEL BOOKING ERROR:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}
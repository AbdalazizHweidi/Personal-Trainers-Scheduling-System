"use server";

import { createClient } from "@/lib/supabase/server";
import { getBookingForOwner, rescheduleBookingWrite } from "@/lib/queries/bookings";
import { isCancelled } from "@/lib/queries/client-data";
import { revalidatePath } from "next/cache";

export async function rescheduleBooking(params: {
  bookingId: number;
  newSlotId: number;
  newDate: string;
  newStartTime: string;
  durationMinutes: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false as const, error: "You must be logged in." };

  const booking = await getBookingForOwner(supabase, params.bookingId, user.id);
  if (!booking) return { success: false as const, error: "Booking not found." };

  const hoursLeft = (new Date(`${booking.session_date}T${booking.start_time}`).getTime() - Date.now()) / (1000 * 60 * 60);

  if (isCancelled(booking.status) || booking.status === "completed" || hoursLeft <= 0) {
    return { success: false as const, error: "This session has already started or ended and can no longer be rescheduled." };
  }

  // Policy: each booking may be rescheduled only once
  if ((booking.reschedule_count ?? 0) >= 1) {
    return {
      success: false as const,
      error: "This booking has already been rescheduled once. Cancel and create a new booking for further changes.",
    };
  }

  const [h, m] = params.newStartTime.split(":");
  const endHour = (parseInt(h, 10) + Math.ceil(params.durationMinutes / 60)) % 24;
  const newEndTime = `${String(endHour).padStart(2, "0")}:${m}`;

  try {
    await rescheduleBookingWrite(supabase, {
      bookingId: params.bookingId,
      oldSlotId: booking.slot_id,
      newSlotId: params.newSlotId,
      newDate: params.newDate,
      newStartTime: params.newStartTime,
      newEndTime,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");

    return { success: true as const };
  } catch (err) {
    console.error("RESCHEDULE ERROR:", err);
    return { success: false as const, error: "That slot may no longer be available. Please pick another." };
  }
}
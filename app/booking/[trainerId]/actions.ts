"use server";

import { createClient } from "@/lib/supabase/server";
import { createBooking, createPayment, markSlotBooked } from "@/lib/queries/bookings";
import { luhnCheck, isExpiryValid } from "@/lib/luhn";
import { revalidatePath } from "next/cache";

type SubmitBookingInput = {
  trainerId: number;
  serviceId: number;
  slotId: number | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  amount: number;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
};

export async function submitBooking(input: SubmitBookingInput) {
  // Server-side re-validation — never trust the client's checks alone
  if (!luhnCheck(input.cardNumber)) {
    return { success: false as const, error: "Invalid card number." };
  }

  if (!isExpiryValid(input.expiry)) {
    return { success: false as const, error: "Card has expired or the expiry date is invalid." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in to book a session." };
  }

  try {
    const booking = await createBooking(supabase, {
      clientId: user.id,
      trainerId: input.trainerId,
      serviceId: input.serviceId,
      slotId: input.slotId,
      sessionDate: input.sessionDate,
      startTime: input.startTime,
      endTime: input.endTime,
    });

    const last4 = input.cardNumber.replace(/\D/g, "").slice(-4);

    await createPayment(supabase, {
      bookingId: booking.id,
      amount: input.amount,
      cardholderName: input.cardholderName,
      cardLast4: last4,
    });

    if (input.slotId) {
      await markSlotBooked(supabase, input.slotId);
    }

    revalidatePath(`/trainers/${input.trainerId}`);

    return { success: true as const, booking };
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}
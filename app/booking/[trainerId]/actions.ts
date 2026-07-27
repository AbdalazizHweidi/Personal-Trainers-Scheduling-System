"use server";

import { createClient } from "@/lib/supabase/server";
import { createBooking, createPayment, markSlotBooked } from "@/lib/queries/bookings";
import { luhnCheck, isExpiryValid } from "@/lib/luhn";
import { sendBookingConfirmedEmail } from "@/lib/email/send";
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
  if (!luhnCheck(input.cardNumber)) {
    return { success: false as const, error: "Invalid card number." };
  }

  if (!isExpiryValid(input.expiry)) {
    return { success: false as const, error: "Card has expired or the expiry date is invalid." };
  }

  // Prevent booking a slot that's already in the past
  const sessionDateTime = new Date(`${input.sessionDate}T${input.startTime}`);
  if (sessionDateTime.getTime() <= Date.now()) {
    return { success: false as const, error: "That time slot is in the past. Please pick another." };
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

    // Fetch names for the confirmation email + client's profile
    const [{ data: trainerRow }, { data: serviceRow }, { data: profileRow }] = await Promise.all([
      supabase.from("trainers").select("full_name").eq("id", input.trainerId).single(),
      supabase.from("services").select("name").eq("id", input.serviceId).single(),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);

    if (user.email) {
      await sendBookingConfirmedEmail(user.email, {
        clientName: profileRow?.full_name ?? "there",
        trainerName: trainerRow?.full_name ?? "your trainer",
        serviceName: serviceRow?.name ?? "your session",
        sessionDate: input.sessionDate,
        startTime: input.startTime,
      });
    }

    revalidatePath(`/trainers/${input.trainerId}`);

    return { success: true as const, booking };
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    return { success: false as const, error: "Something went wrong. Please try again." };
  }
}
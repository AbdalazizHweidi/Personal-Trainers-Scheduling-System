import { SupabaseClient } from "@supabase/supabase-js";

export async function createBooking(
  supabase: SupabaseClient,
  params: {
    clientId: string;
    trainerId: number;
    serviceId: number;
    slotId: number | null;
    sessionDate: string;
    startTime: string;
    endTime: string;
  }
) {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      client_id: params.clientId,
      trainer_id: params.trainerId,
      service_id: params.serviceId,
      slot_id: params.slotId,
      session_date: params.sessionDate,
      start_time: params.startTime,
      end_time: params.endTime,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createPayment(
  supabase: SupabaseClient,
  params: { bookingId: number; amount: number; cardholderName: string; cardLast4: string }
) {
  const { error } = await supabase.from("payments").insert({
    booking_id: params.bookingId,
    amount: params.amount,
    cardholder_name: params.cardholderName,
    card_last4: params.cardLast4,
    status: "success",
    paid_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function markSlotBooked(supabase: SupabaseClient, slotId: number) {
  const { error } = await supabase
    .from("availability_slots")
    .update({ status: "booked" })
    .eq("id", slotId);

  if (error) throw error;
}

export async function getBookingForOwner(supabase: SupabaseClient, bookingId: number, clientId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, trainer_id, service_id, slot_id, session_date, start_time, end_time, status, reschedule_count, client_id,
       services ( duration_minutes ),
       payments ( id, amount, refunded )`
    )
    .eq("id", bookingId)
    .eq("client_id", clientId)
    .single();

  if (error) throw error;
  return data;
}

export async function rescheduleBookingWrite(
  supabase: SupabaseClient,
  params: {
    bookingId: number;
    oldSlotId: number | null;
    newSlotId: number;
    newDate: string;
    newStartTime: string;
    newEndTime: string;
  }
) {
  if (params.oldSlotId) {
    await supabase.from("availability_slots").update({ status: "open" }).eq("id", params.oldSlotId);
  }

  const { error: slotError } = await supabase
    .from("availability_slots")
    .update({ status: "booked" })
    .eq("id", params.newSlotId)
    .eq("status", "open");

  if (slotError) throw slotError;

  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      session_date: params.newDate,
      start_time: params.newStartTime,
      end_time: params.newEndTime,
      slot_id: params.newSlotId,
      reschedule_count: 1,
    })
    .eq("id", params.bookingId);

  if (bookingError) throw bookingError;
}

export async function cancelBookingWrite(
  supabase: SupabaseClient,
  params: { bookingId: number; slotId: number | null; paymentId: number | null; refund: boolean }
) {
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({ status: "cancelled_by_client" })
    .eq("id", params.bookingId);

  if (bookingError) throw bookingError;

  if (params.slotId) {
    await supabase.from("availability_slots").update({ status: "open" }).eq("id", params.slotId);
  }

  if (params.paymentId && params.refund) {
    await supabase.from("payments").update({ refunded: true }).eq("id", params.paymentId);
  }
}
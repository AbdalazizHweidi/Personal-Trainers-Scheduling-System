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
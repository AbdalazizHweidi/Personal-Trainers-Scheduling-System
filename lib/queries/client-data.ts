import { SupabaseClient } from "@supabase/supabase-js";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "cancelled_by_client";

export function isCancelled(status: BookingStatus): boolean {
  return status === "cancelled" || status === "cancelled_by_client";
}

export type ClientBooking = {
  id: number;
  trainerId: number;
  trainerName: string;
  trainerPhotoUrl: string | null;
  serviceName: string;
  durationMinutes: number;
  price: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  slotId: number | null;
  rescheduleCount: number;
};

export async function getAllBookingsForClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<ClientBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, trainer_id, session_date, start_time, end_time, status, slot_id, reschedule_count,
       trainers ( full_name, photo_url ),
       services ( name, price, duration_minutes )`
    )
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("session_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((b: any) => ({
    id: b.id,
    trainerId: b.trainer_id,
    trainerName: b.trainers?.full_name ?? "Unknown trainer",
    trainerPhotoUrl: b.trainers?.photo_url ?? null,
    serviceName: b.services?.name ?? "Session",
    durationMinutes: b.services?.duration_minutes ?? 60,
    price: Number(b.services?.price ?? 0),
    sessionDate: b.session_date,
    startTime: b.start_time,
    endTime: b.end_time,
    status: b.status,
    slotId: b.slot_id,
    rescheduleCount: b.reschedule_count ?? 0,
  }));
}

export async function getPaymentsForClient(supabase: SupabaseClient, clientId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `id, amount, cardholder_name, card_last4, status, refunded, paid_at,
       bookings!inner ( client_id, session_date, trainers ( full_name ) )`
    )
    .eq("bookings.client_id", clientId)
    .is("deleted_at", null)
    .order("paid_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    id: p.id,
    amount: Number(p.amount),
    cardholderName: p.cardholder_name,
    cardLast4: p.card_last4,
    status: p.status as "success" | "failed",
    refunded: p.refunded as boolean,
    paidAt: p.paid_at,
    trainerName: p.bookings?.trainers?.full_name ?? "Unknown trainer",
    sessionDate: p.bookings?.session_date,
  }));
}
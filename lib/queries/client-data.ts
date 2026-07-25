import { SupabaseClient } from "@supabase/supabase-js";

export async function getAllBookingsForClient(supabase: SupabaseClient, clientId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, session_date, start_time, status,
       trainers ( full_name ),
       services ( name, price )`
    )
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("session_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((b: any) => ({
    id: b.id,
    trainerName: b.trainers?.full_name ?? "Unknown trainer",
    serviceName: b.services?.name ?? "Session",
    price: Number(b.services?.price ?? 0),
    sessionDate: b.session_date,
    startTime: b.start_time,
    status: b.status as "pending" | "confirmed" | "completed" | "cancelled",
  }));
}

export async function getPaymentsForClient(supabase: SupabaseClient, clientId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `id, amount, cardholder_name, card_last4, status, paid_at,
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
    paidAt: p.paid_at,
    trainerName: p.bookings?.trainers?.full_name ?? "Unknown trainer",
    sessionDate: p.bookings?.session_date,
  }));
}
import { SupabaseClient } from "@supabase/supabase-js";
import { formatTime } from "@/lib/utils";

export type ScheduleRow = {
  id: number;
  time: string;
  trainerName: string;
  serviceName: string | null;
  status: "open" | "booked";
};

export async function getTodaysBoard(supabase: SupabaseClient): Promise<ScheduleRow[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: slots, error: slotsError } = await supabase
    .from("availability_slots")
    .select("id, start_time, trainers(full_name)")
    //.eq("slot_date", today)
    .is("deleted_at", null)
    .order("start_time", { ascending: true });

  if (slotsError) throw slotsError;
  if (!slots || slots.length === 0) return [];

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("slot_id, services(name)")
    .is("deleted_at", null)
    .in("slot_id", slots.map((s) => s.id));

  if (bookingsError) throw bookingsError;

  const serviceBySlot = new Map(
    (bookings ?? []).map((b: any) => [b.slot_id, b.services?.name ?? null])
  );

  return slots.map((slot: any): ScheduleRow => ({
    id: slot.id,
    time: formatTime(slot.start_time),
    trainerName: slot.trainers?.full_name ?? "TBD",
    serviceName: serviceBySlot.get(slot.id) ?? null,
    status: serviceBySlot.has(slot.id) ? "booked" : "open",
  }));
}
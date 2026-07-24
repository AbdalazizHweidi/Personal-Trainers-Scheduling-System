import { SupabaseClient } from "@supabase/supabase-js";

export type DayAvailability = {
  date: string;
  dayLabel: string;
  slots: { id: number; time: string; status: "open" | "blocked" | "booked" }[];
};

export async function getWeekAvailability(
  supabase: SupabaseClient,
  trainerId: number
): Promise<DayAvailability[]> {
  const today = new Date();
  const start = today.toISOString().slice(0, 10);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 6);
  const end = endDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, slot_date, start_time, status")
    .eq("trainer_id", trainerId)
    .gte("slot_date", start)
    .lte("slot_date", end)
    .is("deleted_at", null)
    .order("start_time", { ascending: true });

  if (error) throw error;

  const days: DayAvailability[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      slots: (data ?? [])
        .filter((s) => s.slot_date === dateStr)
        .map((s) => ({ id: s.id, time: s.start_time, status: s.status })),
    });
  }
  return days;
}
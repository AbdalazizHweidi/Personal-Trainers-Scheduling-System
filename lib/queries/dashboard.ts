import { SupabaseClient } from "@supabase/supabase-js";

export type BookingRow = {
  id: number;
  trainerName: string;
  serviceName: string;
  sessionDate: string;
  startTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

export type DashboardData = {
  firstName: string;
  nextSession: BookingRow | null;
  sessionsThisMonth: number;
  sessionsLastMonth: number;
  totalSpentThisMonth: number;
  savedTrainerCount: number;
  savedTrainerNames: string[];
  bookings: BookingRow[];
};

export async function getDashboardData(
  supabase: SupabaseClient,
  clientId: string,
  fullName: string
): Promise<DashboardData> {
  const { data: bookingsRaw, error } = await supabase
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

  const bookings: BookingRow[] = (bookingsRaw ?? []).map((b: any) => ({
    id: b.id,
    trainerName: b.trainers?.full_name ?? "Unknown trainer",
    serviceName: b.services?.name ?? "Session",
    sessionDate: b.session_date,
    startTime: b.start_time,
    status: b.status,
  }));

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);

  const nextSession =
    bookings
      .filter((b) => b.sessionDate >= today && b.status !== "cancelled")
      .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))[0] ?? null;

  const sessionsThisMonth = bookings.filter((b) => {
    const d = new Date(b.sessionDate + "T00:00:00");
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && b.status !== "cancelled";
  }).length;

  const sessionsLastMonth = bookings.filter((b) => {
    const d = new Date(b.sessionDate + "T00:00:00");
    return (
      d.getMonth() === lastMonthDate.getMonth() &&
      d.getFullYear() === lastMonthDate.getFullYear() &&
      b.status !== "cancelled"
    );
  }).length;

  const spentRaw = (bookingsRaw ?? []).filter((b: any) => {
    const d = new Date(b.session_date + "T00:00:00");
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && b.status !== "cancelled";
  });
  const totalSpentThisMonth = spentRaw.reduce(
    (sum: number, b: any) => sum + Number(b.services?.price ?? 0),
    0
  );

  const savedTrainerNames = Array.from(
    new Set(
      bookings
        .filter((b) => b.status === "confirmed" || b.status === "pending")
        .map((b) => b.trainerName)
    )
  );

  return {
    firstName: fullName.split(" ")[0] ?? fullName,
    nextSession,
    sessionsThisMonth,
    sessionsLastMonth,
    totalSpentThisMonth,
    savedTrainerCount: savedTrainerNames.length,
    savedTrainerNames,
    bookings,
  };
}
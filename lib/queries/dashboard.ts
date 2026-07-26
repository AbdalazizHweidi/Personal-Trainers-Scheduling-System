import { SupabaseClient } from "@supabase/supabase-js";
import { getAllBookingsForClient, isCancelled, type ClientBooking } from "./client-data";

export type DashboardData = {
  firstName: string;
  nextSession: ClientBooking | null;
  sessionsThisMonth: number;
  sessionsLastMonth: number;
  totalSpentThisMonth: number;
  savedTrainerCount: number;
  savedTrainerNames: string[];
  bookings: ClientBooking[];
};

export async function getDashboardData(
  supabase: SupabaseClient,
  clientId: string,
  fullName: string
): Promise<DashboardData> {
  const bookings = await getAllBookingsForClient(supabase, clientId);

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);

  const nextSession =
    bookings
      .filter((b) => b.sessionDate >= today && !isCancelled(b.status))
      .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))[0] ?? null;

  const sessionsThisMonth = bookings.filter((b) => {
    const d = new Date(b.sessionDate + "T00:00:00");
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear && !isCancelled(b.status);
  }).length;

  const sessionsLastMonth = bookings.filter((b) => {
    const d = new Date(b.sessionDate + "T00:00:00");
    return (
      d.getMonth() === lastMonthDate.getMonth() &&
      d.getFullYear() === lastMonthDate.getFullYear() &&
      !isCancelled(b.status)
    );
  }).length;

  const totalSpentThisMonth = bookings
    .filter((b) => {
      const d = new Date(b.sessionDate + "T00:00:00");
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear && !isCancelled(b.status);
    })
    .reduce((sum, b) => sum + b.price, 0);

  const savedTrainerNames = Array.from(
    new Set(bookings.filter((b) => b.status === "confirmed" || b.status === "pending").map((b) => b.trainerName))
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
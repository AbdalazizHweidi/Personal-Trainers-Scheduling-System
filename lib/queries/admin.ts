import { SupabaseClient } from "@supabase/supabase-js";

export type AdminStats = {
  sessionsToday: number;
  openSlotsToday: number;
  revenueThisWeek: number;
  newClientsThisWeek: number;
  utilization: number;
};

export async function getAdminStats(supabase: SupabaseClient): Promise<AdminStats> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  const [{ data: todaySlots }, { data: payments }, { data: newClients }] = await Promise.all([
    supabase.from("availability_slots").select("status").eq("slot_date", today).is("deleted_at", null),
    supabase.from("payments").select("amount").eq("status", "success").gte("paid_at", weekAgoStr).is("deleted_at", null),
    supabase.from("profiles").select("id").eq("role", "client").gte("created_at", weekAgoStr),
  ]);

  const slots = todaySlots ?? [];
  const booked = slots.filter((s) => s.status === "booked").length;
  const open = slots.filter((s) => s.status === "open").length;

  return {
    sessionsToday: booked,
    openSlotsToday: open,
    revenueThisWeek: (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0),
    newClientsThisWeek: (newClients ?? []).length,
    utilization: slots.length === 0 ? 0 : Math.round((booked / slots.length) * 100),
  };
}

export type TodayBookingRow = {
  id: number;
  time: string;
  clientName: string;
  trainerName: string;
  serviceName: string;
  status: string;
};

export async function getTodaysBookings(supabase: SupabaseClient): Promise<TodayBookingRow[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("bookings")
    .select("id, start_time, status, profiles(full_name), trainers(full_name), services(name)")
    .eq("session_date", today)
    .is("deleted_at", null)
    .order("start_time", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((b: any) => ({
    id: b.id,
    time: b.start_time,
    clientName: b.profiles?.full_name ?? "Unknown client",
    trainerName: b.trainers?.full_name ?? "Unknown trainer",
    serviceName: b.services?.name ?? "—",
    status: b.status,
  }));
}

export type RosterItem = { id: number; fullName: string; sessionsToday: number };

export async function getTrainerRoster(supabase: SupabaseClient): Promise<RosterItem[]> {
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: trainers }, { data: bookings }] = await Promise.all([
    supabase.from("trainers").select("id, full_name").eq("is_active", true).is("deleted_at", null),
    supabase.from("bookings").select("trainer_id").eq("session_date", today).is("deleted_at", null),
  ]);

  const countByTrainer = new Map<number, number>();
  (bookings ?? []).forEach((b) => countByTrainer.set(b.trainer_id, (countByTrainer.get(b.trainer_id) ?? 0) + 1));

  return (trainers ?? []).map((t) => ({
    id: t.id,
    fullName: t.full_name,
    sessionsToday: countByTrainer.get(t.id) ?? 0,
  }));
}

// ── Trainers (admin view — includes inactive) ──────────────────────────
export type AdminTrainer = {
  id: number;
  full_name: string;
  specialties: string[];
  is_active: boolean;
  avg_rating: number;
  photo_url: string | null;
};

export async function getAllTrainersAdmin(supabase: SupabaseClient): Promise<AdminTrainer[]> {
  const { data, error } = await supabase
    .from("trainers")
    .select("id, full_name, specialties, is_active, avg_rating, photo_url")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) throw error;
  return data;
}

// ── Bookings (admin view — all dates, all statuses) ─────────────────────
export type AdminBookingRow = {
  id: number;
  date: string;
  time: string;
  clientName: string;
  trainerName: string;
  serviceName: string;
  status: string;
};

export async function getAllBookings(
  supabase: SupabaseClient,
  filters: { status?: string; date?: string } = {}
): Promise<AdminBookingRow[]> {
  let query = supabase
    .from("bookings")
    .select("id, session_date, start_time, status, profiles(full_name), trainers(full_name), services(name)")
    .is("deleted_at", null)
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: true });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.date) query = query.eq("session_date", filters.date);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((b: any) => ({
    id: b.id,
    date: b.session_date,
    time: b.start_time,
    clientName: b.profiles?.full_name ?? "Unknown client",
    trainerName: b.trainers?.full_name ?? "Unknown trainer",
    serviceName: b.services?.name ?? "—",
    status: b.status,
  }));
}

// ── Availability (admin view) ────────────────────────────────────────────
export type AdminSlot = {
  id: number;
  trainerId: number;
  trainerName: string;
  date: string;
  time: string;
  status: "open" | "blocked" | "booked";
};

export async function getUpcomingAvailability(supabase: SupabaseClient): Promise<AdminSlot[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, trainer_id, slot_date, start_time, status, trainers(full_name)")
    .gte("slot_date", today)
    .is("deleted_at", null)
    .order("slot_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((s: any) => ({
    id: s.id,
    trainerId: s.trainer_id,
    trainerName: s.trainers?.full_name ?? "Unknown",
    date: s.slot_date,
    time: s.start_time,
    status: s.status,
  }));
}

// ── Clients ───────────────────────────────────────────────────────────────
export type AdminClient = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  bookingCount: number;
};

export async function getAllClients(supabase: SupabaseClient): Promise<AdminClient[]> {
  const [{ data: profiles, error: pErr }, { data: bookings, error: bErr }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, created_at").eq("role", "client"),
    supabase.from("bookings").select("client_id").is("deleted_at", null),
  ]);

  if (pErr) throw pErr;
  if (bErr) throw bErr;

  const countByClient = new Map<string, number>();
  (bookings ?? []).forEach((b) => countByClient.set(b.client_id, (countByClient.get(b.client_id) ?? 0) + 1));

  return (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name ?? "—",
    email: p.email ?? "—",
    createdAt: p.created_at,
    bookingCount: countByClient.get(p.id) ?? 0,
  }));
}
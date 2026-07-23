import { createClient } from "@/lib/supabase/server";

export type TrainerCard = {
  id: number;
  name: string;
  initials: string;
  color: string;
  role: string;
  specialties: string[];
  bio: string;
  tagVariant: "flame" | "moss" | "chalk" | "steel";
  tagLabel: string;
  credential: string;
};

export type TrainerProfile = TrainerCard & {
  fullBio: string;
  certifications: string[];
  rating: number;
  reviewCount: number;
  services: { name: string; sub: string; price: number }[];
  availability: {
    day: string;
    slots: { time: string; free: boolean }[];
    closed?: boolean;
  }[];
};

function accentFor(specialty: string | undefined) {
  const key = (specialty ?? "").toLowerCase();
  if (key.includes("strength")) return { color: "#3f6b48", variant: "moss" as const };
  if (key.includes("mobil")) return { color: "#ff5a1f", variant: "flame" as const };
  if (key.includes("perform")) return { color: "#c98f16", variant: "chalk" as const };
  return { color: "#5b6670", variant: "steel" as const };
}

function initialsFor(fullName: string) {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function formatTime(time: string) {
  const [hStr, m] = time.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "p" : "a";
  h = h % 12 || 12;
  return `${h}:${m}${suffix}`;
}

function currentWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const labels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, date: d.toISOString().slice(0, 10) };
  });
}

export async function getTrainers(): Promise<TrainerCard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainers")
    .select("id, full_name, specialties, bio, certifications")
    .eq("is_active", true)
    .is("deleted_at", null);

  if (error) throw error;

  return (data ?? []).map((t) => {
    const specialty = t.specialties?.[0] ?? "";
    const { color, variant } = accentFor(specialty);
    return {
      id: t.id,
      name: t.full_name,
      initials: initialsFor(t.full_name),
      color,
      role: specialty,
      specialties: t.specialties ?? [],
      bio: t.bio ?? "",
      tagVariant: variant,
      tagLabel: specialty,
      credential: t.certifications?.split(",")[0]?.trim() ?? "",
    };
  });
}

export async function getTrainerById(id: number): Promise<TrainerProfile | null> {
  const supabase = await createClient();

  const { data: trainer, error } = await supabase
    .from("trainers")
    .select("id, full_name, specialties, bio, certifications, avg_rating")
    .eq("id", id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (error || !trainer) return null;

  const [{ data: services }, { count: reviewCount }, { data: slots }] = await Promise.all([
    supabase
      .from("services")
      .select("name, type, duration_minutes, price")
      .eq("trainer_id", id)
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("trainer_id", id)
      .is("deleted_at", null),
    supabase
      .from("availability_slots")
      .select("slot_date, start_time, status")
      .eq("trainer_id", id)
      .is("deleted_at", null)
      .in(
        "slot_date",
        currentWeekDates().map((d) => d.date)
      ),
  ]);

  const specialty = trainer.specialties?.[0] ?? "";
  const { color, variant } = accentFor(specialty);
  const week = currentWeekDates();

  const availability = week.map(({ label, date }) => {
    const daySlots = (slots ?? []).filter((s) => s.slot_date === date);
    if (daySlots.length === 0) return { day: label, slots: [], closed: true };
    return {
      day: label,
      slots: daySlots.map((s) => ({
        time: formatTime(s.start_time),
        free: s.status === "open",
      })),
    };
  });

  return {
    id: trainer.id,
    name: trainer.full_name,
    initials: initialsFor(trainer.full_name),
    color,
    role: specialty,
    specialties: trainer.specialties ?? [],
    bio: trainer.bio ?? "",
    fullBio: trainer.bio ?? "",
    tagVariant: variant,
    tagLabel: specialty,
    credential: trainer.certifications?.split(",")[0]?.trim() ?? "",
    certifications: trainer.certifications?.split(",").map((c) => c.trim()) ?? [],
    rating: Number(trainer.avg_rating ?? 0),
    reviewCount: reviewCount ?? 0,
    services: (services ?? []).map((s) => ({
      name: s.name,
      sub: `${s.duration_minutes} minutes${s.type !== "1-on-1" ? ` · ${s.type}` : ""}`,
      price: Number(s.price),
    })),
    availability,
  };
}
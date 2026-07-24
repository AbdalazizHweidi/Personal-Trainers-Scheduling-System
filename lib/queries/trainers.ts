import { SupabaseClient } from "@supabase/supabase-js";

export type FeaturedTrainer = {
  id: number;
  full_name: string;
  specialties: string[];
  avg_rating: number;
  photo_url: string | null;
};

export async function getFeaturedTrainers(supabase: SupabaseClient, limit = 4): Promise<FeaturedTrainer[]> {
  const { data, error } = await supabase
    .from("trainers")
    .select("id, full_name, specialties, avg_rating, photo_url")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("avg_rating", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export type Trainer = {
  id: number;
  full_name: string;
  specialties: string[];
  bio: string | null;
  certifications: string | null;
  avg_rating: number;
  photo_url: string | null;
};

export async function getAllTrainers(
  supabase: SupabaseClient,
  specialty?: string
): Promise<Trainer[]> {
  let query = supabase
    .from("trainers")
    .select("id, full_name, specialties, bio, certifications, avg_rating, photo_url")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("avg_rating", { ascending: false });

  if (specialty) {
    query = query.contains("specialties", [specialty]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTrainerById(supabase: SupabaseClient, id: number): Promise<Trainer | null> {
  const { data, error } = await supabase
    .from("trainers")
    .select("id, full_name, specialties, bio, certifications, avg_rating, photo_url")
    .eq("id", id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data;
}